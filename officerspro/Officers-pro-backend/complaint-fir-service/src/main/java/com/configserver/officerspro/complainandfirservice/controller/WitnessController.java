package com.configserver.officerspro.complainandfirservice.controller;

import com.configserver.officerspro.complainandfirservice.dto.WitnessDTO;
import com.configserver.officerspro.complainandfirservice.service.WitnessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/witnesses")
@Tag(name = "Witness Management", description = "APIs for managing witnesses")
//@CrossOrigin(origins = "*")
public class WitnessController {

    @Autowired
    private WitnessService witnessService;

    @PostMapping
    @Operation(summary = "Add a new witness", description = "Creates a new witness and links to FIR if provided")
    public ResponseEntity<WitnessDTO> addWitness(@RequestBody WitnessDTO witnessDTO) {
        try {
            WitnessDTO savedWitness = witnessService.addWitness(witnessDTO);
            return ResponseEntity.ok(savedWitness);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/fir/{firId}")
    @Operation(summary = "Get witnesses by FIR ID", description = "Retrieves all witnesses associated with a specific FIR")
    public ResponseEntity<List<WitnessDTO>> getWitnessesByFirId(@PathVariable String firId) {
        try {
            List<WitnessDTO> witnesses = witnessService.getWitnessesByFirId(firId);
            return ResponseEntity.ok(witnesses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
