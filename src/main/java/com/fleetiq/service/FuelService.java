package com.fleetiq.service;

import com.fleetiq.dto.FuelDTOs.FuelCreateRequest;
import com.fleetiq.dto.FuelDTOs.FuelDTO;
import com.fleetiq.dto.FuelDTOs.FuelEfficiencyComparisonDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.FuelRecordRepository;
import com.fleetiq.repository.OdometerReadingRepository;
import com.fleetiq.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuelService {

    private final FuelRecordRepository fuelRepository;
    private final VehicleRepository vehicleRepository;
    private final OdometerReadingRepository odometerRepository;
    private final NotificationService notificationService;

    public FuelService(FuelRecordRepository fuelRepository,
                       VehicleRepository vehicleRepository,
                       OdometerReadingRepository odometerRepository,
                       NotificationService notificationService) {
        this.fuelRepository = fuelRepository;
        this.vehicleRepository = vehicleRepository;
        this.odometerRepository = odometerRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public FuelDTO addFuelRecord(FuelCreateRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + request.getVehicleId()));

        if (request.getOdometerKm() < vehicle.getCurrentOdometer()) {
            throw new IllegalArgumentException("Odometer reading (" + request.getOdometerKm() + " KM) cannot be less than current vehicle reading (" + vehicle.getCurrentOdometer() + " KM)");
        }

        BigDecimal totalCost = request.getFuelQuantity().multiply(request.getPricePerLitre()).setScale(2, RoundingMode.HALF_UP);

        FuelRecord record = new FuelRecord();
        record.setVehicle(vehicle);
        record.setFuelDate(request.getFuelDate() != null ? request.getFuelDate() : LocalDate.now());
        record.setOdometerKm(request.getOdometerKm());
        record.setFuelQuantity(request.getFuelQuantity());
        record.setPricePerLitre(request.getPricePerLitre());
        record.setTotalCost(totalCost);
        record.setFuelStation(request.getFuelStation());
        record.setFuelType(request.getFuelType() != null ? request.getFuelType() : vehicle.getFuelType());
        record.setFullTank(request.isFullTank());
        record.setNotes(request.getNotes());

        // Mileage calculation if full tank
        List<FuelRecord> previousFills = fuelRepository.findTop2ByVehicleOrderByOdometerKmDesc(vehicle);
        if (!previousFills.isEmpty() && request.isFullTank()) {
            FuelRecord prev = previousFills.get(0);
            int distance = request.getOdometerKm() - prev.getOdometerKm();
            if (distance > 0 && request.getFuelQuantity().compareTo(BigDecimal.ZERO) > 0) {
                record.setDistanceTravelled(distance);
                BigDecimal mileage = BigDecimal.valueOf(distance)
                        .divide(request.getFuelQuantity(), 2, RoundingMode.HALF_UP);
                record.setMileageKml(mileage);

                // Check for unusual fuel efficiency drop (e.g. < 4.0 km/L or significant decrease)
                if (mileage.doubleValue() < 4.5 && !"Heavy Truck".equalsIgnoreCase(vehicle.getVehicleType())) {
                    notificationService.createNotification(
                            vehicle,
                            NotificationType.UNUSUAL_FUEL,
                            NotificationPriority.MEDIUM,
                            "Unusual Fuel Consumption: " + vehicle.getRegistrationNumber(),
                            "Recorded unusually low efficiency (" + mileage + " KM/L). Possible fuel theft or engine sensor anomaly."
                    );
                }
            }
        }

        FuelRecord saved = fuelRepository.save(record);

        // Update vehicle odometer and save odometer reading history
        if (request.getOdometerKm() > vehicle.getCurrentOdometer()) {
            vehicle.setCurrentOdometer(request.getOdometerKm());
            vehicleRepository.save(vehicle);

            OdometerReading odo = new OdometerReading();
            odo.setVehicle(vehicle);
            odo.setReadingKm(request.getOdometerKm());
            odo.setRecordedAt(LocalDateTime.now());
            odo.setNotes("Recorded at fuel refill");
            odometerRepository.save(odo);
        }

        return toDTO(saved);
    }

    public List<FuelDTO> getVehicleFuelHistory(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        return fuelRepository.findByVehicleOrderByFuelDateDesc(vehicle)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<FuelDTO> getAllFuelRecords() {
        return fuelRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<FuelEfficiencyComparisonDTO> getFuelEfficiencyComparison() {
        List<Vehicle> vehicles = vehicleRepository.findAllOrdered();
        List<FuelEfficiencyComparisonDTO> list = new ArrayList<>();

        for (Vehicle v : vehicles) {
            Double avgMileage = fuelRepository.averageMileageByVehicleId(v.getId());
            BigDecimal totalExpense = fuelRepository.sumCostByVehicleId(v.getId());

            FuelEfficiencyComparisonDTO dto = new FuelEfficiencyComparisonDTO();
            dto.setVehicleId(v.getId());
            dto.setRegistrationNumber(v.getRegistrationNumber());
            dto.setVehicleModel(v.getMake() + " " + v.getModel());
            dto.setFuelType(v.getFuelType());
            dto.setAvgMileageKml(avgMileage != null ? Math.round(avgMileage * 100.0) / 100.0 : 0.0);
            dto.setTotalFuelExpense(totalExpense != null ? totalExpense : BigDecimal.ZERO);
            dto.setTotalDistance(v.getCurrentOdometer());
            list.add(dto);
        }

        return list;
    }

    public FuelDTO toDTO(FuelRecord f) {
        FuelDTO dto = new FuelDTO();
        dto.setId(f.getId());
        dto.setVehicleId(f.getVehicle().getId());
        dto.setVehicleRegistration(f.getVehicle().getRegistrationNumber());
        dto.setVehicleModel(f.getVehicle().getMake() + " " + f.getVehicle().getModel());
        dto.setFuelDate(f.getFuelDate());
        dto.setOdometerKm(f.getOdometerKm());
        dto.setFuelQuantity(f.getFuelQuantity());
        dto.setPricePerLitre(f.getPricePerLitre());
        dto.setTotalCost(f.getTotalCost());
        dto.setFuelStation(f.getFuelStation());
        dto.setFuelType(f.getFuelType());
        dto.setFullTank(f.isFullTank());
        dto.setDistanceTravelled(f.getDistanceTravelled());
        dto.setMileageKml(f.getMileageKml());
        dto.setNotes(f.getNotes());
        return dto;
    }
}
