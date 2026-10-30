package com.fleetiq.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_health_scores")
public class VehicleHealthScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore; // 0 - 100

    @Column(nullable = false, length = 30)
    private String category; // "Excellent", "Good", "Needs Attention", "Poor"

    @Column(name = "maintenance_compliance_score", nullable = false)
    private Integer maintenanceComplianceScore; // 0 - 100

    @Column(name = "inspection_score", nullable = false)
    private Integer inspectionScore; // 0 - 100

    @Column(name = "repair_frequency_score", nullable = false)
    private Integer repairFrequencyScore; // 0 - 100

    @Column(name = "overdue_penalty", nullable = false)
    private Integer overduePenalty = 0; // deduction points

    @Column(columnDefinition = "TEXT")
    private String reasons; // JSON or bulleted string of deductions

    @Column(name = "recommended_actions", columnDefinition = "TEXT")
    private String recommendedActions;

    @PrePersist
    protected void onCreate() {
        if (calculatedAt == null) {
            calculatedAt = LocalDateTime.now();
        }
    }

    public VehicleHealthScore() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

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

    public String getReasons() { return reasons; }
    public void setReasons(String reasons) { this.reasons = reasons; }

    public String getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(String recommendedActions) { this.recommendedActions = recommendedActions; }
}
