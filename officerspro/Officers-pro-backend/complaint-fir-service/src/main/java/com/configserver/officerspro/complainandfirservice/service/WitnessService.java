package com.configserver.officerspro.complainandfirservice.service;

import com.configserver.officerspro.complainandfirservice.dto.WitnessDTO;
import java.util.List;

public interface WitnessService {
    WitnessDTO addWitness(WitnessDTO witnessDTO);
    List<WitnessDTO> getWitnessesByFirId(String firId);
    WitnessDTO updateWitness(Integer witnessId, WitnessDTO witnessDTO);
    void deleteWitness(Integer witnessId);
}
