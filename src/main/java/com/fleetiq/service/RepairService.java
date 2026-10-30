package com.fleetiq.service;

import com.fleetiq.dto.RepairDTOs.RepairCreateRequest;
import com.fleetiq.dto.RepairDTOs.RepairDTO;
import com.fleetiq.dto.RepairDTOs.RepairStatusUpdateRequest;
import com.fleetiq.entity.NotificationPriority;
import com.fleetiq.entity.NotificationType;
import com.fleetiq.entity.RepairRecord;
import com.fleetiq.entity.RepairStatus;
import com.fleetiq.entity.Vehicle;
import com.fleetiq.entity.VehicleStatus;
import com.fleetiq.repository.RepairRecordRepository;
import com.fleetiq.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RepairService {

    private final RepairRecordRepository repairRepository;
    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;
    private final HealthScoreService healthScoreService;

    public RepairService(RepairRecordRepository repairRepository,
                         VehicleRepository vehicleRepository,
                         NotificationService notificationService,
                         HealthScoreService healthScoreService) {
        this.repairRepository = repairRepository;
        this.vehicleRepository = vehicleRepository;
        this.notificationService = notificationService;
        this.healthScoreService = healthScoreService;
    }

    @Transactional
    public RepairDTO recordRepair(RepairCreateRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + request.getVehicleId()));

        RepairRecord record = new RepairRecord();
        record.setVehicle(vehicle);
        record.setRepairDate(request.getRepairDate() != null ? request.getRepairDate() : LocalDate.now());
        record.setProblemDescription(request.getProblemDescription());
        record.setRepairCategory(request.getRepairCategory());
        record.setPartsReplaced(request.getPartsReplaced());
        record.setCost(request.getCost());
        record.setMechanicName(request.getMechanicName());
        record.setRepairStatus(request.getRepairStatus() != null ? request.getRepairStatus() : RepairStatus.PENDING);
        record.setNotes(request.getNotes());

        if (record.getRepairStatus() == RepairStatus.COMPLETED) {
            record.setCompletedDate(LocalDate.now());
        }

        RepairRecord saved = repairRepository.save(record);

        // Update vehicle status to IN_SHOP if repair is ongoing
        if (record.getRepairStatus() == RepairStatus.PENDING || record.getRepairStatus() == RepairStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.IN_SHOP);
            vehicleRepository.save(vehicle);
        }

        // Recalculate health score
        healthScoreService.calculateAndSaveHealthScore(vehicle);

        return toDTO(saved);
    }

    @Transactional
    public RepairDTO updateRepairStatus(Long repairId, RepairStatusUpdateRequest request) {
        RepairRecord record = repairRepository.findById(repairId)
                .orElseThrow(() -> new RuntimeException("Repair record not found: " + repairId));

        record.setRepairStatus(request.getRepairStatus());
        if (request.getFinalCost() != null) {
            record.setCost(request.getFinalCost());
        }
        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }

        Vehicle vehicle = record.getVehicle();

        if (request.getRepairStatus() == RepairStatus.COMPLETED) {
            record.setCompletedDate(request.getCompletedDate() != null ? request.getCompletedDate() : LocalDate.now());

            // Check if vehicle has any other active repairs
            boolean hasOtherActiveRepairs = repairRepository.findByVehicleOrderByRepairDateDesc(vehicle)
                    .stream()
                    .anyMatch(r -> !r.getId().equals(record.getId()) &&
                            (r.getRepairStatus() == RepairStatus.IN_PROGRESS || r.getRepairStatus() == RepairStatus.PENDING));

            if (!hasOtherActiveRepairs && vehicle.getStatus() == VehicleStatus.IN_SHOP) {
                vehicle.setStatus(VehicleStatus.ACTIVE);
                vehicleRepository.save(vehicle);
            }

            notificationService.createNotification(
                    vehicle,
                    NotificationType.REPAIR_COMPLETED,
                    NotificationPriority.LOW,
                    "Repair Completed: " + vehicle.getRegistrationNumber(),
                    "Repair for '" + record.getProblemDescription() + "' completed. Cost: $" + record.getCost()
            );
        }

        RepairRecord saved = repairRepository.save(record);
        healthScoreService.calculateAndSaveHealthScore(vehicle);

        return toDTO(saved);
    }

    public List<RepairDTO> getVehicleRepairHistory(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        return repairRepository.findByVehicleOrderByRepairDateDesc(vehicle)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<RepairDTO> getAllRepairs() {
        return repairRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public RepairDTO toDTO(RepairRecord r) {
        RepairDTO dto = new RepairDTO();
        dto.setId(r.getId());
        dto.setVehicleId(r.getVehicle().getId());
        dto.setVehicleRegistration(r.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(r.getVehicle().getMake() + " " + r.getVehicle().getModel());
        dto.setRepairDate(r.getRepairDate());
        dto.setProblemDescription(r.getProblemDescription());
        dto.setRepairCategory(r.getRepairCategory());
        dto.setPartsReplaced(r.getPartsReplaced());
        dto.setCost(r.getCost());
        dto.setMechanicName(r.getMechanicName());
        dto.setRepairStatus(r.getRepairStatus());
        dto.setCompletedDate(r.getCompletedDate());
        dto.setNotes(r.getNotes());
        return dto;
    }
}
