package com.fleetiq.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MaintenanceDTOs {

    public static class MaintenanceDTO {
        private Long id;
        private Long vehicleId;
        private String vehicleRegistration;
        private String vehicleModel;
        private LocalDate serviceDate;
        private Integer odometerKm;
        private String maintenanceType;
        private String workPerformed;
        private String partsReplaced;
        private String mechanicName;
        private BigDecimal cost;
        private Integer nextServiceKm;
        private String notes;

        public MaintenanceDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public LocalDate getServiceDate() { return serviceDate; }
        public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
        public Integer getOdometerKm() { return odometerKm; }
        public void setOdometerKm(Integer odometerKm) { this.odometerKm = odometerKm; }
        public String getMaintenanceType() { return maintenanceType; }
        public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
        public String getWorkPerformed() { return workPerformed; }
        public void setWorkPerformed(String workPerformed) { this.workPerformed = workPerformed; }
        public String getPartsReplaced() { return partsReplaced; }
        public void setPartsReplaced(String partsReplaced) { this.partsReplaced = partsReplaced; }
        public String getMechanicName() { return mechanicName; }
        public void setMechanicName(String mechanicName) { this.mechanicName = mechanicName; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        public Integer getNextServiceKm() { return nextServiceKm; }
        public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class MaintenanceCreateRequest {
        private Long vehicleId;
        private LocalDate serviceDate;
        private Integer odometerKm;
        private String maintenanceType;
        private String workPerformed;
        private String partsReplaced;
        private String mechanicName;
        private BigDecimal cost;
        private Integer serviceIntervalKm;
        private String notes;

        public MaintenanceCreateRequest() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public LocalDate getServiceDate() { return serviceDate; }
        public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
        public Integer getOdometerKm() { return odometerKm; }
        public void setOdometerKm(Integer odometerKm) { this.odometerKm = odometerKm; }
        public String getMaintenanceType() { return maintenanceType; }
        public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
        public String getWorkPerformed() { return workPerformed; }
        public void setWorkPerformed(String workPerformed) { this.workPerformed = workPerformed; }
        public String getPartsReplaced() { return partsReplaced; }
        public void setPartsReplaced(String partsReplaced) { this.partsReplaced = partsReplaced; }
        public String getMechanicName() { return mechanicName; }
        public void setMechanicName(String mechanicName) { this.mechanicName = mechanicName; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        public Integer getServiceIntervalKm() { return serviceIntervalKm; }
        public void setServiceIntervalKm(Integer serviceIntervalKm) { this.serviceIntervalKm = serviceIntervalKm; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PredictiveMaintenanceDTO {
        private Long vehicleId;
        private String registrationNumber;
        private String vehicleModel;
        private Integer currentOdometer;
        private Integer lastServiceKm;
        private Integer nextServiceKm;
        private Integer remainingKm;
        private Double avgDailyDistanceKm;
        private Integer estimatedDaysRemaining;
        private LocalDate predictedServiceDate;
        private String urgency; // "NORMAL", "UPCOMING", "DUE_SOON", "OVERDUE"
        private boolean hasSufficientData;
        private String statusMessage;

        public PredictiveMaintenanceDTO() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public Integer getCurrentOdometer() { return currentOdometer; }
        public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }
        public Integer getLastServiceKm() { return lastServiceKm; }
        public void setLastServiceKm(Integer lastServiceKm) { this.lastServiceKm = lastServiceKm; }
        public Integer getNextServiceKm() { return nextServiceKm; }
        public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }
        public Integer getRemainingKm() { return remainingKm; }
        public void setRemainingKm(Integer remainingKm) { this.remainingKm = remainingKm; }
        public Double getAvgDailyDistanceKm() { return avgDailyDistanceKm; }
        public void setAvgDailyDistanceKm(Double avgDailyDistanceKm) { this.avgDailyDistanceKm = avgDailyDistanceKm; }
        public Integer getEstimatedDaysRemaining() { return estimatedDaysRemaining; }
        public void setEstimatedDaysRemaining(Integer estimatedDaysRemaining) { this.estimatedDaysRemaining = estimatedDaysRemaining; }
        public LocalDate getPredictedServiceDate() { return predictedServiceDate; }
        public void setPredictedServiceDate(LocalDate predictedServiceDate) { this.predictedServiceDate = predictedServiceDate; }
        public String getUrgency() { return urgency; }
        public void setUrgency(String urgency) { this.urgency = urgency; }
        public boolean isHasSufficientData() { return hasSufficientData; }
        public void setHasSufficientData(boolean hasSufficientData) { this.hasSufficientData = hasSufficientData; }
        public String getStatusMessage() { return statusMessage; }
        public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
    }
}
