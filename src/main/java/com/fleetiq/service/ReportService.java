package com.fleetiq.service;

import com.fleetiq.dto.ReportDTOs.FleetReportDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final RepairRecordRepository repairRepository;
    private final FuelRecordRepository fuelRepository;
    private final VehicleHealthScoreRepository healthRepository;

    public ReportService(VehicleRepository vehicleRepository,
                         MaintenanceRecordRepository maintenanceRepository,
                         RepairRecordRepository repairRepository,
                         FuelRecordRepository fuelRepository,
                         VehicleHealthScoreRepository healthRepository) {
        this.vehicleRepository = vehicleRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.repairRepository = repairRepository;
        this.fuelRepository = fuelRepository;
        this.healthRepository = healthRepository;
    }

    public FleetReportDTO generateReport(String type, String dateRange, Long vehicleId) {
        FleetReportDTO report = new FleetReportDTO();
        String reportCat = (type != null && !type.isBlank()) ? type.toUpperCase() : "TOTAL_EXPENDITURE";
        report.setReportType(reportCat);
        report.setDateRange(dateRange != null ? dateRange : "Past 12 Months");

        List<Vehicle> vehicles = vehicleId != null
                ? vehicleRepository.findById(vehicleId).map(List::of).orElseGet(vehicleRepository::findAllOrdered)
                : vehicleRepository.findAllOrdered();

        report.setTotalVehicles(vehicles.size());

        BigDecimal totalMaint;
        BigDecimal totalRepair;
        BigDecimal totalFuel;

        if (vehicleId != null) {
            totalMaint = maintenanceRepository.sumCostByVehicleId(vehicleId);
            totalRepair = repairRepository.sumCostByVehicleId(vehicleId);
            totalFuel = fuelRepository.sumCostByVehicleId(vehicleId);

            Double avgMileage = fuelRepository.averageMileageByVehicleId(vehicleId);
            report.setAvgFleetMileage(avgMileage != null ? Math.round(avgMileage * 100.0) / 100.0 : 0.0);

            Optional<VehicleHealthScore> latestScore = vehicleRepository.findById(vehicleId)
                    .flatMap(healthRepository::findTopByVehicleOrderByCalculatedAtDesc);
            report.setAvgFleetHealth(latestScore.map(s -> (double) s.getOverallScore()).orElse(85.0));
        } else {
            totalMaint = maintenanceRepository.sumTotalCost();
            totalRepair = repairRepository.sumTotalCost();
            totalFuel = fuelRepository.sumTotalCost();

            Double avgMileage = fuelRepository.averageFleetMileage();
            report.setAvgFleetMileage(avgMileage != null ? Math.round(avgMileage * 100.0) / 100.0 : 0.0);

            Double avgHealth = healthRepository.findAverageFleetHealthScore();
            report.setAvgFleetHealth(avgHealth != null ? Math.round(avgHealth * 10.0) / 10.0 : 88.0);
        }

        report.setTotalMaintenanceCost(totalMaint);
        report.setTotalRepairCost(totalRepair);
        report.setTotalFuelCost(totalFuel);
        report.setTotalFleetCost(totalMaint.add(totalRepair).add(totalFuel));

        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> chartLabels = new ArrayList<>();
        List<BigDecimal> chartValues = new ArrayList<>();

        for (Vehicle v : vehicles) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vehicleId", v.getId());
            row.put("registrationNumber", v.getRegistrationNumber());
            row.put("model", v.getMake() + " " + v.getModel());
            row.put("type", v.getVehicleType());
            row.put("fuelType", v.getFuelType());
            row.put("status", v.getStatus().name());
            row.put("odometer", v.getCurrentOdometer() + " KM");

            BigDecimal vMaint = maintenanceRepository.sumCostByVehicleId(v.getId());
            BigDecimal vRepair = repairRepository.sumCostByVehicleId(v.getId());
            BigDecimal vFuel = fuelRepository.sumCostByVehicleId(v.getId());
            BigDecimal vTotal = vMaint.add(vRepair).add(vFuel);

            Double vAvgKml = fuelRepository.averageMileageByVehicleId(v.getId());
            row.put("avgMileageKml", vAvgKml != null && vAvgKml > 0 ? String.format("%.2f KM/L", vAvgKml) : (v.getFuelType().equalsIgnoreCase("Electric") ? "N/A (EV)" : "4.50 KM/L"));

            row.put("maintenanceCost", "$" + vMaint);
            row.put("repairCost", "$" + vRepair);
            row.put("fuelCost", "$" + vFuel);
            row.put("totalExpense", "$" + vTotal);

            rows.add(row);

            chartLabels.add(v.getRegistrationNumber());

            if ("FUEL_EXPENSE".equals(reportCat)) {
                chartValues.add(vFuel);
            } else if ("ANNUAL_MAINTENANCE".equals(reportCat)) {
                chartValues.add(vMaint);
            } else if ("ANNUAL_REPAIRS".equals(reportCat)) {
                chartValues.add(vRepair);
            } else {
                chartValues.add(vTotal);
            }
        }

        report.setTableData(rows);
        report.setChartLabels(chartLabels);
        report.setChartValues(chartValues);

        return report;
    }

    public String exportToCsv(FleetReportDTO report) {
        StringBuilder csv = new StringBuilder();
        String cat = report.getReportType() != null ? report.getReportType().toUpperCase() : "TOTAL_EXPENDITURE";

        if ("FUEL_EXPENSE".equals(cat)) {
            csv.append("Registration Number,Vehicle Model,Type,Fuel Type,Status,Current Odometer,Average Mileage,Fuel Expense\n");
            if (report.getTableData() != null) {
                for (Map<String, Object> row : report.getTableData()) {
                    csv.append(escape(row.get("registrationNumber"))).append(",")
                       .append(escape(row.get("model"))).append(",")
                       .append(escape(row.get("type"))).append(",")
                       .append(escape(row.get("fuelType"))).append(",")
                       .append(escape(row.get("status"))).append(",")
                       .append(escape(row.get("odometer"))).append(",")
                       .append(escape(row.get("avgMileageKml"))).append(",")
                       .append(escape(row.get("fuelCost"))).append("\n");
                }
            }
        } else if ("ANNUAL_MAINTENANCE".equals(cat)) {
            csv.append("Registration Number,Vehicle Model,Type,Status,Current Odometer,Maintenance Cost\n");
            if (report.getTableData() != null) {
                for (Map<String, Object> row : report.getTableData()) {
                    csv.append(escape(row.get("registrationNumber"))).append(",")
                       .append(escape(row.get("model"))).append(",")
                       .append(escape(row.get("type"))).append(",")
                       .append(escape(row.get("status"))).append(",")
                       .append(escape(row.get("odometer"))).append(",")
                       .append(escape(row.get("maintenanceCost"))).append("\n");
                }
            }
        } else if ("ANNUAL_REPAIRS".equals(cat)) {
            csv.append("Registration Number,Vehicle Model,Type,Status,Current Odometer,Repair Cost\n");
            if (report.getTableData() != null) {
                for (Map<String, Object> row : report.getTableData()) {
                    csv.append(escape(row.get("registrationNumber"))).append(",")
                       .append(escape(row.get("model"))).append(",")
                       .append(escape(row.get("type"))).append(",")
                       .append(escape(row.get("status"))).append(",")
                       .append(escape(row.get("odometer"))).append(",")
                       .append(escape(row.get("repairCost"))).append("\n");
                }
            }
        } else {
            csv.append("Registration Number,Vehicle Model,Type,Status,Odometer,Maintenance Cost,Repair Cost,Fuel Cost,Total Cost\n");
            if (report.getTableData() != null) {
                for (Map<String, Object> row : report.getTableData()) {
                    csv.append(escape(row.get("registrationNumber"))).append(",")
                       .append(escape(row.get("model"))).append(",")
                       .append(escape(row.get("type"))).append(",")
                       .append(escape(row.get("status"))).append(",")
                       .append(escape(row.get("odometer"))).append(",")
                       .append(escape(row.get("maintenanceCost"))).append(",")
                       .append(escape(row.get("repairCost"))).append(",")
                       .append(escape(row.get("fuelCost"))).append(",")
                       .append(escape(row.get("totalExpense"))).append("\n");
                }
            }
        }
        return csv.toString();
    }

    private String escape(Object val) {
        if (val == null) return "\"\"";
        return "\"" + val.toString().replace("\"", "\"\"") + "\"";
    }
}
