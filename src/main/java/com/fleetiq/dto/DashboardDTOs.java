package com.fleetiq.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DashboardDTOs {

    public static class DashboardSummaryDTO {
        private DashboardKPIsDTO kpis;
        private List<MaintenanceDTOs.PredictiveMaintenanceDTO> upcomingMaintenance;
        private List<RecentActivityDTO> recentActivities;
        private DashboardChartsDTO charts;

        public DashboardSummaryDTO() {}

        public DashboardKPIsDTO getKpis() { return kpis; }
        public void setKpis(DashboardKPIsDTO kpis) { this.kpis = kpis; }
        public List<MaintenanceDTOs.PredictiveMaintenanceDTO> getUpcomingMaintenance() { return upcomingMaintenance; }
        public void setUpcomingMaintenance(List<MaintenanceDTOs.PredictiveMaintenanceDTO> upcomingMaintenance) { this.upcomingMaintenance = upcomingMaintenance; }
        public List<RecentActivityDTO> getRecentActivities() { return recentActivities; }
        public void setRecentActivities(List<RecentActivityDTO> recentActivities) { this.recentActivities = recentActivities; }
        public DashboardChartsDTO getCharts() { return charts; }
        public void setCharts(DashboardChartsDTO charts) { this.charts = charts; }
    }

    public static class DashboardKPIsDTO {
        private long totalVehicles;
        private long activeVehicles;
        private long maintenanceDueVehicles;
        private long inShopVehicles;
        private Double averageFleetHealth;
        private BigDecimal monthlyExpenses;
        private BigDecimal monthlyMaintenanceCost;
        private BigDecimal monthlyRepairCost;
        private BigDecimal monthlyFuelCost;

        public DashboardKPIsDTO() {}

        public long getTotalVehicles() { return totalVehicles; }
        public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }
        public long getActiveVehicles() { return activeVehicles; }
        public void setActiveVehicles(long activeVehicles) { this.activeVehicles = activeVehicles; }
        public long getMaintenanceDueVehicles() { return maintenanceDueVehicles; }
        public void setMaintenanceDueVehicles(long maintenanceDueVehicles) { this.maintenanceDueVehicles = maintenanceDueVehicles; }
        public long getInShopVehicles() { return inShopVehicles; }
        public void setInShopVehicles(long inShopVehicles) { this.inShopVehicles = inShopVehicles; }
        public Double getAverageFleetHealth() { return averageFleetHealth; }
        public void setAverageFleetHealth(Double averageFleetHealth) { this.averageFleetHealth = averageFleetHealth; }
        public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
        public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }
        public BigDecimal getMonthlyMaintenanceCost() { return monthlyMaintenanceCost; }
        public void setMonthlyMaintenanceCost(BigDecimal monthlyMaintenanceCost) { this.monthlyMaintenanceCost = monthlyMaintenanceCost; }
        public BigDecimal getMonthlyRepairCost() { return monthlyRepairCost; }
        public void setMonthlyRepairCost(BigDecimal monthlyRepairCost) { this.monthlyRepairCost = monthlyRepairCost; }
        public BigDecimal getMonthlyFuelCost() { return monthlyFuelCost; }
        public void setMonthlyFuelCost(BigDecimal monthlyFuelCost) { this.monthlyFuelCost = monthlyFuelCost; }
    }

    public static class RecentActivityDTO {
        private String id;
        private String type; // VEHICLE_REGISTERED, MAINTENANCE_COMPLETED, REPAIR_RECORDED, FUEL_RECORDED, INSPECTION_SUBMITTED, CRITICAL_ISSUE
        private String title;
        private String description;
        private String vehicleRegistration;
        private LocalDateTime timestamp;
        private String statusBadge;

        public RecentActivityDTO() {}
        public RecentActivityDTO(String id, String type, String title, String description, String vehicleRegistration, LocalDateTime timestamp, String statusBadge) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.vehicleRegistration = vehicleRegistration;
            this.timestamp = timestamp;
            this.statusBadge = statusBadge;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getStatusBadge() { return statusBadge; }
        public void setStatusBadge(String statusBadge) { this.statusBadge = statusBadge; }
    }

    public static class DashboardChartsDTO {
        private List<String> monthLabels;
        private List<BigDecimal> monthlyMaintenanceExpenses;
        private List<BigDecimal> monthlyFuelExpenses;
        private List<BigDecimal> monthlyRepairExpenses;
        private Map<String, Long> healthDistribution; // Excellent, Good, Needs Attention, Poor, Unsafe
        private Map<String, Long> statusDistribution; // ACTIVE, MAINTENANCE_DUE, IN_SHOP, UNSAFE
        private List<String> fuelEfficiencyVehicleLabels;
        private List<Double> fuelEfficiencyValues;

        public DashboardChartsDTO() {}

        public List<String> getMonthLabels() { return monthLabels; }
        public void setMonthLabels(List<String> monthLabels) { this.monthLabels = monthLabels; }
        public List<BigDecimal> getMonthlyMaintenanceExpenses() { return monthlyMaintenanceExpenses; }
        public void setMonthlyMaintenanceExpenses(List<BigDecimal> monthlyMaintenanceExpenses) { this.monthlyMaintenanceExpenses = monthlyMaintenanceExpenses; }
        public List<BigDecimal> getMonthlyFuelExpenses() { return monthlyFuelExpenses; }
        public void setMonthlyFuelExpenses(List<BigDecimal> monthlyFuelExpenses) { this.monthlyFuelExpenses = monthlyFuelExpenses; }
        public List<BigDecimal> getMonthlyRepairExpenses() { return monthlyRepairExpenses; }
        public void setMonthlyRepairExpenses(List<BigDecimal> monthlyRepairExpenses) { this.monthlyRepairExpenses = monthlyRepairExpenses; }
        public Map<String, Long> getHealthDistribution() { return healthDistribution; }
        public void setHealthDistribution(Map<String, Long> healthDistribution) { this.healthDistribution = healthDistribution; }
        public Map<String, Long> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }
        public List<String> getFuelEfficiencyVehicleLabels() { return fuelEfficiencyVehicleLabels; }
        public void setFuelEfficiencyVehicleLabels(List<String> fuelEfficiencyVehicleLabels) { this.fuelEfficiencyVehicleLabels = fuelEfficiencyVehicleLabels; }
        public List<Double> getFuelEfficiencyValues() { return fuelEfficiencyValues; }
        public void setFuelEfficiencyValues(List<Double> fuelEfficiencyValues) { this.fuelEfficiencyValues = fuelEfficiencyValues; }
    }
}
