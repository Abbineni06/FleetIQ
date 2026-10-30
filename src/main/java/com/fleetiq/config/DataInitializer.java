package com.fleetiq.config;

import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import com.fleetiq.service.HealthScoreService;
import com.fleetiq.service.NotificationService;
import com.fleetiq.service.QrCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final OdometerReadingRepository odometerRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final RepairRecordRepository repairRepository;
    private final FuelRecordRepository fuelRepository;
    private final InspectionRecordRepository inspectionRepository;
    private final SystemSettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;
    private final HealthScoreService healthScoreService;
    private final QrCodeService qrCodeService;
    private final NotificationService notificationService;

    public DataInitializer(UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           OdometerReadingRepository odometerRepository,
                           MaintenanceRecordRepository maintenanceRepository,
                           RepairRecordRepository repairRepository,
                           FuelRecordRepository fuelRepository,
                           InspectionRecordRepository inspectionRepository,
                           SystemSettingRepository settingRepository,
                           PasswordEncoder passwordEncoder,
                           HealthScoreService healthScoreService,
                           QrCodeService qrCodeService,
                           NotificationService notificationService) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.odometerRepository = odometerRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.repairRepository = repairRepository;
        this.fuelRepository = fuelRepository;
        this.inspectionRepository = inspectionRepository;
        this.settingRepository = settingRepository;
        this.passwordEncoder = passwordEncoder;
        this.healthScoreService = healthScoreService;
        this.qrCodeService = qrCodeService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("FleetIQ database already contains users. Skipping initial seed.");
            return;
        }

        logger.info("Initializing FleetIQ enterprise dataset...");

        // 1. Create Default Users
        User admin = userRepository.save(new User(
                "admin", "admin@fleetiq.io", passwordEncoder.encode("admin123"), "Alex Morgan", "+1 (555) 019-2831", Role.ROLE_ADMIN));

        User manager = userRepository.save(new User(
                "manager", "manager@fleetiq.io", passwordEncoder.encode("manager123"), "Sarah Jenkins", "+1 (555) 019-4822", Role.ROLE_MANAGER));

        User driver1 = userRepository.save(new User(
                "driver1", "david.m@fleetiq.io", passwordEncoder.encode("driver123"), "David Miller", "+1 (555) 019-7714", Role.ROLE_DRIVER));

        User driver2 = userRepository.save(new User(
                "driver2", "elena.g@fleetiq.io", passwordEncoder.encode("driver123"), "Elena Gomez", "+1 (555) 019-9923", Role.ROLE_DRIVER));

        User driver3 = userRepository.save(new User(
                "driver3", "james.w@fleetiq.io", passwordEncoder.encode("driver123"), "James Wilson", "+1 (555) 019-3388", Role.ROLE_DRIVER));

        // 2. System Settings
        settingRepository.save(new SystemSetting("upcoming_service_threshold_km", "1000", "Warning threshold for upcoming maintenance"));
        settingRepository.save(new SystemSetting("due_soon_threshold_km", "500", "High priority threshold for maintenance due soon"));
        settingRepository.save(new SystemSetting("weight_maintenance_compliance", "30", "Weight percent for maintenance compliance"));
        settingRepository.save(new SystemSetting("weight_inspection_results", "30", "Weight percent for inspection checklist results"));
        settingRepository.save(new SystemSetting("weight_repair_frequency", "20", "Weight percent for repair history frequency"));
        settingRepository.save(new SystemSetting("weight_overdue_penalty", "20", "Weight percent penalty for overdue mileage"));

        // 3. Vehicles
        Vehicle v1 = createVehicle("FL-101", "1FT8W3BT9NED12001", "Freightliner", "Cascadia 126", 2022, "Heavy Truck", "Diesel", driver1, 82400, 75000, 15000, 90000, VehicleStatus.ACTIVE, LocalDate.now().minusMonths(14), "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80");
        Vehicle v2 = createVehicle("FL-102", "WD3PF4CD6KP088219", "Mercedes-Benz", "Sprinter 3500", 2023, "Cargo Van", "Diesel", driver2, 39580, 30000, 10000, 40000, VehicleStatus.MAINTENANCE_DUE, LocalDate.now().minusMonths(10), "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80");
        Vehicle v3 = createVehicle("FL-103", "1FTYR1Y84MKA44901", "Ford", "Transit-250 High Roof", 2021, "Delivery Van", "Gasoline", driver3, 54200, 50000, 10000, 60000, VehicleStatus.ACTIVE, LocalDate.now().minusMonths(20), "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80");
        Vehicle v4 = createVehicle("FL-104", "4UZAC2FC9LC781204", "Isuzu", "NPR-HD Box Truck", 2020, "Box Truck", "Diesel", null, 68900, 60000, 10000, 70000, VehicleStatus.IN_SHOP, LocalDate.now().minusMonths(24), "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80");
        Vehicle v5 = createVehicle("FL-105", "3C6UR5DL7NE149203", "Ram", "ProMaster 3500", 2022, "Cargo Van", "Gasoline", null, 41500, 30000, 10000, 40000, VehicleStatus.MAINTENANCE_DUE, LocalDate.now().minusMonths(12), "https://images.unsplash.com/photo-1586191582056-a19f67a288c1?auto=format&fit=crop&w=600&q=80");
        Vehicle v6 = createVehicle("FL-106", "4V4NC9EH5PN892011", "Volvo", "VNL 860 Sleeper", 2023, "Heavy Duty Semi", "Diesel", driver1, 115000, 105000, 20000, 125000, VehicleStatus.ACTIVE, LocalDate.now().minusMonths(8), "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80");
        Vehicle v7 = createVehicle("FL-107", "1GC1GUEG5K1189203", "Chevrolet", "Express 3500", 2019, "Passenger Van", "Gasoline", driver2, 92100, 85000, 10000, 95000, VehicleStatus.UNSAFE, LocalDate.now().minusMonths(30), "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80");
        Vehicle v8 = createVehicle("FL-108", "1NKDX4EX8PJ902188", "Kenworth", "T680 Next Gen", 2024, "Long Haul Tractor", "Diesel", driver3, 12000, 0, 15000, 15000, VehicleStatus.ACTIVE, LocalDate.now().minusMonths(2), "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80");

        List<Vehicle> vehicles = List.of(v1, v2, v3, v4, v5, v6, v7, v8);

        // 4. Generate QR Codes & Historical Odometer Readings
        for (Vehicle v : vehicles) {
            qrCodeService.generateOrGetQrToken(v);

            // Historical odometer entries
            int odo = v.getCurrentOdometer();
            odometerRepository.save(new OdometerReading(v, odo - 4500, LocalDateTime.now().minusDays(45), driver1, "Routine trip check"));
            odometerRepository.save(new OdometerReading(v, odo - 2200, LocalDateTime.now().minusDays(22), driver1, "Mid-month route log"));
            odometerRepository.save(new OdometerReading(v, odo, LocalDateTime.now().minusDays(2), driver1, "Latest dispatch reading"));
        }

        // 5. Maintenance Records
        createMaintenance(v1, LocalDate.now().minusMonths(2), 75000, "Major 75K Service", "Engine oil change, synthetic blend filters, DEF system check, differential fluid flush", "Oil filter, air filter, fuel water separator", "Penske Fleet Care", new BigDecimal("780.00"), 90000);
        createMaintenance(v2, LocalDate.now().minusMonths(4), 30000, "B Service Inspection", "Full synthetic oil change, brake pad inspection, tire rotation and balance", "Synthetic oil, cabin air filter", "EuroStar Commercial", new BigDecimal("450.00"), 40000);
        createMaintenance(v3, LocalDate.now().minusMonths(3), 50000, "Scheduled Tune-Up", "Spark plugs replacement, transmission flush, throttle body cleaning", "Motorcraft spark plugs, transmission fluid", "Ford Fleet Services", new BigDecimal("520.00"), 60000);
        createMaintenance(v4, LocalDate.now().minusMonths(5), 60000, "DOT Annual Inspection", "Multi-point safety inspection, brake line inspection, coolant flush", "Heavy duty coolant, wiper blades", "Metro Truck Repair", new BigDecimal("640.00"), 70000);
        createMaintenance(v6, LocalDate.now().minusMonths(1), 105000, "Comprehensive 100K Overhaul", "Full DPF cleaning, transmission fluid exchange, steer axle alignment", "DPF filter gasket, synthetic gear lube", "Volvo Truck Center", new BigDecimal("1250.00"), 125000);

        // 6. Repair Records
        createRepair(v4, LocalDate.now().minusDays(3), "Worn front brake rotors causing steering vibration during deceleration", "Brakes", "Heavy duty ceramic brake pads, vented front rotors", new BigDecimal("820.00"), "Metro Truck Repair", RepairStatus.IN_PROGRESS, null);
        createRepair(v1, LocalDate.now().minusMonths(3), "Alternator output drop and weak charging circuit", "Electrical", "Delco Remy 160A Alternator, serpentine belt", new BigDecimal("650.00"), "Penske Fleet Care", RepairStatus.COMPLETED, LocalDate.now().minusMonths(3).plusDays(1));
        createRepair(v3, LocalDate.now().minusMonths(6), "Pinhole leak in upper radiator coolant hose", "Cooling", "Molded radiator hose, hose clamps, 50/50 coolant", new BigDecimal("240.00"), "QuickFix Commercial", RepairStatus.COMPLETED, LocalDate.now().minusMonths(6).plusDays(1));
        createRepair(v7, LocalDate.now().minusDays(1), "High pressure power steering hose ruptured causing loss of steering assist", "Steering", "Power steering pressure line hose assembly", new BigDecimal("490.00"), "Metro Truck Repair", RepairStatus.PENDING, null);

        // 7. Fuel Records
        createFuel(v1, LocalDate.now().minusDays(14), 81200, new BigDecimal("180.00"), new BigDecimal("1.25"), "Shell Commercial Truck Stop", "Diesel", true, 600, new BigDecimal("3.33"));
        createFuel(v1, LocalDate.now().minusDays(2), 82400, new BigDecimal("360.00"), new BigDecimal("1.28"), "Love's Travel Stop #441", "Diesel", true, 1200, new BigDecimal("3.33"));

        createFuel(v2, LocalDate.now().minusDays(10), 38900, new BigDecimal("65.00"), new BigDecimal("1.30"), "BP Express", "Diesel", true, 585, new BigDecimal("9.00"));
        createFuel(v2, LocalDate.now().minusDays(2), 39580, new BigDecimal("75.00"), new BigDecimal("1.32"), "Pilot Flying J", "Diesel", true, 680, new BigDecimal("9.07"));

        createFuel(v3, LocalDate.now().minusDays(8), 53600, new BigDecimal("70.00"), new BigDecimal("1.18"), "Chevron Fleet", "Gasoline", true, 525, new BigDecimal("7.50"));
        createFuel(v3, LocalDate.now().minusDays(1), 54200, new BigDecimal("78.00"), new BigDecimal("1.19"), "Mobil Mart", "Gasoline", true, 600, new BigDecimal("7.69"));

        createFuel(v6, LocalDate.now().minusDays(5), 115000, new BigDecimal("450.00"), new BigDecimal("1.27"), "TA Travel Center", "Diesel", true, 1600, new BigDecimal("3.56"));

        // 8. Daily Inspections
        createInspection(v1, driver1, InspectionStatus.PASSED, false, "All mechanical systems operational. Pre-trip passed.");
        createInspection(v2, driver2, InspectionStatus.NEEDS_ATTENTION, false, "Tire tread near 4/32 threshold on rear duals; scheduled for replacement.");
        createInspection(v7, driver2, InspectionStatus.FAILED_UNSAFE, true, "CRITICAL: Power steering fluid reservoir empty and brake warning light active. Vehicle unsafe for highway operations.");

        // 9. Calculate initial health scores for all vehicles
        for (Vehicle v : vehicles) {
            healthScoreService.calculateAndSaveHealthScore(v);
        }

        // 10. Seed Notifications
        notificationService.createNotification(
                v2,
                NotificationType.UPCOMING_MAINTENANCE,
                NotificationPriority.MEDIUM,
                "Upcoming Service: FL-102",
                "Mercedes Sprinter 3500 is within 420 KM of next scheduled B-service."
        );

        notificationService.createNotification(
                v5,
                NotificationType.OVERDUE_MAINTENANCE,
                NotificationPriority.HIGH,
                "Maintenance Overdue: FL-105",
                "Ram ProMaster 3500 has exceeded scheduled maintenance threshold by 1,500 KM."
        );

        notificationService.createNotification(
                v7,
                NotificationType.CRITICAL_INSPECTION,
                NotificationPriority.CRITICAL,
                "CRITICAL DEFECT DETECTED: FL-107",
                "Inspection failed with critical steering and brake defects! Vehicle locked as UNSAFE."
        );

        logger.info("FleetIQ enterprise dataset successfully initialized with 8 vehicles, full service records, and live AI integration.");
    }

    private Vehicle createVehicle(String reg, String vin, String make, String model, int year,
                                  String type, String fuel, User driver, int curOdo, int lastKm,
                                  int interval, int nextKm, VehicleStatus status, LocalDate regDate, String image) {
        Vehicle v = new Vehicle();
        v.setRegistrationNumber(reg);
        v.setVin(vin);
        v.setMake(make);
        v.setModel(model);
        v.setManufactureYear(year);
        v.setVehicleType(type);
        v.setFuelType(fuel);
        v.setAssignedDriver(driver);
        v.setCurrentOdometer(curOdo);
        v.setLastServiceKm(lastKm);
        v.setServiceIntervalKm(interval);
        v.setNextServiceKm(nextKm);
        v.setStatus(status);
        v.setRegistrationDate(regDate);
        v.setImageUrl(image);
        return vehicleRepository.save(v);
    }

    private void createMaintenance(Vehicle v, LocalDate date, int odo, String type, String work, String parts, String mechanic, BigDecimal cost, int nextKm) {
        MaintenanceRecord m = new MaintenanceRecord();
        m.setVehicle(v);
        m.setServiceDate(date);
        m.setOdometerKm(odo);
        m.setMaintenanceType(type);
        m.setWorkPerformed(work);
        m.setPartsReplaced(parts);
        m.setMechanicName(mechanic);
        m.setCost(cost);
        m.setNextServiceKm(nextKm);
        maintenanceRepository.save(m);
    }

    private void createRepair(Vehicle v, LocalDate date, String desc, String cat, String parts, BigDecimal cost, String mechanic, RepairStatus status, LocalDate compDate) {
        RepairRecord r = new RepairRecord();
        r.setVehicle(v);
        r.setRepairDate(date);
        r.setProblemDescription(desc);
        r.setRepairCategory(cat);
        r.setPartsReplaced(parts);
        r.setCost(cost);
        r.setMechanicName(mechanic);
        r.setRepairStatus(status);
        r.setCompletedDate(compDate);
        repairRepository.save(r);
    }

    private void createFuel(Vehicle v, LocalDate date, int odo, BigDecimal qty, BigDecimal price, String station, String fuelType, boolean full, int dist, BigDecimal kml) {
        FuelRecord f = new FuelRecord();
        f.setVehicle(v);
        f.setFuelDate(date);
        f.setOdometerKm(odo);
        f.setFuelQuantity(qty);
        f.setPricePerLitre(price);
        f.setTotalCost(qty.multiply(price));
        f.setFuelStation(station);
        f.setFuelType(fuelType);
        f.setFullTank(full);
        f.setDistanceTravelled(dist);
        f.setMileageKml(kml);
        fuelRepository.save(f);
    }

    private void createInspection(Vehicle v, User inspector, InspectionStatus status, boolean critical, String notes) {
        InspectionRecord i = new InspectionRecord();
        i.setVehicle(v);
        i.setInspectionDate(LocalDateTime.now().minusHours(4));
        i.setInspector(inspector);
        i.setOverallStatus(status);
        i.setHasCriticalIssue(critical);
        i.setGeneralNotes(notes);

        i.addItem(new InspectionItem("Brake Condition", critical ? ItemCondition.CRITICAL : ItemCondition.GOOD, critical ? "Brake warning light illuminated" : "Nominal"));
        i.addItem(new InspectionItem("Tyre Condition", status == InspectionStatus.NEEDS_ATTENTION ? ItemCondition.NEEDS_ATTENTION : ItemCondition.GOOD, status == InspectionStatus.NEEDS_ATTENTION ? "Tread 4/32" : "Good tread"));
        i.addItem(new InspectionItem("Engine Oil", ItemCondition.GOOD, "Optimal level"));
        i.addItem(new InspectionItem("Battery Condition", ItemCondition.GOOD, "12.6V healthy"));
        i.addItem(new InspectionItem("Headlights", ItemCondition.GOOD, "Functional"));
        i.addItem(new InspectionItem("Indicators", ItemCondition.GOOD, "Functional"));
        i.addItem(new InspectionItem("Coolant Level", ItemCondition.GOOD, "Full"));
        i.addItem(new InspectionItem("Steering Condition", critical ? ItemCondition.CRITICAL : ItemCondition.GOOD, critical ? "Heavy resistance & fluid leak" : "Smooth response"));

        inspectionRepository.save(i);
    }
}
