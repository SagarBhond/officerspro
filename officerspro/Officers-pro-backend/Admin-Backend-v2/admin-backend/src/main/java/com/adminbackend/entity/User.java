package com.adminbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String firstName;
    private String lastName;
    private String email;
    private String password;

    private String mobile; // 📱 New field
    private String profilePicture; // 🖼️ New field

    private LocalDateTime createdAt; // 🗓️ For registration date
    private LocalDateTime lastLogin; // ⏰ For last login tracking
//



    // Many-to-Many: User <-> Role
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Many-to-One: User → Manager
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    // One-to-Many: Manager → Users (bidirectional)
    @OneToMany(mappedBy = "manager")
    private Set<User> assignedUsers = new HashSet<>();

    // ✅ Many-to-One: User → Created By (Admin or Manager)
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    // ✅ One-to-Many: Admin/Manager → Created Users
    @OneToMany(mappedBy = "createdBy")
    private Set<User> createdUsers = new HashSet<>();

    public void addRole(Role role) {
        this.roles.add(role);
    }
}
