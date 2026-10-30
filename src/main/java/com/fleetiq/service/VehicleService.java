package com.fleetiq.service;

import com.fleetiq.dto.VehicleDTOs.*;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final OdometerReadingRepository odometerRepository;
    private final VehicleHealthScoreRepository healthRepository;
    private final HealthScoreService healthScoreService;
    private final QrCodeService qrCodeService;
    private final NotificationService notificationService;

    public VehicleService(VehicleRepository vehicleRepository,
                          UserRepository userRepository,
                          OdometerReadingRepository odometerRepository,
                          VehicleHealthScoreRepository healthRepository,
                          HealthScoreService healthScoreService,
                          QrCodeService qrCodeService,
                          NotificationService notificationService) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.odometerRepository = odometerRepository;
        this.healthRepository = healthRepository;
        this.healthScoreService = healthScoreService;
        this.qrCodeService = qrCodeService;
        this.notificationService = notificationService;
    }

    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAllOrdered()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> searchVehicles(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllVehicles();
        }
        return vehicleRepository.searchVehicles(query.trim())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> getVehiclesByDriver(Long driverId) {
        return vehicleRepository.findByAssignedDriverId(driverId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
        return toDTO(vehicle);
    }

    @Transactional
    public VehicleDTO registerVehicle(VehicleCreateRequest req) {
        if (vehicleRepository.existsByRegistrationNumber(req.getRegistrationNumber())) {
            throw new IllegalArgumentException("Vehicle with registration number " + req.getRegistrationNumber() + " already exists!");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNumber(req.getRegistrationNumber().trim().toUpperCase());
        vehicle.setVin(req.getVin());
        vehicle.setMake(req.getMake());
        vehicle.setModel(req.getModel());
        vehicle.setManufactureYear(req.getManufactureYear());
        vehicle.setVehicleType(req.getVehicleType());
        vehicle.setFuelType(req.getFuelType());

        if (req.getAssignedDriverId() != null) {
            userRepository.findById(req.getAssignedDriverId()).ifPresent(vehicle::setAssignedDriver);
        }

        int currentKm = req.getCurrentOdometer() != null ? req.getCurrentOdometer() : 0;
        int lastKm = req.getLastServiceKm() != null ? req.getLastServiceKm() : currentKm;
        int interval = req.getServiceIntervalKm() != null ? req.getServiceIntervalKm() : 10000;
        int nextKm = lastKm + interval;
        int remainingKm = nextKm - currentKm;

        vehicle.setCurrentOdometer(currentKm);
        vehicle.setLastServiceKm(lastKm);
        vehicle.setServiceIntervalKm(interval);
        vehicle.setNextServiceKm(nextKm);
        vehicle.setRegistrationDate(req.getRegistrationDate() != null ? req.getRegistrationDate() : LocalDate.now());
        vehicle.setImageUrl(req.getImageUrl());

        if (remainingKm <= 0) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE_DUE);
        } else {
            vehicle.setStatus(VehicleStatus.ACTIVE);
        }

        Vehicle saved = vehicleRepository.save(vehicle);

        if (remainingKm <= 0) {
            notificationService.createNotification(
                    saved,
                    NotificationType.OVERDUE_MAINTENANCE,
                    NotificationPriority.HIGH,
                    "Immediate Service Due: " + saved.getRegistrationNumber(),
                    "Vehicle registered with odometer (" + currentKm + " KM) at or exceeding scheduled service threshold (" + nextKm + " KM)."
            );
        }

        // Record initial odometer
        OdometerReading odo = new OdometerReading();
        odo.setVehicle(saved);
        odo.setReadingKm(currentKm);
        odo.setRecordedAt(LocalDateTime.now());
        odo.setNotes("Initial odometer at registration");
        odometerRepository.save(odo);

        // Automatically generate unique QR code
        qrCodeService.generateOrGetQrToken(saved);

        // Initial health score calculation
        healthScoreService.calculateAndSaveHealthScore(saved);

        return toDTO(saved);
    }

    @Transactional
    public VehicleDTO updateVehicle(Long id, VehicleCreateRequest req) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        vehicle.setMake(req.getMake());
        vehicle.setModel(req.getModel());
        vehicle.setManufactureYear(req.getManufactureYear());
        vehicle.setVehicleType(req.getVehicleType());
        vehicle.setFuelType(req.getFuelType());
        vehicle.setImageUrl(req.getImageUrl());

        if (req.getAssignedDriverId() != null) {
            userRepository.findById(req.getAssignedDriverId()).ifPresent(vehicle::setAssignedDriver);
        } else {
            vehicle.setAssignedDriver(null);
        }

        if (req.getServiceIntervalKm() != null && !req.getServiceIntervalKm().equals(vehicle.getServiceIntervalKm())) {
            vehicle.setServiceIntervalKm(req.getServiceIntervalKm());
            vehicle.setNextServiceKm(vehicle.getLastServiceKm() + req.getServiceIntervalKm());
        }

        if (vehicle.getStatus() == VehicleStatus.ACTIVE && vehicle.getCurrentOdometer() >= vehicle.getNextServiceKm()) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE_DUE);
        } else if (vehicle.getStatus() == VehicleStatus.MAINTENANCE_DUE && vehicle.getCurrentOdometer() < vehicle.getNextServiceKm()) {
            vehicle.setStatus(VehicleStatus.ACTIVE);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        healthScoreService.calculateAndSaveHealthScore(saved);

        return toDTO(saved);
    }

    @Transactional
    public VehicleDTO updateOdometer(Long id, OdometerUpdateRequest req, String username) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        if (req.getReadingKm() == null) {
            throw new IllegalArgumentException("Odometer reading cannot be empty.");
        }

        if (req.getReadingKm() < vehicle.getCurrentOdometer()) {
            throw new IllegalArgumentException("New odometer reading (" + req.getReadingKm() + " KM) cannot be less than current reading (" + vehicle.getCurrentOdometer() + " KM).");
        }

        User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;

        vehicle.setCurrentOdometer(req.getReadingKm());

        // Check if service is now overdue
        if (vehicle.getCurrentOdometer() >= vehicle.getNextServiceKm()) {
            if (vehicle.getStatus() == VehicleStatus.ACTIVE) {
                vehicle.setStatus(VehicleStatus.MAINTENANCE_DUE);
            }
            notificationService.createNotification(
                    vehicle,
                    NotificationType.OVERDUE_MAINTENANCE,
                    NotificationPriority.HIGH,
                    "Service Overdue: " + vehicle.getRegistrationNumber(),
                    "Vehicle has reached " + vehicle.getCurrentOdometer() + " KM, exceeding next service threshold of " + vehicle.getNextServiceKm() + " KM."
            );
        } else if (vehicle.getNextServiceKm() - vehicle.getCurrentOdometer() <= 1000) {
            notificationService.createNotification(
                    vehicle,
                    NotificationType.UPCOMING_MAINTENANCE,
                    NotificationPriority.MEDIUM,
                    "Upcoming Service: " + vehicle.getRegistrationNumber(),
                    "Vehicle is within " + (vehicle.getNextServiceKm() - vehicle.getCurrentOdometer()) + " KM of scheduled maintenance."
            );
        }

        Vehicle saved = vehicleRepository.save(vehicle);

        OdometerReading odo = new OdometerReading();
        odo.setVehicle(saved);
        odo.setReadingKm(req.getReadingKm());
        odo.setRecordedAt(LocalDateTime.now());
        odo.setRecordedBy(user);
        odo.setNotes(req.getNotes() != null ? req.getNotes() : "Driver odometer entry");
        odometerRepository.save(odo);

        healthScoreService.calculateAndSaveHealthScore(saved);

        return toDTO(saved);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
        // Soft delete / retire
        vehicle.setStatus(VehicleStatus.RETIRED);
        vehicleRepository.save(vehicle);
    }

    public VehicleDTO toDTO(Vehicle v) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(v.getId());
        dto.setRegistrationNumber(v.getRegistrationNumber());
        dto.setVin(v.getVin());
        dto.setMake(v.getMake());
        dto.setModel(v.getModel());
        dto.setManufactureYear(v.getManufactureYear());
        dto.setVehicleType(v.getVehicleType());
        dto.setFuelType(v.getFuelType());
        if (v.getAssignedDriver() != null) {
            dto.setAssignedDriverId(v.getAssignedDriver().getId());
            dto.setAssignedDriverName(v.getAssignedDriver().getFullName());
        }
        int currentKm = v.getCurrentOdometer() != null ? v.getCurrentOdometer() : 0;
        int nextKm = v.getNextServiceKm() != null ? v.getNextServiceKm() : 0;
        dto.setCurrentOdometer(currentKm);
        dto.setLastServiceKm(v.getLastServiceKm());
        dto.setServiceIntervalKm(v.getServiceIntervalKm());
        dto.setNextServiceKm(nextKm);
        dto.setRemainingKm(nextKm - currentKm);
        dto.setStatus(v.getStatus());
        dto.setRegistrationDate(v.getRegistrationDate());
        dto.setImageUrl(v.getImageUrl());

        // Latest health score
        healthRepository.findTopByVehicleOrderByCalculatedAtDesc(v).ifPresent(h -> {
            dto.setHealthScore(h.getOverallScore());
            dto.setHealthCategory(h.getCategory());
        });

        // QR info
        VehicleQrToken qrToken = qrCodeService.generateOrGetQrToken(v);
        if (qrToken != null) {
            dto.setQrCodeBase64(qrToken.getQrCodeBase64());
            dto.setQrToken(qrToken.getToken());
        }

        return dto;
    }
}
