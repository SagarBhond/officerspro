package com.configserverllp.officerspro.profileservice.service.impl;

import com.configserverllp.officerspro.profileservice.client.AuthServiceClient;
import com.configserverllp.officerspro.profileservice.dto.request.*;
import com.configserverllp.officerspro.profileservice.dto.response.AuthUserResponse;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerListResponse;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerResponse;
import com.configserverllp.officerspro.profileservice.entity.Officer;
import com.configserverllp.officerspro.profileservice.exception.InvalidInputException;
import com.configserverllp.officerspro.profileservice.exception.OfficerAlreadyExistsException;
import com.configserverllp.officerspro.profileservice.exception.OfficerNotFoundException;
import com.configserverllp.officerspro.profileservice.mapper.OfficerMapper;
import com.configserverllp.officerspro.profileservice.repository.OfficerRepository;
import com.configserverllp.officerspro.profileservice.service.OfficerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class OfficerServiceImpl implements OfficerService {

    private final OfficerRepository officerRepository;
    private final OfficerMapper officerMapper;
    @Autowired
    private AuthServiceClient authServiceClient;

//    @Override
//    public OfficerResponse createOfficer(CreateOfficerRequest request) {
//        log.info("Creating officer with email: {}", request.getOfficerEmail());
//
//        // Check if officer already exists
//        if (officerRepository.existsByOfficerEmail(request.getOfficerEmail())) {
//            throw new OfficerAlreadyExistsException(
//                    "Officer with email " + request.getOfficerEmail() + " already exists"
//            );
//        }
//
//        // Validate required fields
//        validateCreateRequest(request);
//
//        // Convert to entity and save
//        Officer officer = officerMapper.toEntity(request);
//        Officer savedOfficer = officerRepository.save(officer);
//
//        log.info("Officer created successfully with ID: {}", savedOfficer.getOfficerId());
//        return officerMapper.toResponse(savedOfficer);
//    }
//@Override
//public OfficerResponse createOfficer(CreateOfficerRequest request) {
//    // 1️⃣ Create auth user first
//    CreateAuthUserRequest authReq = new CreateAuthUserRequest();
//    authReq.setEmail(request.getOfficerEmail());
//    authReq.setFullName(request.getOfficerName());
//    authReq.setRole("OFFICER");
//
//    AuthUserResponse authUser = authServiceClient.createAuthUser(authReq);
//
//    // 2️⃣ Save profile
//    Officer officer = Officer.builder()
//            .officerName(request.getOfficerName())
//            .officerEmail(request.getOfficerEmail())
//            .officerGender(request.getOfficerGender())
//            .officerPost(request.getOfficerPost())
//            .officerStation(request.getOfficerStation())
//            .officerStatus(true)
//            .build();
//
//    officerRepository.save(officer);
//
//    // 3️⃣ Return combined response
//    return new OfficerResponse(officer, authUser.getUserId());
//}
@Override
public OfficerResponse createOfficer(CreateOfficerRequest request) {
    log.info("Creating officer with email: {}", request.getOfficerEmail());

    // 1️⃣ Check if officer already exists
    if (officerRepository.existsByOfficerEmail(request.getOfficerEmail())) {
        throw new OfficerAlreadyExistsException(
                "Officer with email " + request.getOfficerEmail() + " already exists"
        );
    }

    // 2️⃣ Validate required fields
    validateCreateRequest(request);

    // 3️⃣ Create Auth User (Keycloak)
    CreateAuthUserRequest authReq = new CreateAuthUserRequest();
    authReq.setEmail(request.getOfficerEmail());
    authReq.setFullName(request.getOfficerName());
    authReq.setPassword(request.getPassword()); // ✅ Added
    authReq.setRole("OFFICER");                 // ✅ Default role
    log.info("Calling Auth Service to create Keycloak user for: {}", authReq.getEmail());

    AuthUserResponse authUserResponse = authServiceClient.createAuthUser(authReq);
    log.info("Auth user created successfully with ID: {}", authUserResponse.getUserId());
// ✅ Clear password to avoid storing it
    request.setPassword(null);
    // 4️⃣ Save Officer Profile locally
    Officer officer = Officer.builder()
            .officerName(request.getOfficerName())
            .officerAge(request.getOfficerAge())
            .officerGender(request.getOfficerGender())
            .officerPost(request.getOfficerPost())
            .officerStation(request.getOfficerStation())
            .officerEmail(request.getOfficerEmail())
            .officerMobileNo(request.getOfficerMobileNo())
            .officerStatus(true)
            .adminEmail(request.getAdminEmail())
            .registeredByAdminEmail(request.getRegisteredByAdminEmail())
            .aadharDocumentId(request.getAadharDocumentId())
            .panDocumentId(request.getPanDocumentId())
            .passportDocumentId(request.getPassportDocumentId())
            .keycloakUserId(authUserResponse.getUserId())
            .build();

    officerRepository.save(officer);
    log.info("Officer saved successfully with ID: {}", officer.getOfficerId());

    // 5️⃣ Return combined response
    return new OfficerResponse(officer, authUserResponse.getUserId());
}

    @Override
    @Transactional(readOnly = true)
    public OfficerResponse getOfficerById(String officerId) {
        log.info("Fetching officer with ID: {}", officerId);

        Officer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new OfficerNotFoundException(
                        "Officer not found with ID: " + officerId
                ));

        // Update remaining days before returning
        officer.updateRemainingDays();

        return officerMapper.toResponse(officer);
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerResponse getOfficerByEmail(String officerEmail) {
        log.info("Fetching officer with email: {}", officerEmail);

        Officer officer = officerRepository.findByOfficerEmail(officerEmail)
                .orElseThrow(() -> new OfficerNotFoundException(
                        "Officer not found with email: " + officerEmail
                ));

        // Update remaining days before returning
        officer.updateRemainingDays();

        return officerMapper.toResponse(officer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfficerListResponse> getAllOfficers(
            Boolean status,
            String station,
            String post,
            String adminEmail,
            Pageable pageable) {
        
        log.info("Fetching officers with filters - status: {}, station: {}, post: {}, adminEmail: {}",
                status, station, post, adminEmail);

        Page<Officer> officers;

        // Apply filters based on parameters
        if (adminEmail != null && status != null) {
            officers = officerRepository.findByAdminEmailAndOfficerStatus(adminEmail, status, pageable);
        } else if (adminEmail != null) {
            officers = officerRepository.findByAdminEmail(adminEmail, pageable);
        } else if (status != null && station != null) {
            officers = officerRepository.findByOfficerStatusAndOfficerStation(status, station, pageable);
        } else if (status != null && post != null) {
            officers = officerRepository.findByOfficerStatusAndOfficerPost(status, post, pageable);
        } else if (status != null) {
            officers = officerRepository.findByOfficerStatus(status, pageable);
        } else if (station != null) {
            officers = officerRepository.findByOfficerStation(station, pageable);
        } else if (post != null) {
            officers = officerRepository.findByOfficerPost(post, pageable);
        } else {
            officers = officerRepository.findAll(pageable);
        }

        return officers.map(officerMapper::toListResponse);
    }

    @Override
    public OfficerResponse updateOfficer(String officerId, UpdateOfficerRequest request) {
        log.info("Updating officer with ID: {}", officerId);

        Officer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new OfficerNotFoundException(
                        "Officer not found with ID: " + officerId
                ));

        // Check email uniqueness if email is being updated
        if (request.getOfficerEmail() != null &&
                !request.getOfficerEmail().equals(officer.getOfficerEmail())) {
            if (officerRepository.existsByOfficerEmail(request.getOfficerEmail())) {
                throw new OfficerAlreadyExistsException(
                        "Officer with email " + request.getOfficerEmail() + " already exists"
                );
            }
        }

        // Update fields
        officerMapper.updateEntity(officer, request);
        Officer updatedOfficer = officerRepository.save(officer);

        log.info("Officer updated successfully with ID: {}", officerId);
        return officerMapper.toResponse(updatedOfficer);
    }

    @Override
    public OfficerResponse patchOfficer(String officerId, PatchOfficerRequest request) {
        log.info("Patching officer with ID: {}", officerId);

        Officer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new OfficerNotFoundException(
                        "Officer not found with ID: " + officerId
                ));

        // Apply partial updates
        if (request.getOfficerStatus() != null) {
            officer.setOfficerStatus(request.getOfficerStatus());
        }
        if (request.getOfficerPost() != null) {
            officer.setOfficerPost(request.getOfficerPost());
        }
        if (request.getOfficerStation() != null) {
            officer.setOfficerStation(request.getOfficerStation());
        }
        if (request.getOfficerMobileNo() != null) {
            officer.setOfficerMobileNo(request.getOfficerMobileNo());
        }

        Officer patchedOfficer = officerRepository.save(officer);

        log.info("Officer patched successfully with ID: {}", officerId);
        return officerMapper.toResponse(patchedOfficer);
    }

    @Override
    public void deleteOfficer(String officerId) {
        log.info("Deleting officer with ID: {}", officerId);

        Officer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new OfficerNotFoundException(
                        "Officer not found with ID: " + officerId
                ));

        // Soft delete - set status to false
        officer.setOfficerStatus(false);
        officerRepository.save(officer);

        log.info("Officer soft deleted successfully with ID: {}", officerId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfficerListResponse> searchOfficersByName(String name, Pageable pageable) {
        log.info("Searching officers by name: {}", name);

        if (name == null || name.trim().isEmpty()) {
            throw new InvalidInputException("Search name cannot be empty");
        }

        Page<Officer> officers = officerRepository.searchByOfficerName(name, pageable);
        return officers.map(officerMapper::toListResponse);
    }

    @Override
    public OfficerResponse updateSubscription(String officerId, UpdateSubscriptionRequest request) {
        log.info("Updating subscription for officer: {} to {}", officerId, request.getSubscriptionType());

        Officer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new OfficerNotFoundException("Officer not found with ID: " + officerId));

        // Update subscription type
        officer.setSubscriptionType(request.getSubscriptionType());
        
        // Save and return
        Officer updatedOfficer = officerRepository.save(officer);
        log.info("Subscription updated successfully for officer: {}", officerId);
        
        return officerMapper.toResponse(updatedOfficer);
    }

    // Private helper methods

    private void validateCreateRequest(CreateOfficerRequest request) {
        if (request.getOfficerName() == null || request.getOfficerName().trim().isEmpty()) {
            throw new InvalidInputException("Officer name is required");
        }
        if (request.getOfficerEmail() == null || request.getOfficerEmail().trim().isEmpty()) {
            throw new InvalidInputException("Officer email is required");
        }
        if (request.getOfficerMobileNo() == null || request.getOfficerMobileNo().trim().isEmpty()) {
            throw new InvalidInputException("Officer mobile number is required");
        }
        if (request.getOfficerPost() == null || request.getOfficerPost().trim().isEmpty()) {
            throw new InvalidInputException("Officer post is required");
        }
        if (request.getOfficerStation() == null || request.getOfficerStation().trim().isEmpty()) {
            throw new InvalidInputException("Officer station is required");
        }
    }
}
