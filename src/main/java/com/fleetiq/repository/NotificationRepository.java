package com.fleetiq.repository;

import com.fleetiq.entity.Notification;
import com.fleetiq.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findTop20ByOrderByCreatedAtDesc();
    long countByReadFalse();
    List<Notification> findByVehicleOrderByCreatedAtDesc(Vehicle vehicle);

    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.vehicle.id = :vehicleId AND n.type = :type AND n.read = false")
    boolean existsUnreadForVehicleAndType(Long vehicleId, com.fleetiq.entity.NotificationType type);
}
