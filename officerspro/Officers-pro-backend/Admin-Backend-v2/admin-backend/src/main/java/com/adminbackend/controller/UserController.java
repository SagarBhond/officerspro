package com.adminbackend.controller;
import com.adminbackend.dto.UserRoleRequest;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@CrossOrigin(
        origins = "http://localhost:5174",
        allowedHeaders = {"Authorization", "Content-Type"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/assign-role")
    public String assignRoleToUser(@RequestBody UserRoleRequest request) {
        return userService.assignRoleToUser(request.getEmail(), request.getRole());
    }


    @GetMapping("/roles")
    public ResponseEntity<List<String>> getUserRoles(@RequestParam("email") String email) {
        Set<String> roles = userService.getUserRolesByEmail(email);
        return ResponseEntity.ok(new ArrayList<>(roles)); // ✅ Fixed: Set to List
    }

    @GetMapping("/managers")
    public ResponseEntity<List<User>> getAllManagers() {
        return ResponseEntity.ok(userService.getAllManagers());
    }

    @GetMapping("/only-users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


}
