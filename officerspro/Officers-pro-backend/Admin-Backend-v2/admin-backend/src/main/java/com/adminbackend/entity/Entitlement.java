package com.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
public class Entitlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnore
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    private String moduleName;
    @Column(nullable = false)
    private boolean canCreate = false;



    @Column(nullable = false)
    private boolean canRead = false;

    @Column(nullable = false)
    private boolean canUpdate = false;

    @Column(nullable = false)
    private boolean canDelete = false;

    @Column(nullable = false)
    private boolean canAssign = false;

    @Column(nullable = false)
    private boolean canView = false;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @Transient
    @JsonIgnore
    public Map<String, Boolean> getPermissions() {
        Map<String, Boolean> permissions = new HashMap<>();
        permissions.put("CREATE", this.canCreate);
        permissions.put("READ", this.canRead);
        permissions.put("UPDATE", this.canUpdate);
        permissions.put("DELETE", this.canDelete);
        permissions.put("ASSIGN", this.canAssign);
        permissions.put("VIEW", this.canView);
        return permissions;
    }

}
