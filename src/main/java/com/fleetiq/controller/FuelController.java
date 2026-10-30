package com.fleetiq.controller;

import com.fleetiq.dto.FuelDTOs.FuelCreateRequest;
import com.fleetiq.dto.FuelDTOs.FuelDTO;
import com.fleetiq.dto.FuelDTOs.FuelEfficiencyComparisonDTO;
import com.fleetiq.service.FuelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
public class FuelController {

    private final FuelService fuelService;

    public FuelController(FuelService fuelService) {
        this.fuelService = fuelService;
    }

    @GetMapping
    public ResponseEntity<List<FuelDTO>> getAllFuelRecords() {
        return ResponseEntity.ok(fuelService.getAllFuelRecords());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelDTO>> getVehicleFuelHistory(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelService.getVehicleFuelHistory(vehicleId));
    }

    @GetMapping("/comparison")
    public ResponseEntity<List<FuelEfficiencyComparisonDTO>> getFuelComparison() {
        return ResponseEntity.ok(fuelService.getFuelEfficiencyComparison());
    }

    @PostMapping
    public ResponseEntity<FuelDTO> addFuelRecord(@RequestBody FuelCreateRequest request) {
        return ResponseEntity.ok(fuelService.addFuelRecord(request));
    }
}
