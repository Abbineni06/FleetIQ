package com.fleetiq.service;

import com.fleetiq.dto.InspectionDTOs.InspectionDTO;
import com.fleetiq.dto.MaintenanceDTOs.MaintenanceDTO;
import com.fleetiq.dto.QrDTOs.QrCodeDTO;
import com.fleetiq.dto.QrDTOs.QrProfileDTO;
import com.fleetiq.dto.RepairDTOs.RepairDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import com.fleetiq.util.QrCodeGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QrCodeService {

    private final VehicleQrTokenRepository qrTokenRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleHealthScoreRepository healthRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final RepairRecordRepository repairRepository;
    private final InspectionRecordRepository inspectionRepository;
    private final QrCodeGenerator qrCodeGenerator;

    @Value("${fleetiq.base-url:http://localhost:8080}")
    private String baseUrl;

    public QrCodeService(VehicleQrTokenRepository qrTokenRepository,
                         VehicleRepository vehicleRepository,
                         VehicleHealthScoreRepository healthRepository,
                         MaintenanceRecordRepository maintenanceRepository,
                         RepairRecordRepository repairRepository,
                         InspectionRecordRepository inspectionRepository,
                         QrCodeGenerator qrCodeGenerator) {
        this.qrTokenRepository = qrTokenRepository;
        this.vehicleRepository = vehicleRepository;
        this.healthRepository = healthRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.repairRepository = repairRepository;
        this.inspectionRepository = inspectionRepository;
        this.qrCodeGenerator = qrCodeGenerator;
    }

    @Transactional
    public VehicleQrToken generateOrGetQrToken(Vehicle vehicle) {
        return qrTokenRepository.findTopByVehicleAndRevokedFalseOrderByCreatedAtDesc(vehicle)
                .orElseGet(() -> {
                    String token = UUID.randomUUID().toString().replace("-", "");
                    String profileUrl = baseUrl + "/qr-view.html?token=" + token;
                    String base64Image = qrCodeGenerator.generateQrCodeBase64(profileUrl, 300, 300);

                    VehicleQrToken qrToken = new VehicleQrToken(vehicle, token, base64Image);
                    return qrTokenRepository.save(qrToken);
                });
    }

    public QrCodeDTO getQrCodeDTO(Vehicle vehicle) {
        VehicleQrToken qrToken = generateOrGetQrToken(vehicle);
        String profileUrl = baseUrl + "/qr-view.html?token=" + qrToken.getToken();
        return new QrCodeDTO(vehicle.getId(), vehicle.getRegistrationNumber(), qrToken.getToken(), qrToken.getQrCodeBase64(), profileUrl);
    }

    public QrProfileDTO getPublicVehicleProfileByToken(String token) {
        VehicleQrToken qrToken = qrTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired vehicle QR token"));

        if (qrToken.isRevoked()) {
            throw new RuntimeException("This QR token has been revoked by fleet administration.");
        }

        Vehicle vehicle = qrToken.getVehicle();
        VehicleHealthScore health = healthRepository.findTopByVehicleOrderByCalculatedAtDesc(vehicle).orElse(null);

        QrProfileDTO profile = new QrProfileDTO();
        profile.setVehicleId(vehicle.getId());
        profile.setRegistrationNumber(vehicle.getRegistrationNumber());
        profile.setMake(vehicle.getMake());
        profile.setModel(vehicle.getModel());
        profile.setManufactureYear(vehicle.getManufactureYear());
        profile.setVehicleType(vehicle.getVehicleType());
        profile.setFuelType(vehicle.getFuelType());
        profile.setStatus(vehicle.getStatus().name());
        profile.setCurrentOdometer(vehicle.getCurrentOdometer());
        profile.setLastServiceKm(vehicle.getLastServiceKm());
        profile.setNextServiceKm(vehicle.getNextServiceKm());
        profile.setRemainingKm(vehicle.getNextServiceKm() - vehicle.getCurrentOdometer());

        if (health != null) {
            profile.setHealthScore(health.getOverallScore());
            profile.setHealthCategory(health.getCategory());
        } else {
            profile.setHealthScore(90);
            profile.setHealthCategory("Good");
        }

        profile.setUnsafe(vehicle.getStatus() == VehicleStatus.UNSAFE);
        if (vehicle.getAssignedDriver() != null) {
            profile.setAssignedDriverName(vehicle.getAssignedDriver().getFullName());
        }

        // Recent Maintenance (top 3)
        List<MaintenanceDTO> maintenance = maintenanceRepository.findByVehicleOrderByServiceDateDesc(vehicle)
                .stream().limit(3).map(m -> {
                    MaintenanceDTO d = new MaintenanceDTO();
                    d.setId(m.getId());
                    d.setServiceDate(m.getServiceDate());
                    d.setOdometerKm(m.getOdometerKm());
                    d.setMaintenanceType(m.getMaintenanceType());
                    d.setWorkPerformed(m.getWorkPerformed());
                    d.setMechanicName(m.getMechanicName());
                    d.setNextServiceKm(m.getNextServiceKm());
                    return d;
                }).collect(Collectors.toList());
        profile.setRecentMaintenance(maintenance);

        // Recent Repairs (top 3)
        List<RepairDTO> repairs = repairRepository.findByVehicleOrderByRepairDateDesc(vehicle)
                .stream().limit(3).map(r -> {
                    RepairDTO d = new RepairDTO();
                    d.setId(r.getId());
                    d.setRepairDate(r.getRepairDate());
                    d.setProblemDescription(r.getProblemDescription());
                    d.setRepairCategory(r.getRepairCategory());
                    d.setRepairStatus(r.getRepairStatus());
                    return d;
                }).collect(Collectors.toList());
        profile.setRecentRepairs(repairs);

        // Latest Inspection
        inspectionRepository.findTopByVehicleOrderByInspectionDateDesc(vehicle).ifPresent(i -> {
            InspectionDTO d = new InspectionDTO();
            d.setId(i.getId());
            d.setInspectionDate(i.getInspectionDate());
            d.setOverallStatus(i.getOverallStatus());
            d.setHasCriticalIssue(i.isHasCriticalIssue());
            d.setGeneralNotes(i.getGeneralNotes());
            profile.setLatestInspection(d);
        });

        return profile;
    }
}
