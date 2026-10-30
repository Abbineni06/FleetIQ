package com.fleetiq.dto;

import java.util.List;

public class QrDTOs {

    public static class QrCodeDTO {
        private Long vehicleId;
        private String registrationNumber;
        private String token;
        private String qrCodeBase64;
        private String profileUrl;

        public QrCodeDTO() {}
        public QrCodeDTO(Long vehicleId, String registrationNumber, String token, String qrCodeBase64, String profileUrl) {
            this.vehicleId = vehicleId;
            this.registrationNumber = registrationNumber;
            this.token = token;
            this.qrCodeBase64 = qrCodeBase64;
            this.profileUrl = profileUrl;
        }

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getQrCodeBase64() { return qrCodeBase64; }
        public void setQrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; }
        public String getProfileUrl() { return profileUrl; }
        public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }
    }

    public static class QrProfileDTO {
        private Long vehicleId;
        private String registrationNumber;
        private String make;
        private String model;
        private Integer manufactureYear;
        private String vehicleType;
        private String fuelType;
        private String status;
        private Integer currentOdometer;
        private Integer lastServiceKm;
        private Integer nextServiceKm;
        private Integer remainingKm;
        private Integer healthScore;
        private String healthCategory;
        private boolean isUnsafe;
        private String assignedDriverName;
        private List<MaintenanceDTOs.MaintenanceDTO> recentMaintenance;
        private List<RepairDTOs.RepairDTO> recentRepairs;
        private InspectionDTOs.InspectionDTO latestInspection;

        public QrProfileDTO() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
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
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getCurrentOdometer() { return currentOdometer; }
        public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }
        public Integer getLastServiceKm() { return lastServiceKm; }
        public void setLastServiceKm(Integer lastServiceKm) { this.lastServiceKm = lastServiceKm; }
        public Integer getNextServiceKm() { return nextServiceKm; }
        public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }
        public Integer getRemainingKm() { return remainingKm; }
        public void setRemainingKm(Integer remainingKm) { this.remainingKm = remainingKm; }
        public Integer getHealthScore() { return healthScore; }
        public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
        public String getHealthCategory() { return healthCategory; }
        public void setHealthCategory(String healthCategory) { this.healthCategory = healthCategory; }
        public boolean isUnsafe() { return isUnsafe; }
        public void setUnsafe(boolean unsafe) { isUnsafe = unsafe; }
        public String getAssignedDriverName() { return assignedDriverName; }
        public void setAssignedDriverName(String assignedDriverName) { this.assignedDriverName = assignedDriverName; }
        public List<MaintenanceDTOs.MaintenanceDTO> getRecentMaintenance() { return recentMaintenance; }
        public void setRecentMaintenance(List<MaintenanceDTOs.MaintenanceDTO> recentMaintenance) { this.recentMaintenance = recentMaintenance; }
        public List<RepairDTOs.RepairDTO> getRecentRepairs() { return recentRepairs; }
        public void setRecentRepairs(List<RepairDTOs.RepairDTO> recentRepairs) { this.recentRepairs = recentRepairs; }
        public InspectionDTOs.InspectionDTO getLatestInspection() { return latestInspection; }
        public void setLatestInspection(InspectionDTOs.InspectionDTO latestInspection) { this.latestInspection = latestInspection; }
    }
}
