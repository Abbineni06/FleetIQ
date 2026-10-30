package com.fleetiq.controller;

import com.fleetiq.dto.QrDTOs.QrCodeDTO;
import com.fleetiq.dto.QrDTOs.QrProfileDTO;
import com.fleetiq.entity.Vehicle;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.service.QrCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private final QrCodeService qrCodeService;
    private final VehicleRepository vehicleRepository;

    public QrController(QrCodeService qrCodeService, VehicleRepository vehicleRepository) {
        this.qrCodeService = qrCodeService;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<QrCodeDTO> getVehicleQr(@PathVariable Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        return ResponseEntity.ok(qrCodeService.getQrCodeDTO(vehicle));
    }

    @GetMapping("/public/{token}")
    public ResponseEntity<QrProfileDTO> getPublicVehicleProfile(@PathVariable String token) {
        return ResponseEntity.ok(qrCodeService.getPublicVehicleProfileByToken(token));
    }
}
