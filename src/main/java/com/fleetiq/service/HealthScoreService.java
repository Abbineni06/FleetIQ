package com.fleetiq.service;

import com.fleetiq.dto.HealthDTOs.HealthScoreDTO;
import com.fleetiq.dto.HealthDTOs.HealthSummaryDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HealthScoreService {

    private final VehicleRepository vehicleRepository;
    private final VehicleHealthScoreRepository healthScoreRepository;
    private final InspectionRecordRepository inspectionRepository;
    private final RepairRecordRepository repairRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final NotificationService notificationService;

    public HealthScoreService(VehicleRepository vehicleRepository,
                              VehicleHealthScoreRepository healthScoreRepository,
                              InspectionRecordRepository inspectionRepository,
                              RepairRecordRepository repairRepository,
                              MaintenanceRecordRepository maintenanceRepository,
                              NotificationService notificationService) {
        this.vehicleRepository = vehicleRepository;
        this.healthScoreRepository = healthScoreRepository;
        this.inspectionRepository = inspectionRepository;
        this.repairRepository = repairRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public VehicleHealthScore calculateAndSaveHealthScore(Vehicle vehicle) {
        int currentKm = vehicle.getCurrentOdometer() != null ? vehicle.getCurrentOdometer() : 0;
        int nextKm = vehicle.getNextServiceKm() != null ? vehicle.getNextServiceKm() : 10000;
        int interval = vehicle.getServiceIntervalKm() != null ? vehicle.getServiceIntervalKm() : 10000;
        int remainingKm = nextKm - currentKm;

        List<String> reasons = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        // 1. Maintenance Compliance (Weight: 30%)
        int maintenanceScore = 100;
        if (remainingKm < 0) {
            int overKm = Math.abs(remainingKm);
            maintenanceScore = Math.max(10, 100 - (overKm * 100 / Math.max(interval, 5000)));
            reasons.add("Vehicle is overdue for scheduled service by " + overKm + " KM (-" + (100 - maintenanceScore) + " pts).");
            actions.add("Immediately schedule comprehensive preventative service.");
        } else if (remainingKm < 500) {
            maintenanceScore = 75;
            reasons.add("Scheduled maintenance is due in less than 500 KM (" + remainingKm + " KM remaining).");
            actions.add("Book next service slot with authorized fleet workshop.");
        } else if (remainingKm < 1000) {
            maintenanceScore = 90;
        }

        // 2. Inspection Results (Weight: 30%)
        int inspectionScore = 100;
        Optional<InspectionRecord> latestInspectionOpt = inspectionRepository.findTopByVehicleOrderByInspectionDateDesc(vehicle);
        boolean isUnsafe = false;

        if (latestInspectionOpt.isPresent()) {
            InspectionRecord latest = latestInspectionOpt.get();
            if (latest.isHasCriticalIssue() || latest.getOverallStatus() == InspectionStatus.FAILED_UNSAFE) {
                inspectionScore = 15;
                isUnsafe = true;
                reasons.add("CRITICAL safety defect flagged during recent inspection!");
                actions.add("CRITICAL: Ground vehicle immediately. Prohibit driver dispatch until repaired and reinspected.");
            } else if (latest.getOverallStatus() == InspectionStatus.NEEDS_ATTENTION) {
                inspectionScore = 65;
                reasons.add("Recent inspection reported items needing attention.");
                actions.add("Review checklist warnings and schedule minor maintenance.");
            }
        }

        // 3. Repair Frequency (Weight: 20%)
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        long recentRepairsCount = repairRepository.countRepairsSince(vehicle.getId(), oneYearAgo);
        int repairScore = 100;
        if (recentRepairsCount == 1) {
            repairScore = 85;
            reasons.add("1 unscheduled breakdown or repair logged in past 12 months.");
        } else if (recentRepairsCount == 2) {
            repairScore = 70;
            reasons.add("2 repairs logged in past 12 months.");
            actions.add("Investigate recurring component failures.");
        } else if (recentRepairsCount >= 3) {
            repairScore = Math.max(20, 100 - (int)(recentRepairsCount * 20));
            reasons.add(recentRepairsCount + " recurring repair incidents recorded in past 12 months.");
            actions.add("Conduct deep diagnostic audit to prevent severe mechanical breakdown.");
        }

        // 4. Overdue Maintenance Penalty (Weight: 20%)
        int overduePenalty = 0;
        if (remainingKm < 0) {
            overduePenalty = 100; // Full penalty on overdue component
        } else if (remainingKm <= 500) {
            overduePenalty = 40;
        } else if (remainingKm <= 1000) {
            overduePenalty = 15;
        }

        // Weighted calculation:
        // Score = (Maint * 0.30) + (Insp * 0.30) + (Repair * 0.20) + ((100 - Penalty) * 0.20)
        double weightedScore = (maintenanceScore * 0.30)
                + (inspectionScore * 0.30)
                + (repairScore * 0.20)
                + ((100 - overduePenalty) * 0.20);

        int finalScore = (int) Math.round(weightedScore);
        finalScore = Math.min(100, Math.max(0, finalScore));

        // Category determination
        String category;
        if (finalScore >= 85) {
            category = "Excellent";
            if (actions.isEmpty()) actions.add("Maintain current routine driving and inspection schedule.");
        } else if (finalScore >= 70) {
            category = "Good";
        } else if (finalScore >= 50) {
            category = "Needs Attention";
        } else {
            category = "Poor";
        }

        // SAFETY OVERRIDE:
        if (isUnsafe) {
            vehicle.setStatus(VehicleStatus.UNSAFE);
            vehicleRepository.save(vehicle);
            category = "Poor"; // Critical issue drops to poor / unsafe
            finalScore = Math.min(finalScore, 45); // Unsafe cannot have high numerical score
        }

        VehicleHealthScore healthRecord = new VehicleHealthScore();
        healthRecord.setVehicle(vehicle);
        healthRecord.setCalculatedAt(LocalDateTime.now());
        healthRecord.setOverallScore(finalScore);
        healthRecord.setCategory(category);
        healthRecord.setMaintenanceComplianceScore(maintenanceScore);
        healthRecord.setInspectionScore(inspectionScore);
        healthRecord.setRepairFrequencyScore(repairScore);
        healthRecord.setOverduePenalty(overduePenalty);
        healthRecord.setReasons(String.join(" | ", reasons));
        healthRecord.setRecommendedActions(String.join(" | ", actions));

        VehicleHealthScore saved = healthScoreRepository.save(healthRecord);

        // Low health score notification
        if (finalScore < 50) {
            notificationService.createNotification(
                    vehicle,
                    NotificationType.LOW_HEALTH_SCORE,
                    NotificationPriority.HIGH,
                    "Low Vehicle Health Score: " + vehicle.getRegistrationNumber(),
                    "Vehicle health dropped to " + finalScore + "/100 (" + category + "). " + String.join(" ", reasons)
            );
        }

        return saved;
    }

    public HealthScoreDTO getLatestHealthScore(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));
        return healthScoreRepository.findTopByVehicleOrderByCalculatedAtDesc(vehicle)
                .map(this::toDTO)
                .orElseGet(() -> toDTO(calculateAndSaveHealthScore(vehicle)));
    }

    public List<HealthScoreDTO> getHealthHistory(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));
        return healthScoreRepository.findByVehicleOrderByCalculatedAtDesc(vehicle)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public HealthSummaryDTO getFleetHealthSummary() {
        List<Vehicle> vehicles = vehicleRepository.findAllOrdered();
        List<HealthScoreDTO> scores = new ArrayList<>();

        long excellent = 0, good = 0, needsAttention = 0, poor = 0, unsafe = 0;
        double totalScore = 0;

        for (Vehicle v : vehicles) {
            HealthScoreDTO score = healthScoreRepository.findTopByVehicleOrderByCalculatedAtDesc(v)
                    .map(this::toDTO)
                    .orElseGet(() -> toDTO(calculateAndSaveHealthScore(v)));
            scores.add(score);
            totalScore += score.getOverallScore();

            if (score.isUnsafe() || v.getStatus() == VehicleStatus.UNSAFE) {
                unsafe++;
            }
            switch (score.getCategory()) {
                case "Excellent" -> excellent++;
                case "Good" -> good++;
                case "Needs Attention" -> needsAttention++;
                default -> poor++;
            }
        }

        HealthSummaryDTO summary = new HealthSummaryDTO();
        summary.setAverageFleetHealth(vehicles.isEmpty() ? 0.0 : Math.round((totalScore / vehicles.size()) * 10.0) / 10.0);
        summary.setExcellentCount(excellent);
        summary.setGoodCount(good);
        summary.setNeedsAttentionCount(needsAttention);
        summary.setPoorCount(poor);
        summary.setUnsafeCount(unsafe);
        summary.setVehicleScores(scores);
        return summary;
    }

    public HealthScoreDTO toDTO(VehicleHealthScore h) {
        HealthScoreDTO dto = new HealthScoreDTO();
        dto.setId(h.getId());
        dto.setVehicleId(h.getVehicle().getId());
        dto.setVehicleRegistration(h.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(h.getVehicle().getMake() + " " + h.getVehicle().getModel());
        dto.setCalculatedAt(h.getCalculatedAt());
        dto.setOverallScore(h.getOverallScore());
        dto.setCategory(h.getCategory());
        dto.setMaintenanceComplianceScore(h.getMaintenanceComplianceScore());
        dto.setInspectionScore(h.getInspectionScore());
        dto.setRepairFrequencyScore(h.getRepairFrequencyScore());
        dto.setOverduePenalty(h.getOverduePenalty());
        dto.setUnsafe(h.getVehicle().getStatus() == VehicleStatus.UNSAFE);
        dto.setReasons(h.getReasons());
        dto.setRecommendedActions(h.getRecommendedActions());
        return dto;
    }
}
