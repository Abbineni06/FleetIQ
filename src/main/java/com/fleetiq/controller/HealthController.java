package com.fleetiq.controller;

import com.fleetiq.dto.HealthDTOs.HealthScoreDTO;
import com.fleetiq.dto.HealthDTOs.HealthSummaryDTO;
import com.fleetiq.service.HealthScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthScoreService healthScoreService;

    public HealthController(HealthScoreService healthScoreService) {
        this.healthScoreService = healthScoreService;
    }

    @GetMapping("/summary")
    public ResponseEntity<HealthSummaryDTO> getFleetHealthSummary() {
        return ResponseEntity.ok(healthScoreService.getFleetHealthSummary());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<HealthScoreDTO> getVehicleHealth(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(healthScoreService.getLatestHealthScore(vehicleId));
    }

    @GetMapping("/vehicle/{vehicleId}/history")
    public ResponseEntity<List<HealthScoreDTO>> getVehicleHealthHistory(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(healthScoreService.getHealthHistory(vehicleId));
    }
}
