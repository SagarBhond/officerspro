package com.adminbackend.service;

import com.adminbackend.dto.PlanDto;
import com.adminbackend.entity.Plan;
import com.adminbackend.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanService {
    private final PlanRepository planRepository;

    public List<PlanDto> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PlanDto createPlan(PlanDto planDto) {
        Plan plan = convertToEntity(planDto);
        return convertToDto(planRepository.save(plan));
    }

    public PlanDto updatePlan(Long id, PlanDto planDto) {
        Plan existingPlan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        Plan plan = convertToEntity(planDto);
        plan.setId(id);
        return convertToDto(planRepository.save(plan));
    }

    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }

    private PlanDto convertToDto(Plan plan) {
        PlanDto dto = new PlanDto();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setPrice(plan.getPrice());
        dto.setDuration(plan.getDuration());
        dto.setDurationDays(plan.getDurationDays());
        dto.setFeatures(plan.getFeatures());
        return dto;
    }

    private Plan convertToEntity(PlanDto dto) {
        Plan plan = new Plan();
        plan.setName(dto.getName());
        plan.setPrice(dto.getPrice());
        plan.setDuration(dto.getDuration());
        plan.setDurationDays(dto.getDurationDays());
        plan.setFeatures(dto.getFeatures());
        return plan;
    }

    // PlanService.java
    public long countActivePlans() {
        return planRepository.countByActiveTrue();
    }

    public long countInactivePlans() {
        return planRepository.countByActiveFalse();
    }

    public double getTotalRevenue() {
        Double revenue = planRepository.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }

    public double getExpectedRevenue() {
        Double expectedRevenue = planRepository.getExpectedRevenue();
        return expectedRevenue != null ? expectedRevenue : 0.0;
    }

}
