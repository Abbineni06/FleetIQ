package com.fleetiq.dto;

import com.fleetiq.entity.VehicleStatus;
import java.time.LocalDate;

public class VehicleDTOs {

    public static class VehicleDTO {
        private Long id;
        private String registrationNumber;
        private String vin;
        private String make;
        private String model;
        private Integer manufactureYear;
        private String vehicleType;
        private String fuelType;
        private Long assignedDriverId;
        private String assignedDriverName;
        private Integer currentOdometer;
        private Integer lastServiceKm;
        private Integer serviceIntervalKm;
        private Integer nextServiceKm;
        private Integer remainingKm;
        private VehicleStatus status;
        private LocalDate registrationDate;
        private String imageUrl;
        private Integer healthScore;
        private String healthCategory;
        private String qrCodeBase64;
        private String qrToken;

        public VehicleDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getVin() { return vin; }
        public void setVin(String vin) { this.vin = vin; }
        public String getMake() { return make; }
        public void setMake(String make) { this.make = make; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public Integer getManufactureYear() { return manufactureYear; }
        public void setManufactureYear(Integer manufactureYear) { this.manufactureYear = manufactureYear; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getFuelType() { return fuelType; }
        public void setFuelType(String fuelType) { this.fuelType = fuelType; }
        public Long getAssignedDriverId() { return assignedDriverId; }
        public void setAssignedDriverId(Long assignedDriverId) { this.assignedDriverId = assignedDriverId; }
        public String getAssignedDriverName() { return assignedDriverName; }
        public void setAssignedDriverName(String assignedDriverName) { this.assignedDriverName = assignedDriverName; }
        public Integer getCurrentOdometer() { return currentOdometer; }
        public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }
        public Integer getLastServiceKm() { return lastServiceKm; }
        public void setLastServiceKm(Integer lastServiceKm) { this.lastServiceKm = lastServiceKm; }
        public Integer getServiceIntervalKm() { return serviceIntervalKm; }
        public void setServiceIntervalKm(Integer serviceIntervalKm) { this.serviceIntervalKm = serviceIntervalKm; }
        public Integer getNextServiceKm() { return nextServiceKm; }
        public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }
        public Integer getRemainingKm() { return remainingKm; }
        public void setRemainingKm(Integer remainingKm) { this.remainingKm = remainingKm; }
        public VehicleStatus getStatus() { return status; }
        public void setStatus(VehicleStatus status) { this.status = status; }
        public LocalDate getRegistrationDate() { return registrationDate; }
        public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Integer getHealthScore() { return healthScore; }
        public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
        public String getHealthCategory() { return healthCategory; }
        public void setHealthCategory(String healthCategory) { this.healthCategory = healthCategory; }
        public String getQrCodeBase64() { return qrCodeBase64; }
        public void setQrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; }
        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    }

    public static class VehicleCreateRequest {
        private String registrationNumber;
        private String vin;
        private String make;
        private String model;
        private Integer manufactureYear;
        private String vehicleType;
        private String fuelType;
        private Long assignedDriverId;
        private Integer currentOdometer;
        private Integer lastServiceKm;
        private Integer serviceIntervalKm;
        private LocalDate registrationDate;
        private String imageUrl;

        public VehicleCreateRequest() {}

        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getVin() { return vin; }
        public void setVin(String vin) { this.vin = vin; }
        public String getMake() { return make; }
        public void setMake(String make) { this.make = make; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public Integer getManufactureYear() { return manufactureYear; }
        public void setManufactureYear(Integer manufactureYear) { this.manufactureYear = manufactureYear; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getFuelType() { return fuelType; }
        public void setFuelType(String fuelType) { this.fuelType = fuelType; }
        public Long getAssignedDriverId() { return assignedDriverId; }
        public void setAssignedDriverId(Long assignedDriverId) { this.assignedDriverId = assignedDriverId; }
        public Integer getCurrentOdometer() { return currentOdometer; }
        public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }
        public Integer getLastServiceKm() { return lastServiceKm; }
        public void setLastServiceKm(Integer lastServiceKm) { this.lastServiceKm = lastServiceKm; }
        public Integer getServiceIntervalKm() { return serviceIntervalKm; }
        public void setServiceIntervalKm(Integer serviceIntervalKm) { this.serviceIntervalKm = serviceIntervalKm; }
        public LocalDate getRegistrationDate() { return registrationDate; }
        public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class OdometerUpdateRequest {
        private Integer readingKm;
        private String notes;

        public OdometerUpdateRequest() {}
        public OdometerUpdateRequest(Integer readingKm, String notes) {
            this.readingKm = readingKm;
            this.notes = notes;
        }
        public Integer getReadingKm() { return readingKm; }
        public void setReadingKm(Integer readingKm) { this.readingKm = readingKm; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
