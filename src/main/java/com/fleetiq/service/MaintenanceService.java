package com.fleetiq.service;

import com.fleetiq.dto.MaintenanceDTOs.MaintenanceCreateRequest;
import com.fleetiq.dto.MaintenanceDTOs.MaintenanceDTO;
import com.fleetiq.dto.MaintenanceDTOs.PredictiveMaintenanceDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final OdometerReadingRepository odometerRepository;
    private final NotificationService notificationService;
    private final HealthScoreService healthScoreService;

    public MaintenanceService(MaintenanceRecordRepository maintenanceRepository,
                              VehicleRepository vehicleRepository,
                              OdometerReadingRepository odometerRepository,
                              NotificationService notificationService,
                              HealthScoreService healthScoreService) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
        this.odometerRepository = odometerRepository;
        this.notificationService = notificationService;
        this.healthScoreService = healthScoreService;
    }

    @Transactional
    public MaintenanceDTO recordMaintenance(MaintenanceCreateRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + request.getVehicleId()));

        int interval = request.getServiceIntervalKm() != null ? request.getServiceIntervalKm() : vehicle.getServiceIntervalKm();
        int nextKm = request.getOdometerKm() + interval;

        MaintenanceRecord record = new MaintenanceRecord();
        record.setVehicle(vehicle);
        record.setServiceDate(request.getServiceDate() != null ? request.getServiceDate() : LocalDate.now());
        record.setOdometerKm(request.getOdometerKm());
        record.setMaintenanceType(request.getMaintenanceType());
        record.setWorkPerformed(request.getWorkPerformed());
        record.setPartsReplaced(request.getPartsReplaced());
        record.setMechanicName(request.getMechanicName());
        record.setCost(request.getCost());
        record.setNextServiceKm(nextKm);
        record.setNotes(request.getNotes());

        MaintenanceRecord saved = maintenanceRepository.save(record);

        // Update Vehicle service thresholds & odometer if greater
        vehicle.setLastServiceKm(request.getOdometerKm());
        vehicle.setServiceIntervalKm(interval);
        vehicle.setNextServiceKm(nextKm);
        if (request.getOdometerKm() > vehicle.getCurrentOdometer()) {
            vehicle.setCurrentOdometer(request.getOdometerKm());
        }

        // If status was MAINTENANCE_DUE, restore to ACTIVE
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE_DUE) {
            vehicle.setStatus(VehicleStatus.ACTIVE);
        }
        vehicleRepository.save(vehicle);

        // Recalculate health score
        healthScoreService.calculateAndSaveHealthScore(vehicle);

        return toDTO(saved);
    }

    public List<MaintenanceDTO> getVehicleMaintenanceHistory(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        return maintenanceRepository.findByVehicleOrderByServiceDateDesc(vehicle)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MaintenanceDTO> getAllRecentMaintenance() {
        return maintenanceRepository.findTop10ByOrderByServiceDateDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PredictiveMaintenanceDTO calculatePrediction(Vehicle vehicle) {
        int currentKm = vehicle.getCurrentOdometer() != null ? vehicle.getCurrentOdometer() : 0;
        int lastKm = vehicle.getLastServiceKm() != null ? vehicle.getLastServiceKm() : 0;
        int interval = vehicle.getServiceIntervalKm() != null ? vehicle.getServiceIntervalKm() : 10000;
        int nextKm = lastKm + interval;
        int remainingKm = nextKm - currentKm;

        PredictiveMaintenanceDTO dto = new PredictiveMaintenanceDTO();
        dto.setVehicleId(vehicle.getId());
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setVehicleModel(vehicle.getMake() + " " + vehicle.getModel());
        dto.setCurrentOdometer(currentKm);
        dto.setLastServiceKm(lastKm);
        dto.setNextServiceKm(nextKm);
        dto.setRemainingKm(remainingKm);

        // Compute average daily distance using historical odometer readings
        List<OdometerReading> readings = odometerRepository.findByVehicleOrderByRecordedAtAsc(vehicle);
        double avgDailyKm = 0.0;
        boolean sufficientData = false;

        if (readings.size() >= 2) {
            OdometerReading first = readings.get(0);
            OdometerReading last = readings.get(readings.size() - 1);
            long days = ChronoUnit.DAYS.between(first.getRecordedAt().toLocalDate(), last.getRecordedAt().toLocalDate());
            int dist = last.getReadingKm() - first.getReadingKm();

            if (days > 0 && dist > 0) {
                avgDailyKm = (double) dist / days;
                sufficientData = true;
            }
        }

        // If not enough discrete odometer logs, fallback to vehicle registration date
        if (!sufficientData && vehicle.getRegistrationDate() != null) {
            long daysSinceReg = ChronoUnit.DAYS.between(vehicle.getRegistrationDate(), LocalDate.now());
            if (daysSinceReg > 7 && currentKm > 0) {
                avgDailyKm = (double) currentKm / daysSinceReg;
                sufficientData = true;
            }
        }

        // Set urgency
        String urgency;
        if (remainingKm <= 0) {
            urgency = "OVERDUE";
        } else if (remainingKm < 500) {
            urgency = "DUE_SOON";
        } else if (remainingKm <= 1000) {
            urgency = "UPCOMING";
        } else {
            urgency = "NORMAL";
        }
        dto.setUrgency(urgency);

        if (sufficientData && avgDailyKm > 0.5) {
            dto.setAvgDailyDistanceKm(Math.round(avgDailyKm * 10.0) / 10.0);
            dto.setHasSufficientData(true);

            if (remainingKm > 0) {
                int daysRemaining = (int) Math.ceil(remainingKm / avgDailyKm);
                dto.setEstimatedDaysRemaining(daysRemaining);
                dto.setPredictedServiceDate(LocalDate.now().plusDays(daysRemaining));
                dto.setStatusMessage(daysRemaining + " days estimated until service");
            } else {
                dto.setEstimatedDaysRemaining(0);
                dto.setPredictedServiceDate(LocalDate.now());
                dto.setStatusMessage("Service is OVERDUE by " + Math.abs(remainingKm) + " KM");
            }
        } else {
            dto.setHasSufficientData(false);
            dto.setStatusMessage("Insufficient data for prediction");
            if (remainingKm <= 0) {
                dto.setStatusMessage("Service is OVERDUE by " + Math.abs(remainingKm) + " KM");
            }
        }

        return dto;
    }

    public List<PredictiveMaintenanceDTO> getAllPredictions() {
        List<Vehicle> vehicles = vehicleRepository.findAllOrdered();
        List<PredictiveMaintenanceDTO> predictions = new ArrayList<>();
        for (Vehicle v : vehicles) {
            predictions.add(calculatePrediction(v));
        }
        return predictions;
    }

    public MaintenanceDTO toDTO(MaintenanceRecord m) {
        MaintenanceDTO dto = new MaintenanceDTO();
        dto.setId(m.getId());
        dto.setVehicleId(m.getVehicle().getId());
        dto.setVehicleRegistration(m.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(m.getVehicle().getMake() + " " + m.getVehicle().getModel());
        dto.setServiceDate(m.getServiceDate());
        dto.setOdometerKm(m.getOdometerKm());
        dto.setMaintenanceType(m.getMaintenanceType());
        dto.setWorkPerformed(m.getWorkPerformed());
        dto.setPartsReplaced(m.getPartsReplaced());
        dto.setMechanicName(m.getMechanicName());
        dto.setCost(m.getCost());
        dto.setNextServiceKm(m.getNextServiceKm());
        dto.setNotes(m.getNotes());
        return dto;
    }
}
