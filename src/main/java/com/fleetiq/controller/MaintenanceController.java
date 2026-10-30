package com.fleetiq.controller;

import com.fleetiq.dto.MaintenanceDTOs.MaintenanceCreateRequest;
import com.fleetiq.dto.MaintenanceDTOs.MaintenanceDTO;
import com.fleetiq.dto.MaintenanceDTOs.PredictiveMaintenanceDTO;
import com.fleetiq.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<PredictiveMaintenanceDTO>> getPredictions() {
        return ResponseEntity.ok(maintenanceService.getAllPredictions());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceDTO>> getVehicleHistory(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getVehicleMaintenanceHistory(vehicleId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<MaintenanceDTO>> getRecentMaintenance() {
        return ResponseEntity.ok(maintenanceService.getAllRecentMaintenance());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> recordMaintenance(@RequestBody MaintenanceCreateRequest request) {
        return ResponseEntity.ok(maintenanceService.recordMaintenance(request));
    }
}
