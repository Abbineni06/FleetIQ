package com.fleetiq.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ReportDTOs {

    public static class FleetReportDTO {
        private String reportType;
        private String dateRange;
        private BigDecimal totalFleetCost;
        private BigDecimal totalMaintenanceCost;
        private BigDecimal totalRepairCost;
        private BigDecimal totalFuelCost;
        private long totalVehicles;
        private Double avgFleetMileage;
        private Double avgFleetHealth;
        private List<Map<String, Object>> tableData;
        private List<String> chartLabels;
        private List<BigDecimal> chartValues;

        public FleetReportDTO() {}

        public String getReportType() { return reportType; }
        public void setReportType(String reportType) { this.reportType = reportType; }
        public String getDateRange() { return dateRange; }
        public void setDateRange(String dateRange) { this.dateRange = dateRange; }
        public BigDecimal getTotalFleetCost() { return totalFleetCost; }
        public void setTotalFleetCost(BigDecimal totalFleetCost) { this.totalFleetCost = totalFleetCost; }
        public BigDecimal getTotalMaintenanceCost() { return totalMaintenanceCost; }
        public void setTotalMaintenanceCost(BigDecimal totalMaintenanceCost) { this.totalMaintenanceCost = totalMaintenanceCost; }
        public BigDecimal getTotalRepairCost() { return totalRepairCost; }
        public void setTotalRepairCost(BigDecimal totalRepairCost) { this.totalRepairCost = totalRepairCost; }
        public BigDecimal getTotalFuelCost() { return totalFuelCost; }
        public void setTotalFuelCost(BigDecimal totalFuelCost) { this.totalFuelCost = totalFuelCost; }
        public long getTotalVehicles() { return totalVehicles; }
        public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }
        public Double getAvgFleetMileage() { return avgFleetMileage; }
        public void setAvgFleetMileage(Double avgFleetMileage) { this.avgFleetMileage = avgFleetMileage; }
        public Double getAvgFleetHealth() { return avgFleetHealth; }
        public void setAvgFleetHealth(Double avgFleetHealth) { this.avgFleetHealth = avgFleetHealth; }
        public List<Map<String, Object>> getTableData() { return tableData; }
        public void setTableData(List<Map<String, Object>> tableData) { this.tableData = tableData; }
        public List<String> getChartLabels() { return chartLabels; }
        public void setChartLabels(List<String> chartLabels) { this.chartLabels = chartLabels; }
        public List<BigDecimal> getChartValues() { return chartValues; }
        public void setChartValues(List<BigDecimal> chartValues) { this.chartValues = chartValues; }
    }
}
