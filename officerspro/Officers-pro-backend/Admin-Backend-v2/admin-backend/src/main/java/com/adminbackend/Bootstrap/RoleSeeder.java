package com.adminbackend.Bootstrap;

import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.Role;
import com.adminbackend.repository.RoleRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
@Component
@Order(2)
public class RoleSeeder implements ApplicationListener<ContextRefreshedEvent> {
    @Autowired
    private  RoleRepo roleRepo;


//    public RoleSeeder(RoleRepo roleRepo) {
//        this.roleRepo = roleReposi;
//    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        this.loadRoles();
    }
    @Transactional
    private void loadRoles() {
        RoleEnum[] roleNames = new RoleEnum[] { RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.MANAGER};
        Map<RoleEnum, String> roleDescriptionMap = Map.of(
                RoleEnum.USER, "Default user role",
                RoleEnum.ADMIN, "Super Administrator role",
                RoleEnum.MANAGER, "Administrator role"
        );

        Arrays.stream(roleNames).forEach((roleName) -> {
            Optional<Role> optionalRole = roleRepo.findByName(roleName);

            optionalRole.ifPresentOrElse(System.out::println, () -> {
                Role roleToCreate = new Role();
                roleToCreate.setName(roleName);
                roleToCreate.setDescription(roleDescriptionMap.get(roleName));

                roleRepo.save(roleToCreate);
            });
        });
    }
}

