package com.fleetiq.service;

import com.fleetiq.dto.DashboardDTOs.*;
import com.fleetiq.dto.MaintenanceDTOs.PredictiveMaintenanceDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final RepairRecordRepository repairRepository;
    private final FuelRecordRepository fuelRepository;
    private final InspectionRecordRepository inspectionRepository;
    private final VehicleHealthScoreRepository healthRepository;
    private final MaintenanceService maintenanceService;

    public DashboardService(VehicleRepository vehicleRepository,
                            MaintenanceRecordRepository maintenanceRepository,
                            RepairRecordRepository repairRepository,
                            FuelRecordRepository fuelRepository,
                            InspectionRecordRepository inspectionRepository,
                            VehicleHealthScoreRepository healthRepository,
                            MaintenanceService maintenanceService) {
        this.vehicleRepository = vehicleRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.repairRepository = repairRepository;
        this.fuelRepository = fuelRepository;
        this.inspectionRepository = inspectionRepository;
        this.healthRepository = healthRepository;
        this.maintenanceService = maintenanceService;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        // 1. KPIs
        DashboardKPIsDTO kpis = new DashboardKPIsDTO();
        long totalVehicles = vehicleRepository.count();
        long activeVehicles = vehicleRepository.countByStatus(VehicleStatus.ACTIVE);
        long dueVehicles = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE_DUE);
        long inShopVehicles = vehicleRepository.countByStatus(VehicleStatus.IN_SHOP);

        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        BigDecimal monthlyMaint = maintenanceRepository.sumTotalCostSince(firstDayOfMonth);
        BigDecimal monthlyRepair = repairRepository.sumTotalCostSince(firstDayOfMonth);
        BigDecimal monthlyFuel = fuelRepository.sumTotalCostSince(firstDayOfMonth);
        BigDecimal monthlyTotal = monthlyMaint.add(monthlyRepair).add(monthlyFuel);

        Double avgHealth = healthRepository.findAverageFleetHealthScore();
        if (avgHealth == null) avgHealth = 88.0;

        kpis.setTotalVehicles(totalVehicles);
        kpis.setActiveVehicles(activeVehicles);
        kpis.setMaintenanceDueVehicles(dueVehicles);
        kpis.setInShopVehicles(inShopVehicles);
        kpis.setAverageFleetHealth(Math.round(avgHealth * 10.0) / 10.0);
        kpis.setMonthlyExpenses(monthlyTotal);
        kpis.setMonthlyMaintenanceCost(monthlyMaint);
        kpis.setMonthlyRepairCost(monthlyRepair);
        kpis.setMonthlyFuelCost(monthlyFuel);
        summary.setKpis(kpis);

        // 2. Upcoming Maintenance List
        List<PredictiveMaintenanceDTO> predictions = maintenanceService.getAllPredictions()
                .stream()
                .filter(p -> "OVERDUE".equals(p.getUrgency()) || "DUE_SOON".equals(p.getUrgency()) || "UPCOMING".equals(p.getUrgency()))
                .sorted(Comparator.comparingInt(PredictiveMaintenanceDTO::getRemainingKm))
                .limit(8)
                .collect(Collectors.toList());
        summary.setUpcomingMaintenance(predictions);

        // 3. Recent Activities (combining maintenance, repairs, inspections, fuel)
        List<RecentActivityDTO> activities = new ArrayList<>();

        maintenanceRepository.findTop10ByOrderByServiceDateDesc().forEach(m -> {
            activities.add(new RecentActivityDTO(
                    "M-" + m.getId(),
                    "MAINTENANCE_COMPLETED",
                    m.getMaintenanceType() + " Completed",
                    m.getWorkPerformed() + " ($" + m.getCost() + ")",
                    m.getVehicle().getRegistrationNumber(),
                    m.getServiceDate().atStartOfDay(),
                    "success"
            ));
        });

        repairRepository.findAll().stream()
                .sorted(Comparator.comparing(RepairRecord::getRepairDate).reversed())
                .limit(5)
                .forEach(r -> {
                    activities.add(new RecentActivityDTO(
                            "R-" + r.getId(),
                            "REPAIR_RECORDED",
                            r.getRepairCategory() + " Repair (" + r.getRepairStatus() + ")",
                            r.getProblemDescription() + " ($" + r.getCost() + ")",
                            r.getVehicle().getRegistrationNumber(),
                            r.getRepairDate().atStartOfDay(),
                            r.getRepairStatus() == RepairStatus.COMPLETED ? "info" : "warning"
                    ));
                });

        inspectionRepository.findTop10ByOrderByInspectionDateDesc().forEach(i -> {
            activities.add(new RecentActivityDTO(
                    "I-" + i.getId(),
                    i.isHasCriticalIssue() ? "CRITICAL_ISSUE" : "INSPECTION_SUBMITTED",
                    i.isHasCriticalIssue() ? "Critical Safety Defect Logged" : "Daily Inspection Passed",
                    i.getGeneralNotes() != null ? i.getGeneralNotes() : "Inspection checklist verified",
                    i.getVehicle().getRegistrationNumber(),
                    i.getInspectionDate(),
                    i.isHasCriticalIssue() ? "danger" : "success"
                ));
        });

        activities.sort(Comparator.comparing(RecentActivityDTO::getTimestamp).reversed());
        summary.setRecentActivities(activities.stream().limit(8).collect(Collectors.toList()));

        // 4. Charts Data (Last 6 Months)
        DashboardChartsDTO charts = new DashboardChartsDTO();
        List<String> monthLabels = new ArrayList<>();
        List<BigDecimal> maintCosts = new ArrayList<>();
        List<BigDecimal> fuelCosts = new ArrayList<>();
        List<BigDecimal> repairCosts = new ArrayList<>();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate mDate = now.minusMonths(i);
            LocalDate start = mDate.withDayOfMonth(1);
            LocalDate end = mDate.withDayOfMonth(mDate.lengthOfMonth());
            monthLabels.add(start.format(dtf));

            // Maintenance cost for this month
            BigDecimal mSum = maintenanceRepository.findAll().stream()
                    .filter(m -> !m.getServiceDate().isBefore(start) && !m.getServiceDate().isAfter(end))
                    .map(MaintenanceRecord::getCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            maintCosts.add(mSum);

            // Fuel cost for this month
            BigDecimal fSum = fuelRepository.findAll().stream()
                    .filter(f -> !f.getFuelDate().isBefore(start) && !f.getFuelDate().isAfter(end))
                    .map(FuelRecord::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            fuelCosts.add(fSum);

            // Repair cost for this month
            BigDecimal rSum = repairRepository.findAll().stream()
                    .filter(r -> !r.getRepairDate().isBefore(start) && !r.getRepairDate().isAfter(end))
                    .map(RepairRecord::getCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            repairCosts.add(rSum);
        }

        charts.setMonthLabels(monthLabels);
        charts.setMonthlyMaintenanceExpenses(maintCosts);
        charts.setMonthlyFuelExpenses(fuelCosts);
        charts.setMonthlyRepairExpenses(repairCosts);

        // Health Distribution
        Map<String, Long> healthDist = new LinkedHashMap<>();
        healthDist.put("Excellent (85-100)", 0L);
        healthDist.put("Good (70-84)", 0L);
        healthDist.put("Needs Attention (50-69)", 0L);
        healthDist.put("Poor (<50)", 0L);
        healthDist.put("Unsafe / Grounded", 0L);

        List<Vehicle> allVehicles = vehicleRepository.findAll();
        for (Vehicle v : allVehicles) {
            if (v.getStatus() == VehicleStatus.UNSAFE) {
                healthDist.put("Unsafe / Grounded", healthDist.get("Unsafe / Grounded") + 1);
            } else {
                VehicleHealthScore h = healthRepository.findTopByVehicleOrderByCalculatedAtDesc(v).orElse(null);
                int score = h != null ? h.getOverallScore() : 85;
                if (score >= 85) healthDist.put("Excellent (85-100)", healthDist.get("Excellent (85-100)") + 1);
                else if (score >= 70) healthDist.put("Good (70-84)", healthDist.get("Good (70-84)") + 1);
                else if (score >= 50) healthDist.put("Needs Attention (50-69)", healthDist.get("Needs Attention (50-69)") + 1);
                else healthDist.put("Poor (<50)", healthDist.get("Poor (<50)") + 1);
            }
        }
        charts.setHealthDistribution(healthDist);

        // Status Distribution
        Map<String, Long> statusDist = new LinkedHashMap<>();
        statusDist.put("Active", vehicleRepository.countByStatus(VehicleStatus.ACTIVE));
        statusDist.put("Maintenance Due", vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE_DUE));
        statusDist.put("In Shop", vehicleRepository.countByStatus(VehicleStatus.IN_SHOP));
        statusDist.put("Unsafe", vehicleRepository.countByStatus(VehicleStatus.UNSAFE));
        charts.setStatusDistribution(statusDist);

        // Fuel efficiency vehicle ranking
        List<String> fuelVehicles = new ArrayList<>();
        List<Double> fuelEfficiency = new ArrayList<>();
        for (Vehicle v : allVehicles.stream().limit(6).collect(Collectors.toList())) {
            Double avgM = fuelRepository.averageMileageByVehicleId(v.getId());
            fuelVehicles.add(v.getRegistrationNumber());
            fuelEfficiency.add(avgM != null ? Math.round(avgM * 10.0) / 10.0 : 0.0);
        }
        charts.setFuelEfficiencyVehicleLabels(fuelVehicles);
        charts.setFuelEfficiencyValues(fuelEfficiency);

        summary.setCharts(charts);
        return summary;
    }
}
