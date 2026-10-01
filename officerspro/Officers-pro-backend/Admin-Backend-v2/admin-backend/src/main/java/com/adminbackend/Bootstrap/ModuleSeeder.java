package com.adminbackend.Bootstrap;

import com.adminbackend.entity.Module;
import com.adminbackend.repository.ModuleRepository;
import jakarta.transaction.Transactional;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Order(1)    // run before RoleSeeder (@Order(2)) and AdminSeeder (@Order(3))
public class ModuleSeeder implements ApplicationListener<ContextRefreshedEvent> {

    private final ModuleRepository moduleRepo;

    public ModuleSeeder(ModuleRepository moduleRepo) {
        this.moduleRepo = moduleRepo;
    }

    @Override
    @Transactional
    public void onApplicationEvent(ContextRefreshedEvent event) {
        seedModules();
    }

    private void seedModules() {
        // Define all your modules here:
        Map<String,String> modules = Map.of(
                "Add Officer",      "Allows creating new officers",
                "Officer Table",    "List and search officers",
                "Help & Support",   "Manage support tickets",
                "Feedback",         "See user feedback",
                "Update Officer",   "Modify officer records"
                // …etc.
        );

        for (var entry : modules.entrySet()) {
            String name = entry.getKey();
            String desc = entry.getValue();

            Module existing = moduleRepo.findByNameIgnoreCase(name);
            if (existing == null) {
                Module m = new Module();
                m.setName(name);
                m.setDescription(desc);
                moduleRepo.save(m);
                System.out.println("✅ Seeded module “" + name + "”");
            }
        }
    }
}
