package com.fleetiq.dto;

import java.time.LocalDateTime;
import java.util.List;

public class HealthDTOs {

    public static class HealthScoreDTO {
        private Long id;
        private Long vehicleId;
        private String vehicleRegistration;
        private String vehicleModel;
        private LocalDateTime calculatedAt;
        private Integer overallScore;
        private String category;
        private Integer maintenanceComplianceScore;
        private Integer inspectionScore;
        private Integer repairFrequencyScore;
        private Integer overduePenalty;
        private boolean isUnsafe;
        private String reasons;
        private String recommendedActions;

        public HealthScoreDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public LocalDateTime getCalculatedAt() { return calculatedAt; }
        public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
        public Integer getOverallScore() { return overallScore; }
        public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getMaintenanceComplianceScore() { return maintenanceComplianceScore; }
        public void setMaintenanceComplianceScore(Integer maintenanceComplianceScore) { this.maintenanceComplianceScore = maintenanceComplianceScore; }
        public Integer getInspectionScore() { return inspectionScore; }
        public void setInspectionScore(Integer inspectionScore) { this.inspectionScore = inspectionScore; }
        public Integer getRepairFrequencyScore() { return repairFrequencyScore; }
        public void setRepairFrequencyScore(Integer repairFrequencyScore) { this.repairFrequencyScore = repairFrequencyScore; }
        public Integer getOverduePenalty() { return overduePenalty; }
        public void setOverduePenalty(Integer overduePenalty) { this.overduePenalty = overduePenalty; }
        public boolean isUnsafe() { return isUnsafe; }
        public void setUnsafe(boolean unsafe) { isUnsafe = unsafe; }
        public String getReasons() { return reasons; }
        public void setReasons(String reasons) { this.reasons = reasons; }
        public String getRecommendedActions() { return recommendedActions; }
        public void setRecommendedActions(String recommendedActions) { this.recommendedActions = recommendedActions; }
    }

    public static class HealthSummaryDTO {
        private Double averageFleetHealth;
        private long excellentCount;
        private long goodCount;
        private long needsAttentionCount;
        private long poorCount;
        private long unsafeCount;
        private List<HealthScoreDTO> vehicleScores;

        public HealthSummaryDTO() {}

        public Double getAverageFleetHealth() { return averageFleetHealth; }
        public void setAverageFleetHealth(Double averageFleetHealth) { this.averageFleetHealth = averageFleetHealth; }
        public long getExcellentCount() { return excellentCount; }
        public void setExcellentCount(long excellentCount) { this.excellentCount = excellentCount; }
        public long getGoodCount() { return goodCount; }
        public void setGoodCount(long goodCount) { this.goodCount = goodCount; }
        public long getNeedsAttentionCount() { return needsAttentionCount; }
        public void setNeedsAttentionCount(long needsAttentionCount) { this.needsAttentionCount = needsAttentionCount; }
        public long getPoorCount() { return poorCount; }
        public void setPoorCount(long poorCount) { this.poorCount = poorCount; }
        public long getUnsafeCount() { return unsafeCount; }
        public void setUnsafeCount(long unsafeCount) { this.unsafeCount = unsafeCount; }
        public List<HealthScoreDTO> getVehicleScores() { return vehicleScores; }
        public void setVehicleScores(List<HealthScoreDTO> vehicleScores) { this.vehicleScores = vehicleScores; }
    }
}
