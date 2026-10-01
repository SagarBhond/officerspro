package com.adminbackend.controller;

import com.adminbackend.config.UserAuthProvider;
import com.adminbackend.dto.*;
import com.adminbackend.entity.RefreshToken;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.service.EntitlementService;
import com.adminbackend.service.ProfileService;
import com.adminbackend.service.RefreshTokenService;
import com.adminbackend.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    private final UserAuthProvider userAuthProvider;
    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private ProfileService profileService;


    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody CredentialsDto credentialsDto) {
        UserDto userDto = userService.login(credentialsDto);

        userDto.setToken(userAuthProvider.createToken(userDto.getEmail()));
        RefreshToken refreshToken = refreshTokenService.createRefeshToken(userDto.getEmail());
        userDto.setRefreshToken(refreshToken.getToken());
        return ResponseEntity.ok(userDto);
    }
    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UserDto> register(
            @RequestPart("signUpDto") SignUpDto signUpDto,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        System.out.println("🌟 Received SignUpDto: " + signUpDto);
        System.out.println("🌟 Received Role: " + signUpDto.getRole());
        UserDto userDto = userService.register(signUpDto);


        userDto.setToken(userAuthProvider.createToken(userDto.getEmail()));
        return ResponseEntity.ok(userDto);
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> requestMap) {
        String email = requestMap.get("email");
        UserDto userDto = userService.forgotPassword(email);
        userDto.setToken(userAuthProvider.createToken(userDto.getEmail()));
        userService.createResetPasswordLinkAndSendEmail(userDto);

        return ResponseEntity.ok(Map.of("status", "Mail Sent to your registered Email id"));
    }

    @PostMapping("/reset-password/{id}/{token}")
    public ResponseEntity<?> updatePassword(@PathVariable("id") String id, @PathVariable("token") String token,
                                            @RequestBody Map<String, String> requestMap) {
        String newPassword = requestMap.get("password");
        return handlePasswordReset(id, token, newPassword);
    }

    private ResponseEntity<?> handlePasswordReset(String id, String token, String newPassword) {

        UserDto userDto = userService.findUserById(Long.parseLong(id));
        if (userDto == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "User does not exist"));
        }

        userDto.setToken(token);
        Authentication authentication = userAuthProvider.validateToken(token);

        if (authentication.isAuthenticated()) {
            UserDto updatedUser = userService.updateUserPassword(userDto.getEmail(), newPassword);
            updatedUser.setToken(token);
            return ResponseEntity.ok(Map.of("email", updatedUser.getEmail(), "status", "verified"));
        } else {
            return ResponseEntity.ok(Map.of("email", userDto.getEmail(), "status", "Not verified"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        String token = refreshTokenService.findByToken(refreshTokenRequest.getToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newToken = userAuthProvider.createToken(user.getEmail());
                    System.out.println("New token: " + newToken); // Log the new token
                    return newToken;
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in the database"));

        return ResponseEntity.ok(token);
    }

    @PutMapping("/updateRole/{id}")
    public ResponseEntity<UserDto> createAdministrator(@PathVariable("id") Long id, @RequestBody UserDto userDto) {
        UserDto updatedUserDto = userService.updateUserRole(userDto, id);
        return ResponseEntity.ok(updatedUserDto);
    }

    @PutMapping("/demoteRole/{id}")
    public ResponseEntity<UserDto> assManagerToUser(@PathVariable("id") Long id, @RequestBody UserDto userDto) {
        UserDto updatedUserDto = userService.updateMangerRole(userDto, id);
        return ResponseEntity.ok(updatedUserDto);
    }

    @PutMapping("/demoteAdminRole/{id}")
    public ResponseEntity<UserDto> assAdminToManager(@PathVariable("id") Long id, @RequestBody UserDto userDto) {
        UserDto updatedUserDto = userService.demoteAdminRole(userDto, id);
        return ResponseEntity.ok(updatedUserDto);
    }
    @PutMapping("/updateAdminRole/{id}")
    public ResponseEntity<UserDto> assManagerToAdmin(@PathVariable("id") Long id, @RequestBody UserDto userDto) {
        UserDto updatedUserDto = userService.updateAdminRole(userDto, id);
        return ResponseEntity.ok(updatedUserDto);
    }

    @GetMapping("/fetchAllUser")
    public List<User> getAllUser() {
        return userService.fetchAllUser();
    }

    @DeleteMapping("/deleteUserOrManager/{id}")
    public void delete(@PathVariable("id") Long id){
        userService.deleteUserOrManager(id);
    }

    @PreAuthorize("hasAuthority('Add Officer:CREATE')")
    @PostMapping(value = "/registerOfficer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OfficerDto registerOfficer(@RequestParam("officerDto") String officerDtoJson,
                                      @RequestPart("files") MultipartFile[] files) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        OfficerDto officerDto = objectMapper.readValue(officerDtoJson, OfficerDto.class);
        officerDto = this.userService.officerRegistration(officerDto, files);
        return officerDto;
    }

  /* @PostMapping(value = "/registerOfficer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
   public ResponseEntity<?> registerOfficer(
           @RequestHeader("Authorization") String authHeader,
           @RequestParam("officerDto") String officerDtoJson,
           @RequestPart("files") MultipartFile[] files
   ) throws JsonProcessingException {

       // ✅ Step 1: Extract User ID and Role from JWT
       String token = authHeader.substring(7);
       Long userId = userAuthProvider.extractUserId(token);
       String role = userAuthProvider.extractRole(token);

       // ✅ Step 2: Check permission only if not ADMIN
       if (!"ADMIN".equalsIgnoreCase(role)) {
           boolean hasPermission = entitlementService.hasPermission(userId, "Add Officer", "create");
           if (!hasPermission) {
               return ResponseEntity.status(HttpStatus.FORBIDDEN)
                       .body("🚫 You don't have permission to create officers.");
           }
       }

       // ✅ Step 3: Convert officer JSON and call service
       ObjectMapper objectMapper = new ObjectMapper();
       OfficerDto officerDto = objectMapper.readValue(officerDtoJson, OfficerDto.class);
       officerDto = this.userService.officerRegistration(officerDto, files);

       return ResponseEntity.ok(officerDto);
   }*/

    @PreAuthorize("hasAuthority('Update Officer:UPDATE')")
    @PutMapping("/updateOfficer/{officerId}")
    public OfficerDto updateOfficer(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("officerId") String officerId,
            @RequestBody OfficerDto officerDto) {

        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        officerDto = this.userService.updateOfficer(officerId, officerDto, token).getBody();
        return officerDto;
    }

    @PreAuthorize("hasAuthority('Officer Table:READ')")
    @GetMapping("/getOfficers")
    public List<OfficerDto> getOfficer(){
    return this.userService.getOfficerList();
    }

    @DeleteMapping("/deleteOfficer/{officerId}")
    public ResponseEntity<Void> deleteOfficer(@PathVariable("officerId") String officerId) {
        userService.deleteOfficer(officerId);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('Officer Status :UPDATE')")
    @PutMapping("/enableOrDisableOfficer/{officerId}/{status}")
    public ResponseEntity<Boolean> enableOrDisableOfficer(@PathVariable("officerId") String officerId,
                                                          @PathVariable("status") String status) {
        if (!status.equals("enabled") && !status.equals("disabled")) {
            return ResponseEntity.badRequest().body(false);
        }
        Boolean result = userService.enableOrDisableOfficer(officerId, status);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/getSingleOfficer/{officerId}")
    public ResponseEntity<OfficerDto> getSingleOfficer(@PathVariable("officerId") String officerId) {
        try {
            OfficerDto officerDto = userService.getSingleOfficer(officerId);
            return new ResponseEntity<>(officerDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('Feedback:READ')")
    @GetMapping("/getFeedbackList")
    public ResponseEntity<List<FeedbackDto>> getSingleOfficer() {
        try {
            List<FeedbackDto> feedbacks = userService.getListOfFeedbacks();
            return new ResponseEntity<>(feedbacks, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PreAuthorize("hasAuthority('Help & Support:READ')")
    @GetMapping("/getAllHelpAndSupport")
    public ResponseEntity<List<HelpAndSupportDto>> getAllHelpAndSupport() {
        try {
            List<HelpAndSupportDto> helpAndSupportDtoList = userService.getAllHelpAndSupport();
            return new ResponseEntity<>(helpAndSupportDtoList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getByUuid/{uuid}")
    public ResponseEntity<HelpAndSupportDto> getHelpAndServiceByUuid(@PathVariable("uuid") String uuid) {
        try {
            HelpAndSupportDto helpAndSupportDto = userService.getHelpAndServiceByUuid(uuid);
            return new ResponseEntity<>(helpAndSupportDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/updateHelpAndSupportByUuid/{uuid}")
    public ResponseEntity<HelpAndSupportDto> updateHelpAndSupportByUuid(@PathVariable("uuid") String uuid, @RequestPart("helpAndSupportDto") String helpAndSupportDtoJson, @RequestParam(value = "issueImage",required = false) MultipartFile file) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            HelpAndSupportDto helpAndSupportDto = objectMapper.readValue(helpAndSupportDtoJson, HelpAndSupportDto.class);

            HelpAndSupportDto updatedHelpAndSupportDto = userService.updateHelpAndSupportByUuid(uuid,helpAndSupportDto, file);

            return new ResponseEntity<>(updatedHelpAndSupportDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/files")
    public ResponseEntity<InputStreamResource> downloadFile(@RequestParam("filePath") String filePath) {
        try {
            InputStreamResource fileResource = userService.downloadFile(filePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filePath)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileResource);
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching file: {}", filePath, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName(); // ✅ Email from token
        Object profileDto = profileService.getProfile(); // ✅ Profile service
        return ResponseEntity.ok(profileDto);
    }

    @PutMapping("/profile/update") // ✅ Add this
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','USER')")
    public ResponseEntity<String> updateProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        String email = authentication.getName(); // ✅ Email from token
        profileService.updateProfile(email, request); // ✅ Call service
        return ResponseEntity.ok("Profile updated successfully");
    }

}

