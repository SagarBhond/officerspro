package com.adminbackend.service;

import com.adminbackend.dto.HelpAndSupportDto;
import com.adminbackend.entity.RoleEnum;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders; // ✅ CORRECT!

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;
import com.adminbackend.repository.UserRepository;  // ✅ Import UserRepository

import java.util.List;
import java.util.Map;


@Service
public class DashboardService {
    @Autowired
    private HttpServletRequest request;



    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;  // ✅ Inject UserRepository to get user count from DB directly


//    private final String cmsBaseUrl = "http://localhost:8082";
//    private static final String CMS_BASE_URL = "http://localhost:8082/api/victim";

    private final String cmsBaseUrl = "http://localhost:3000";
    private static final String CMS_BASE_URL = "http://localhost:3000/api/victim";


    public Long getTotalUsers() {
        try {
            // ✅ Fixed the incorrect endpoint path here
            //return restTemplate.getForObject(cmsBaseUrl + "/api/victim/total-users", Long.class);
            // ✅ Directly fetch user count from database for real-time accurate count
            return userRepository.count();
        } catch (Exception e) {
            // Log error and return a default value or throw a custom exception
            return 0L;
        }
    }

    public long getTotalAllStatements() {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders()); // ❌ No token

            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsBaseUrl + "/api/admin/cases/total",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );

            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return 0L;
        }
    }

    public Long getTotalOfficers(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Authorization header missing or invalid");
            }

            // Add Authorization header
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.AUTHORIZATION, authHeader);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // Make the REST call to CMS backend to get officer count
            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsBaseUrl + "/api/victim/total-officers",  // ✅ corrected full path
                    HttpMethod.GET,
                    entity,
                    Long.class
            );

            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return 0L;
        }
    }

    public Long getTotalManagers() {
        try {
            return (long) userRepository.countByRole(RoleEnum.MANAGER);
        } catch (Exception e) {
            return 0L;
        }
    }

//    public Long getActivePlans() {
//        try {
//            return planRepository.countByStatus("ACTIVE");
//        } catch (Exception e) {
//            return 0L;
//        }
//    }
//
//    public Long getInactivePlans() {
//        try {
//            return planRepository.countByStatus("INACTIVE");
//        } catch (Exception e) {
//            return 0L;
//        }
//    }
@Autowired
private UserService userService; // Inject UserService to access its method

    public Long getHelpAndSupportCount() {
        try {
            List<HelpAndSupportDto> list = userService.getAllHelpAndSupport(); // Reuse method
            return (long) list.size();
        } catch (Exception e) {
            e.printStackTrace();
            return 0L;
        }
    }

    //start end
    public long getActivePlans(String authHeader) {

        /*
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }

        // Add Authorization header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Make the REST call to CMS backend to get officer count
        ResponseEntity<Long> response = restTemplate.exchange(
                CMS_BASE_URL + "/count/active",  // ✅ corrected full path
                HttpMethod.GET,
                entity,
                Long.class
        );

        return response.getBody();


         */
        return restTemplate.getForObject(CMS_BASE_URL + "/count/active", Long.class);
    }

    public long getInactivePlans(String authHeader) {

        /*
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }

        // Add Authorization header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Make the REST call to CMS backend to get officer count
        ResponseEntity<Long> response = restTemplate.exchange(
                CMS_BASE_URL + "/count/inactive",  // ✅ corrected full path
                HttpMethod.GET,
                entity,
                Long.class
        );

        return response.getBody();


         */
        return restTemplate.getForObject(CMS_BASE_URL + "/count/inactive", Long.class);
    }

    public double getTotalRevenue(String authHeader) {

        /*
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }

        // Add Authorization header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Make the REST call to CMS backend to get officer count
        ResponseEntity<Long> response = restTemplate.exchange(
                CMS_BASE_URL + "/revenue/total",  // ✅ corrected full path
                HttpMethod.GET,
                entity,
                Long.class
        );

        return response.getBody();

         */
        return restTemplate.getForObject(CMS_BASE_URL + "/revenue/total", Double.class);
    }

    public double getExpectedRevenue(String authHeader) {

        /*
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }

        // Add Authorization header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Make the REST call to CMS backend to get officer count
        ResponseEntity<Long> response = restTemplate.exchange(
                CMS_BASE_URL + "/revenue/expected",  // ✅ corrected full path
                HttpMethod.GET,
                entity,
                Long.class
        );

        return response.getBody();


         */
        return restTemplate.getForObject(CMS_BASE_URL + "/revenue/expected", Double.class);
    }



}
