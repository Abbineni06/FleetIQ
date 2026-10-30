package com.fleetiq.service;

import com.fleetiq.dto.InspectionDTOs.InspectionCreateRequest;
import com.fleetiq.dto.InspectionDTOs.InspectionDTO;
import com.fleetiq.dto.InspectionDTOs.InspectionItemDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.InspectionItemRepository;
import com.fleetiq.repository.InspectionRecordRepository;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InspectionService {

    private final InspectionRecordRepository inspectionRepository;
    private final InspectionItemRepository itemRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final HealthScoreService healthScoreService;

    public InspectionService(InspectionRecordRepository inspectionRepository,
                             InspectionItemRepository itemRepository,
                             VehicleRepository vehicleRepository,
                             UserRepository userRepository,
                             NotificationService notificationService,
                             HealthScoreService healthScoreService) {
        this.inspectionRepository = inspectionRepository;
        this.itemRepository = itemRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.healthScoreService = healthScoreService;
    }

    @Transactional
    public InspectionDTO submitInspection(InspectionCreateRequest request, String username) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + request.getVehicleId()));

        User inspector = username != null ? userRepository.findByUsername(username).orElse(null) : null;

        InspectionRecord record = new InspectionRecord();
        record.setVehicle(vehicle);
        record.setInspectionDate(LocalDateTime.now());
        record.setInspector(inspector);
        record.setGeneralNotes(request.getGeneralNotes());

        boolean hasCritical = false;
        boolean hasAttention = false;
        List<String> criticalDefects = new ArrayList<>();

        if (request.getItems() != null) {
            for (InspectionItemDTO itemDto : request.getItems()) {
                InspectionItem item = new InspectionItem();
                item.setItemName(itemDto.getItemName());
                item.setStatus(itemDto.getStatus() != null ? itemDto.getStatus() : ItemCondition.GOOD);
                item.setNotes(itemDto.getNotes());

                if (item.getStatus() == ItemCondition.CRITICAL) {
                    hasCritical = true;
                    criticalDefects.add(item.getItemName() + (item.getNotes() != null ? " (" + item.getNotes() + ")" : ""));
                } else if (item.getStatus() == ItemCondition.NEEDS_ATTENTION) {
                    hasAttention = true;
                }

                record.addItem(item);
            }
        }

        record.setHasCriticalIssue(hasCritical);
        if (hasCritical) {
            record.setOverallStatus(InspectionStatus.FAILED_UNSAFE);
            // CRITICAL SAFETY LOCK:
            vehicle.setStatus(VehicleStatus.UNSAFE);
            vehicleRepository.save(vehicle);

            // Immediate High Priority Alert to Fleet Managers
            notificationService.createNotification(
                    vehicle,
                    NotificationType.CRITICAL_INSPECTION,
                    NotificationPriority.CRITICAL,
                    "CRITICAL DEFECT DETECTED: " + vehicle.getRegistrationNumber(),
                    "Inspection failed! Critical defects detected: " + String.join(", ", criticalDefects) + ". Vehicle has been flagged as UNSAFE and locked from assignment."
            );
        } else if (hasAttention) {
            record.setOverallStatus(InspectionStatus.NEEDS_ATTENTION);
        } else {
            record.setOverallStatus(InspectionStatus.PASSED);
            // If vehicle was marked unsafe solely due to inspection and is now passed by authorized review
            if (vehicle.getStatus() == VehicleStatus.UNSAFE) {
                vehicle.setStatus(VehicleStatus.ACTIVE);
                vehicleRepository.save(vehicle);
            }
        }

        InspectionRecord saved = inspectionRepository.save(record);

        // Update health score
        healthScoreService.calculateAndSaveHealthScore(vehicle);

        return toDTO(saved);
    }

    public List<InspectionDTO> getVehicleInspectionHistory(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        return inspectionRepository.findByVehicleOrderByInspectionDateDesc(vehicle)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<InspectionDTO> getAllRecentInspections() {
        return inspectionRepository.findTop10ByOrderByInspectionDateDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public InspectionDTO toDTO(InspectionRecord r) {
        InspectionDTO dto = new InspectionDTO();
        dto.setId(r.getId());
        dto.setVehicleId(r.getVehicle().getId());
        dto.setVehicleRegistration(r.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(r.getVehicle().getMake() + " " + r.getVehicle().getModel());
        dto.setInspectionDate(r.getInspectionDate());
        if (r.getInspector() != null) {
            dto.setInspectorId(r.getInspector().getId());
            dto.setInspectorName(r.getInspector().getFullName());
        }
        dto.setOverallStatus(r.getOverallStatus());
        dto.setHasCriticalIssue(r.isHasCriticalIssue());
        dto.setGeneralNotes(r.getGeneralNotes());

        if (r.getItems() != null) {
            List<InspectionItemDTO> items = r.getItems().stream()
                    .map(i -> new InspectionItemDTO(i.getItemName(), i.getStatus(), i.getNotes()))
                    .collect(Collectors.toList());
            dto.setItems(items);
        }
        return dto;
    }
}
