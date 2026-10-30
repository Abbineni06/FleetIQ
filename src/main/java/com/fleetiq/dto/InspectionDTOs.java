package com.fleetiq.dto;

import com.fleetiq.entity.InspectionStatus;
import com.fleetiq.entity.ItemCondition;
import java.time.LocalDateTime;
import java.util.List;

public class InspectionDTOs {

    public static class InspectionItemDTO {
        private Long id;
        private String itemName;
        private ItemCondition status;
        private String notes;

        public InspectionItemDTO() {}
        public InspectionItemDTO(String itemName, ItemCondition status, String notes) {
            this.itemName = itemName;
            this.status = status;
            this.notes = notes;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public ItemCondition getStatus() { return status; }
        public void setStatus(ItemCondition status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class InspectionDTO {
        private Long id;
        private Long vehicleId;
        private String vehicleRegistration;
        private String vehicleModel;
        private LocalDateTime inspectionDate;
        private Long inspectorId;
        private String inspectorName;
        private InspectionStatus overallStatus;
        private boolean hasCriticalIssue;
        private String generalNotes;
        private List<InspectionItemDTO> items;

        public InspectionDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public LocalDateTime getInspectionDate() { return inspectionDate; }
        public void setInspectionDate(LocalDateTime inspectionDate) { this.inspectionDate = inspectionDate; }
        public Long getInspectorId() { return inspectorId; }
        public void setInspectorId(Long inspectorId) { this.inspectorId = inspectorId; }
        public String getInspectorName() { return inspectorName; }
        public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }
        public InspectionStatus getOverallStatus() { return overallStatus; }
        public void setOverallStatus(InspectionStatus overallStatus) { this.overallStatus = overallStatus; }
        public boolean isHasCriticalIssue() { return hasCriticalIssue; }
        public void setHasCriticalIssue(boolean hasCriticalIssue) { this.hasCriticalIssue = hasCriticalIssue; }
        public String getGeneralNotes() { return generalNotes; }
        public void setGeneralNotes(String generalNotes) { this.generalNotes = generalNotes; }
        public List<InspectionItemDTO> getItems() { return items; }
        public void setItems(List<InspectionItemDTO> items) { this.items = items; }
    }

    public static class InspectionCreateRequest {
        private Long vehicleId;
        private String generalNotes;
        private List<InspectionItemDTO> items;

        public InspectionCreateRequest() {}

        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getGeneralNotes() { return generalNotes; }
        public void setGeneralNotes(String generalNotes) { this.generalNotes = generalNotes; }
        public List<InspectionItemDTO> getItems() { return items; }
        public void setItems(List<InspectionItemDTO> items) { this.items = items; }
    }
}
