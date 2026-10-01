package com.configserver.officerspro.complainandfirservice.service.impl;

import com.configserver.officerspro.complainandfirservice.dto.WitnessDTO;
import com.configserver.officerspro.complainandfirservice.entity.Citizen;
import com.configserver.officerspro.complainandfirservice.entity.FIR;
import com.configserver.officerspro.complainandfirservice.entity.FIRWitness;
import com.configserver.officerspro.complainandfirservice.repository.CitizenRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRWitnessRepository;
import com.configserver.officerspro.complainandfirservice.service.WitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WitnessServiceImpl implements WitnessService {

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private FIRRepository firRepository;

    @Autowired
    private FIRWitnessRepository firWitnessRepository;

    @Override
    public WitnessDTO addWitness(WitnessDTO witnessDTO) {
        try {
            // Create or find existing citizen
            Citizen citizen = new Citizen();
            citizen.setName(witnessDTO.getWitnessName());
            citizen.setEmail(witnessDTO.getWitnessEmail());
            citizen.setContactNo(witnessDTO.getWitnessMobileNo());
            citizen.setAddress(witnessDTO.getWitnessAddress());
            citizen.setAge(witnessDTO.getWitnessAge());
            citizen.setGender(witnessDTO.getWitnessGender());
            citizen.setProfession(witnessDTO.getWitnessProfession());
            citizen.setAadharNo(witnessDTO.getWitnessAadharNo());
            citizen.setAadharPath(witnessDTO.getAadharPath());
            citizen.setPanPath(witnessDTO.getPanPath());
            citizen.setPhotoPath(witnessDTO.getPhotoPath());
            citizen.setCreatedBy(1); // TODO: Get from security context
            citizen.setCreatedOn(LocalDateTime.now());

            citizen = citizenRepository.save(citizen);

            // Create FIR Witness link if FIR ID is provided
            if (witnessDTO.getFirId() != null) {
                FIR fir = firRepository.findById(witnessDTO.getFirId().toString()).orElse(null);
                if (fir != null) {
                    FIRWitness firWitness = new FIRWitness();
                    firWitness.setFir(fir);
                    firWitness.setCitizen(citizen);
                    firWitness.setRemarks(witnessDTO.getWitnessStatement());
                    firWitness.setCreatedBy(1); // TODO: Get from security context
                    firWitness.setCreatedOn(LocalDateTime.now());

                    firWitnessRepository.save(firWitness);
                }
            }

            return mapToDTO(citizen, witnessDTO.getFirId());
        } catch (Exception e) {
            throw new RuntimeException("Error adding witness: " + e.getMessage());
        }
    }

    @Override
    public List<WitnessDTO> getWitnessesByFirId(String firId) {
        return firWitnessRepository.findByFir_FirId(firId).stream()
                .map(firWitness -> mapToDTO(firWitness.getCitizen(), firId))
                .collect(Collectors.toList());
    }

    @Override
    public WitnessDTO updateWitness(Integer witnessId, WitnessDTO witnessDTO) {
        // Implementation for updating witness
        return null;
    }

    @Override
    public void deleteWitness(Integer witnessId) {
        // Implementation for deleting witness
    }

    private WitnessDTO mapToDTO(Citizen citizen, String firId) {
        return WitnessDTO.builder()
                .witnessId(citizen.getCitizenId())
                .witnessName(citizen.getName())
                .witnessEmail(citizen.getEmail())
                .witnessProfession(citizen.getProfession())
                .witnessGender(citizen.getGender())
                .witnessAddress(citizen.getAddress())
                .witnessAge(citizen.getAge())
                .witnessAadharNo(citizen.getAadharNo())
                .witnessMobileNo(citizen.getContactNo())
                .witnessStatement("") // This would need to be stored separately if needed
                .witnessType("witness")
                .firId(firId)
                .aadharPath(citizen.getAadharPath())
                .panPath(citizen.getPanPath())
                .photoPath(citizen.getPhotoPath())
                .build();
    }
}
