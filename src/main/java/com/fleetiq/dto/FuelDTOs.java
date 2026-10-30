package com.fleetiq.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FuelDTOs {

    public static class FuelDTO {
        private Long id;
        private Long vehicleId;
        private String vehicleRegistration;
        private String vehicleModel;
        private LocalDate fuelDate;
        private Integer odometerKm;
        private BigDecimal fuelQuantity;
        private BigDecimal pricePerLitre;
        private BigDecimal totalCost;
        private String fuelStation;
        private String fuelType;
        private boolean fullTank;
        private Integer distanceTravelled;
        private BigDecimal mileageKml;
        private String notes;

        public FuelDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public LocalDate getFuelDate() { return fuelDate; }
        public void setFuelDate(LocalDate fuelDate) { this.fuelDate = fuelDate; }
        public Integer getOdometerKm() { return odometerKm; }
        public void setOdometerKm(Integer odometerKm) { this.odometerKm = odometerKm; }
        public BigDecimal getFuelQuantity() { return fuelQuantity; }
        public void setFuelQuantity(BigDecimal fuelQuantity) { this.fuelQuantity = fuelQuantity; }
        public BigDecimal getPricePerLitre() { return pricePerLitre; }
        public void setPricePerLitre(BigDecimal pricePerLitre) { this.pricePerLitre = pricePerLitre; }
        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
        public String getFuelStation() { return fuelStation; }
        public void setFuelStation(String fuelStation) { this.fuelStation = fuelStation; }
        public String getFuelType() { return fuelType; }
        public void setFuelType(String fuelType) { this.fuelType = fuelType; }
        public boolean isFullTank() { return fullTank; }
        public void setFullTank(boolean fullTank) { this.fullTank = fullTank; }
        public Integer getDistanceTravelled() { return distanceTravelled; }
        public void setDistanceTravelled(Integer distanceTravelled) { this.distanceTravelled = distanceTravelled; }
        public BigDecimal getMileageKml() { return mileageKml; }
        public void setMileageKml(BigDecimal mileageKml) { this.mileageKml = mileageKml; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class FuelCreateRequest {
        private Long vehicleId;
        private LocalDate fuelDate;
        private Integer odometerKm;
        private BigDecimal fuelQuantity;
        private BigDecimal pricePerLitre;
        private String fuelStation;
        private String fuelType;
        private boolean fullTank = true;
        private String notes;

        public FuelCreateRequest() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public LocalDate getFuelDate() { return fuelDate; }
        public void setFuelDate(LocalDate fuelDate) { this.fuelDate = fuelDate; }
        public Integer getOdometerKm() { return odometerKm; }
        public void setOdometerKm(Integer odometerKm) { this.odometerKm = odometerKm; }
        public BigDecimal getFuelQuantity() { return fuelQuantity; }
        public void setFuelQuantity(BigDecimal fuelQuantity) { this.fuelQuantity = fuelQuantity; }
        public BigDecimal getPricePerLitre() { return pricePerLitre; }
        public void setPricePerLitre(BigDecimal pricePerLitre) { this.pricePerLitre = pricePerLitre; }
        public String getFuelStation() { return fuelStation; }
        public void setFuelStation(String fuelStation) { this.fuelStation = fuelStation; }
        public String getFuelType() { return fuelType; }
        public void setFuelType(String fuelType) { this.fuelType = fuelType; }
        public boolean isFullTank() { return fullTank; }
        public void setFullTank(boolean fullTank) { this.fullTank = fullTank; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class FuelEfficiencyComparisonDTO {
        private Long vehicleId;
        private String registrationNumber;
        private String vehicleModel;
        private String fuelType;
        private Double avgMileageKml;
        private BigDecimal totalFuelExpense;
        private Integer totalDistance;

        public FuelEfficiencyComparisonDTO() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public String getFuelType() { return fuelType; }
        public void setFuelType(String fuelType) { this.fuelType = fuelType; }
        public Double getAvgMileageKml() { return avgMileageKml; }
        public void setAvgMileageKml(Double avgMileageKml) { this.avgMileageKml = avgMileageKml; }
        public BigDecimal getTotalFuelExpense() { return totalFuelExpense; }
        public void setTotalFuelExpense(BigDecimal totalFuelExpense) { this.totalFuelExpense = totalFuelExpense; }
        public Integer getTotalDistance() { return totalDistance; }
        public void setTotalDistance(Integer totalDistance) { this.totalDistance = totalDistance; }
    }
}
