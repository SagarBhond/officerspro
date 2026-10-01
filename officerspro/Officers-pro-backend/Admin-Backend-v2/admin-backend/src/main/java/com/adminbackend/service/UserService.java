package com.adminbackend.service;
import com.adminbackend.dto.*;
import com.adminbackend.entity.Role;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.exception.AppException;
import com.adminbackend.exception.OfficerAlreadyExistsException;
import com.adminbackend.mapper.UserMapper;
import com.adminbackend.repository.RefreshTokenRepo;
import com.adminbackend.repository.RoleRepo;
import com.adminbackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.CharBuffer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor

public class UserService {

    @Value("${cms-service-url}")
    private String cmsServiceUrl;

    @Value("${reset.password.link}")
    private String resetPasswordLinkTemplate;

    @Value("${reset.password.subject}")
    private String resetPasswordSubject;

    @Value("${reset.password.body}")
    private String resetPasswordBodyTemplate;


    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepo roleRepo;
    private final RefreshTokenRepo refreshTokenRepo;
    private final RestTemplate restTemplate;
    private final KeycloakService keycloakService;
    private final EmailService emailService;



    @SneakyThrows
    public UserDto findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));

        UserDto userDto = userMapper.mapToUserDto(user);
        List<Role> myList = new ArrayList<>(user.getRoles());
        userDto.setRole(myList.get(0));
        return userDto;
    }

    @SneakyThrows
    public UserDto login(CredentialsDto credentialsDto) {
        User user = userRepository.findByEmail(credentialsDto.getEmail())
                .orElseThrow(() -> new AppException("Unknown user with email: " + credentialsDto.getEmail(), HttpStatus.NOT_FOUND));


        if (passwordEncoder.matches(CharBuffer.wrap(credentialsDto.getPassword()), user.getPassword())) {
            UserDto userDto = userMapper.mapToUserDto(user);
            List<Role> myList = new ArrayList<>(user.getRoles());
            userDto.setRole(myList.get(0));
            return userDto;
        }

        throw new AppException("Invalid password", HttpStatus.BAD_REQUEST);
    }

    @SneakyThrows
    public UserDto register(SignUpDto signUpDto) {
        Optional<User> optionalUser = userRepository.findByEmail((signUpDto.getEmail()));
//        Optional<Role> optionalRole = roleRepo.findByName(RoleEnum.USER);
        if (optionalUser.isPresent()) {
            throw new AppException("User with email " + signUpDto.getEmail() + " already exists", HttpStatus.BAD_REQUEST);
        }
//        if (optionalRole.isEmpty()) {
//            return null;

        // Get role from roleRepo
        RoleEnum requestedRole = RoleEnum.valueOf(signUpDto.getRole());
        Optional<Role> optionalRole = roleRepo.findByName(requestedRole);
        if (optionalRole.isEmpty()) {
            throw new AppException("Role not found: " + requestedRole.name(), HttpStatus.BAD_REQUEST);
        }

        // Map SignUpDto to User entity
        User user = userMapper.mapToUser(signUpDto);

        // Set password with encryption
        user.setPassword(passwordEncoder.encode(CharBuffer.wrap(signUpDto.getPassword())));

        // Set mobile, createdAt, lastLogin
        user.setMobile(signUpDto.getMobile());
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());

        // Set roles
        Set<Role> roles = new HashSet<>();
        roles.add(optionalRole.get());
        user.setRoles(roles);

        // Set createdBy (logged-in user as creator)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {


            String email;

            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDto userDto) {
                email = userDto.getEmail();
            } else {
                email = authentication.getName();
            }


            String creatorEmail = authentication.getName();

            creatorEmail = email;
            Optional<User> creatorUserOpt = userRepository.findByEmail(creatorEmail);
            if (creatorUserOpt.isPresent()) {
                user.setCreatedBy(creatorUserOpt.get());
            }
        }

        // Save user and return DTO
        User savedUser = userRepository.save(user);
        return userMapper.mapToUserDto(savedUser);
    }

    @SneakyThrows
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateUserRole(UserDto userDto, Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        Optional<Role> optionalRole = roleRepo.findByName(RoleEnum.MANAGER);
        if (optionalUser.isEmpty()) {
            throw new AppException("User with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
        if (optionalRole.isEmpty()) {
            throw new AppException("Role 'MANAGER' not found", HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();
        Set<Role> roles = new HashSet<>();
        roles.add(optionalRole.get());
        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return userMapper.mapToUserDto(savedUser);
    }

    @SneakyThrows
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateMangerRole(UserDto userDto, Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        Optional<Role> optionalRole = roleRepo.findByName(RoleEnum.USER);
        if (optionalUser.isEmpty()) {
            throw new AppException("User with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
        if (optionalRole.isEmpty()) {
            throw new AppException("Role 'MANAGER' not found", HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();
        Set<Role> roles = new HashSet<>();
        roles.add(optionalRole.get());
        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return userMapper.mapToUserDto(savedUser);
    }

    @SneakyThrows
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto demoteAdminRole(UserDto userDto, Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        Optional<Role> optionalRole = roleRepo.findByName(RoleEnum.MANAGER);
        if (optionalUser.isEmpty()) {
            throw new AppException("User with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
        if (optionalRole.isEmpty()) {
            throw new AppException("Role 'MANAGER' not found", HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();
        Set<Role> roles = new HashSet<>();
        roles.add(optionalRole.get());
        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return userMapper.mapToUserDto(savedUser);
    }

    @SneakyThrows
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateAdminRole(UserDto userDto, Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        Optional<Role> optionalRole = roleRepo.findByName(RoleEnum.ADMIN);
        if (optionalUser.isEmpty()) {
            throw new AppException("User with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
        if (optionalRole.isEmpty()) {
            throw new AppException("Role 'MANAGER' not found", HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();
        Set<Role> roles = new HashSet<>();
        roles.add(optionalRole.get());
        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return userMapper.mapToUserDto(savedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUserOrManager(Long id) {
        refreshTokenRepo.deleteByUserId(id);
        userRepository.deleteRolesByUserId(id);
        userRepository.deleteById(id);
    }

    @SneakyThrows
    public UserDto forgotPassword(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            throw new AppException("User with email " + email + " does not exists", HttpStatus.BAD_REQUEST);
        }
        User user = optionalUser.get();
        return userMapper.mapToUserDto(user);
    }

    public void createResetPasswordLinkAndSendEmail(UserDto userDto) {
        try {
            String link = String.format(resetPasswordLinkTemplate, userDto.getId(), userDto.getToken());
            String emailBody = String.format(resetPasswordBodyTemplate, link);
            emailService.sendEmail(userDto.getEmail(), resetPasswordSubject, emailBody);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    @SneakyThrows
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> fetchAllUser() {
        return userRepository.findAll();
    }

    @SneakyThrows
    public UserDto findUserById(long id) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            throw new AppException("User with id " + id + " does not exists", HttpStatus.BAD_REQUEST);
        }

        return userMapper.mapToUserDto(optionalUser.get());
    }

    public UserDto updateUserPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email).get();
        user.setPassword(passwordEncoder.encode(CharBuffer.wrap(newPassword)));
        User savedUser = userRepository.save((user));
        return userMapper.mapToUserDto(savedUser);
    }

    public OfficerDto officerRegistration(OfficerDto officerDto, MultipartFile[] files) {
        System.out.println("📩 officerRegistration method called");

        // Get the current authenticated admin's email
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = null;

        if (authentication != null && authentication.getPrincipal() instanceof UserDto) {
            UserDto userDto = (UserDto) authentication.getPrincipal();
            adminEmail = userDto.getEmail();
        } else if (authentication != null) {
            adminEmail = authentication.getName();
        }

        System.out.println("This is admin who registering user: " + adminEmail);

        // Set both adminEmail and registeredByAdminEmail in the DTO
        if (adminEmail != null && !adminEmail.isEmpty()) {
            officerDto.setRegisteredByAdminEmail(adminEmail);
            officerDto.setAdminEmail(adminEmail);
            System.out.println("👤 Setting admin email: " + adminEmail);
        } else {
            System.out.println("⚠️ Warning: No admin email found in authentication");
        }

        // Convert officerDto to JSON string to ensure proper serialization
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String officerDtoJson = objectMapper.writeValueAsString(officerDto);
            officerDto = objectMapper.readValue(officerDtoJson, OfficerDto.class);
        } catch (JsonProcessingException e) {
            System.err.println("❌ Error serializing officerDto: " + e.getMessage());
        }

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("officerDto", officerDto);
        System.out.println("📝 Added officerDto to parts: " + officerDto);

        for (MultipartFile file : files) {
            parts.add("files", file.getResource());
            System.out.println("📎 Added file to parts: " + file.getOriginalFilename());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        String token = keycloakService.getKeycloakAccessToken();
        System.out.println("🔐 Retrieved access token from Keycloak");

        headers.setBearerAuth(token);
        System.out.println("🔗 Set Bearer token in headers");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(parts, headers);
        System.out.println("📤 Sending POST request to CMS service: " + cmsServiceUrl + "/addNewOfficer");

        try {
            OfficerDto response = restTemplate.postForObject(cmsServiceUrl + "/addNewOfficer", requestEntity, OfficerDto.class);
            System.out.println("✅ Officer registered successfully, response: " + response);

            return response;
        } catch (HttpClientErrorException.Conflict ex) {
            System.err.println("❌ Conflict error while registering officer: " + ex.getMessage());
            throw new OfficerAlreadyExistsException("Officer with similar details already exists.");
        } catch (HttpClientErrorException ex) {
            System.err.println("❌ Client error while registering officer: " + ex.getMessage());
            throw ex;
        }
    }


 /*   public ResponseEntity<OfficerDto> updateOfficer(String officerId, OfficerDto officerDto) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<OfficerDto> requestEntity = new HttpEntity<>(officerDto, headers);

        return restTemplate.exchange(cmsServiceUrl + "/updateOfficer/" + officerId, HttpMethod.PUT, requestEntity, OfficerDto.class);
    }*/

    public ResponseEntity<OfficerDto> updateOfficer(String officerId, OfficerDto officerDto, String token) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        //headers.setBearerAuth(token); // ✅ Token directly from controller

        HttpEntity<OfficerDto> requestEntity = new HttpEntity<>(officerDto, headers);

        return restTemplate.exchange(
                cmsServiceUrl + "/updateOfficer/" + officerId,
                HttpMethod.PUT,
                requestEntity,
                OfficerDto.class
        );
    }


    public List<OfficerDto> getOfficerList() {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        return restTemplate.exchange(cmsServiceUrl + "/getOfficers", HttpMethod.GET, requestEntity, new ParameterizedTypeReference<List<OfficerDto>>() {
        }).getBody();
    }

    public void deleteOfficer(String officerId) {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        restTemplate.exchange(cmsServiceUrl + "/deleteOfficer/" + officerId, HttpMethod.DELETE, requestEntity, Void.class);
    }

    public OfficerDto getSingleOfficer(String officerId) {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        return restTemplate.exchange(cmsServiceUrl + "/getSingleOfficer/" + officerId, HttpMethod.GET, requestEntity, OfficerDto.class).getBody();

    }

    public Boolean enableOrDisableOfficer(String officerId, String status) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Boolean> response = restTemplate.exchange(
                    cmsServiceUrl + "/enableOrDisableOfficer/" + officerId + "/" + status,
                    HttpMethod.PUT,
                    requestEntity,
                    Boolean.class
            );
            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error occurred while connecting to cms-service: {}", e);
            return null;
        }
    }

    public List<FeedbackDto> getListOfFeedbacks() {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List<FeedbackDto>> response = restTemplate.exchange(
                    cmsServiceUrl + "/feedbackList",
                    HttpMethod.GET,
                    requestEntity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error occurred while fetching feedback list from cms-service: Status {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching feedback list: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    public List<HelpAndSupportDto> getAllHelpAndSupport() {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List<HelpAndSupportDto>> response = restTemplate.exchange(
                    cmsServiceUrl + "/getAllHelpAndSupport",
                    HttpMethod.GET,
                    requestEntity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error occurred while fetching Help & Support list from cms-service: Status {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching Help & Support list: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    public HelpAndSupportDto getHelpAndServiceByUuid(String uuid) {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<HelpAndSupportDto> response = restTemplate.exchange(
                    cmsServiceUrl + "/getByUuid/" + uuid,
                    HttpMethod.GET,
                    requestEntity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error occurred while fetching Help & Support with uuid " + uuid + " from cms-service: Status {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return null;
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching Help & Support with uuid " + uuid + " : {}", e.getMessage(), e);
            return null;
        }
    }

    public HelpAndSupportDto updateHelpAndSupportByUuid(String uuid, HelpAndSupportDto helpAndSupportDto, MultipartFile file) {

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("helpAndSupportDto", helpAndSupportDto);
        parts.add("files", file.getResource());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(parts, headers);

        try {
            ResponseEntity<HelpAndSupportDto> response = restTemplate.exchange(
                    cmsServiceUrl + "/updateHelpAndSupportByUuid/" + uuid,
                    HttpMethod.PUT,
                    requestEntity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error occurred while updating Help & Support with uuid {} from cms-service: Status {} - {}", uuid, e.getStatusCode(), e.getResponseBodyAsString(), e);
            return null;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating Help & Support with uuid {} : {}", uuid, e.getMessage(), e);
            return null;
        }
    }

    public InputStreamResource downloadFile(String filePath) {
        HttpHeaders headers = new HttpHeaders();
        String token = keycloakService.getKeycloakAccessToken();
        headers.setBearerAuth(token);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<InputStreamResource> response = restTemplate.exchange(
                    cmsServiceUrl + "/files?filePath=" + URLEncoder.encode(filePath, StandardCharsets.UTF_8),
                    HttpMethod.GET,
                    requestEntity,
                    InputStreamResource.class
            );

            return response.getBody();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error occurred while fetching file from cms-service: Status {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return null;
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching file: {}", e.getMessage(), e);
            return null;
        }
    }

    public String assignRoleToUser(String email, RoleEnum roleName) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return "User not found with email: " + email;
        }

        Optional<Role> optionalRole = roleRepo.findByName(roleName);
        if (optionalRole.isEmpty()) {
            return "Role not found: " + roleName.name();
        }

        User user = optionalUser.get();
        Role role = optionalRole.get();

        if (user.getRoles().contains(role)) {
            return "User already has role: " + roleName.name();
        }

        user.getRoles().add(role);
        userRepository.save(user);

        return "Role " + roleName.name() + " assigned to user " + email + " successfully.";
    }
    public Set<String> getUserRolesByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return user.getRoles().stream()
                    .map(role -> role.getName().name()) // enum to string
                    .collect(Collectors.toSet());
        }
        return Collections.emptySet(); // empty if user not found
    }

    public List<User> getAllManagers() {
        return userRepository.findAllManagers();
    }

    public List<User> getAllUsers() {
        return userRepository.findAllUsers();
    }


}
