package com.fleetiq.scheduler;

import com.fleetiq.entity.NotificationPriority;
import com.fleetiq.entity.NotificationType;
import com.fleetiq.entity.Vehicle;
import com.fleetiq.entity.VehicleStatus;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.service.HealthScoreService;
import com.fleetiq.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MaintenanceScheduler {

    private static final Logger logger = LoggerFactory.getLogger(MaintenanceScheduler.class);

    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;
    private final HealthScoreService healthScoreService;

    public MaintenanceScheduler(VehicleRepository vehicleRepository,
                                NotificationService notificationService,
                                HealthScoreService healthScoreService) {
        this.vehicleRepository = vehicleRepository;
        this.notificationService = notificationService;
        this.healthScoreService = healthScoreService;
    }

    // Run every 60 minutes
    @Scheduled(fixedRate = 3600000, initialDelay = 10000)
    public void performScheduledFleetAudit() {
        logger.info("Executing periodic FleetIQ maintenance and health audit...");
        List<Vehicle> vehicles = vehicleRepository.findAll();

        for (Vehicle v : vehicles) {
            int currentKm = v.getCurrentOdometer() != null ? v.getCurrentOdometer() : 0;
            int nextKm = v.getNextServiceKm() != null ? v.getNextServiceKm() : 10000;
            int remaining = nextKm - currentKm;

            if (remaining <= 0) {
                if (v.getStatus() == VehicleStatus.ACTIVE) {
                    v.setStatus(VehicleStatus.MAINTENANCE_DUE);
                    vehicleRepository.save(v);
                }
                notificationService.createNotification(
                        v,
                        NotificationType.OVERDUE_MAINTENANCE,
                        NotificationPriority.HIGH,
                        "Service Overdue: " + v.getRegistrationNumber(),
                        "Vehicle has exceeded scheduled maintenance threshold by " + Math.abs(remaining) + " KM."
                );
            } else if (remaining <= 1000) {
                notificationService.createNotification(
                        v,
                        NotificationType.UPCOMING_MAINTENANCE,
                        NotificationPriority.MEDIUM,
                        "Upcoming Service: " + v.getRegistrationNumber(),
                        "Vehicle is within " + remaining + " KM of required service interval."
                );
            }

            // Sync health score
            healthScoreService.calculateAndSaveHealthScore(v);
        }
        logger.info("Periodic FleetIQ maintenance audit completed successfully.");
    }
}
