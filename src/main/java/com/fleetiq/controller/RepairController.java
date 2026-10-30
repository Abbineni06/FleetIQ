package com.fleetiq.controller;

import com.fleetiq.dto.RepairDTOs.RepairCreateRequest;
import com.fleetiq.dto.RepairDTOs.RepairDTO;
import com.fleetiq.dto.RepairDTOs.RepairStatusUpdateRequest;
import com.fleetiq.service.RepairService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairService repairService;

    public RepairController(RepairService repairService) {
        this.repairService = repairService;
    }

    @GetMapping
    public ResponseEntity<List<RepairDTO>> getAllRepairs() {
        return ResponseEntity.ok(repairService.getAllRepairs());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<RepairDTO>> getVehicleRepairs(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(repairService.getVehicleRepairHistory(vehicleId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RepairDTO> recordRepair(@RequestBody RepairCreateRequest request) {
        return ResponseEntity.ok(repairService.recordRepair(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RepairDTO> updateRepairStatus(@PathVariable Long id, @RequestBody RepairStatusUpdateRequest request) {
        return ResponseEntity.ok(repairService.updateRepairStatus(id, request));
    }
}
