package com.fleetiq.controller;

import com.fleetiq.dto.InspectionDTOs.InspectionCreateRequest;
import com.fleetiq.dto.InspectionDTOs.InspectionDTO;
import com.fleetiq.service.InspectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<InspectionDTO>> getRecentInspections() {
        return ResponseEntity.ok(inspectionService.getAllRecentInspections());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<InspectionDTO>> getVehicleInspections(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(inspectionService.getVehicleInspectionHistory(vehicleId));
    }

    @PostMapping
    public ResponseEntity<InspectionDTO> submitInspection(@RequestBody InspectionCreateRequest request,
                                                         Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(inspectionService.submitInspection(request, username));
    }
}
