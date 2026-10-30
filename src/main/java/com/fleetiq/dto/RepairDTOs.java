package com.fleetiq.dto;

import com.fleetiq.entity.RepairStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public class RepairDTOs {

    public static class RepairDTO {
        private Long id;
        private Long vehicleId;
        private String vehicleRegistration;
        private String vehicleModel;
        private LocalDate repairDate;
        private String problemDescription;
        private String repairCategory;
        private String partsReplaced;
        private BigDecimal cost;
        private String mechanicName;
        private RepairStatus repairStatus;
        private LocalDate completedDate;
        private String notes;

        public RepairDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public LocalDate getRepairDate() { return repairDate; }
        public void setRepairDate(LocalDate repairDate) { this.repairDate = repairDate; }
        public String getProblemDescription() { return problemDescription; }
        public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }
        public String getRepairCategory() { return repairCategory; }
        public void setRepairCategory(String repairCategory) { this.repairCategory = repairCategory; }
        public String getPartsReplaced() { return partsReplaced; }
        public void setPartsReplaced(String partsReplaced) { this.partsReplaced = partsReplaced; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        public String getMechanicName() { return mechanicName; }
        public void setMechanicName(String mechanicName) { this.mechanicName = mechanicName; }
        public RepairStatus getRepairStatus() { return repairStatus; }
        public void setRepairStatus(RepairStatus repairStatus) { this.repairStatus = repairStatus; }
        public LocalDate getCompletedDate() { return completedDate; }
        public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class RepairCreateRequest {
        private Long vehicleId;
        private LocalDate repairDate;
        private String problemDescription;
        private String repairCategory;
        private String partsReplaced;
        private BigDecimal cost;
        private String mechanicName;
        private RepairStatus repairStatus;
        private String notes;

        public RepairCreateRequest() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public LocalDate getRepairDate() { return repairDate; }
        public void setRepairDate(LocalDate repairDate) { this.repairDate = repairDate; }
        public String getProblemDescription() { return problemDescription; }
        public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }
        public String getRepairCategory() { return repairCategory; }
        public void setRepairCategory(String repairCategory) { this.repairCategory = repairCategory; }
        public String getPartsReplaced() { return partsReplaced; }
        public void setPartsReplaced(String partsReplaced) { this.partsReplaced = partsReplaced; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        public String getMechanicName() { return mechanicName; }
        public void setMechanicName(String mechanicName) { this.mechanicName = mechanicName; }
        public RepairStatus getRepairStatus() { return repairStatus; }
        public void setRepairStatus(RepairStatus repairStatus) { this.repairStatus = repairStatus; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class RepairStatusUpdateRequest {
        private RepairStatus repairStatus;
        private LocalDate completedDate;
        private BigDecimal finalCost;
        private String notes;

        public RepairStatusUpdateRequest() {}

        public RepairStatus getRepairStatus() { return repairStatus; }
        public void setRepairStatus(RepairStatus repairStatus) { this.repairStatus = repairStatus; }
        public LocalDate getCompletedDate() { return completedDate; }
        public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
        public BigDecimal getFinalCost() { return finalCost; }
        public void setFinalCost(BigDecimal finalCost) { this.finalCost = finalCost; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
