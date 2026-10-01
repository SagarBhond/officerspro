
package com.adminbackend.controller;

import com.adminbackend.config.UserAuthProvider;
import com.adminbackend.dto.BulkPermissionRequest;
import com.adminbackend.dto.EntitlementDto;
import com.adminbackend.service.EntitlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/entitlements")
@CrossOrigin(origins = "http://localhost:5174")
public class EntitlementController {

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private UserAuthProvider userAuthProvider;

   /* @GetMapping("/by-user")
    public ResponseEntity<List<EntitlementDto>> getEntitlementsCreatedByAdminToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        System.out.println("hiiiiiiiiiii");
        String token = authHeader.substring(7);
        Long adminId = userAuthProvider.extractUserId(token); // admin ID from token
        System.out.println("Extracted adminId = " + adminId);

        List<EntitlementDto> entitlements = entitlementService.getEntitlementsCreatedByAdmin(adminId);
        System.out.println("hello");
        return ResponseEntity.ok(entitlements);
    }*/
   @GetMapping("/by-user")
   public ResponseEntity<List<EntitlementDto>> getEntitlementsOfLoggedInUser(
           @RequestHeader("Authorization") String authHeader
   ) {
       String token = authHeader.substring(7);
       Long userId = userAuthProvider.extractUserId(token);

       List<EntitlementDto> entitlements = entitlementService.getEntitlementsByUserId(userId);
       return ResponseEntity.ok(entitlements);
   }

    @PostMapping
    public ResponseEntity<List<EntitlementDto>> saveEntitlements(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody List<EntitlementDto> entitlements
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        Long userId = userAuthProvider.extractUserId(token);

        // No need to extract role here anymore, service handles it internally
        List<EntitlementDto> response = entitlementService.saveOrUpdateEntitlements(entitlements, userId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<EntitlementDto>> saveEntitlementsForUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BulkPermissionRequest request
    ) {
        String token = authHeader.substring(7);
        Long createdById = userAuthProvider.extractUserId(token);

        List<EntitlementDto> response = entitlementService
                .saveOrUpdateEntitlementsForUsers(request.getEntitlements(), request.getUserIds(), createdById);

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteEntitlement(
            @RequestParam("userId") Long userId,
            @RequestParam("moduleName") String moduleName
    ) {
        entitlementService.deleteEntitlementByUserAndModule(userId, moduleName);
        return ResponseEntity.ok("Entitlement removed successfully.");
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<EntitlementDto>> getEntitlementsByUserId(@PathVariable("userId") Long userId) {
        List<EntitlementDto> entitlements = entitlementService.getEntitlementsByUserId(userId);
        return ResponseEntity.ok(entitlements);
    }

    @PostMapping("/assign-to-user")
    public ResponseEntity<EntitlementDto> assignToUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("userId") Long userId,
            @RequestParam("moduleName") String moduleName,
            @RequestBody EntitlementDto permissions
    ) {
        String token = authHeader.substring(7);
        Long creatorId = userAuthProvider.extractUserId(token);

        EntitlementDto result = entitlementService.assignModulePermissionToUser(userId, moduleName, permissions, creatorId);
        return ResponseEntity.ok(result);
    }



}
