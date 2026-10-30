package com.fleetiq.repository;

import com.fleetiq.entity.MaintenanceRecord;
import com.fleetiq.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByVehicleOrderByServiceDateDesc(Vehicle vehicle);
    List<MaintenanceRecord> findTop10ByOrderByServiceDateDesc();

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceRecord m")
    BigDecimal sumTotalCost();

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceRecord m WHERE m.serviceDate >= :startDate")
    BigDecimal sumTotalCostSince(LocalDate startDate);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceRecord m WHERE m.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(Long vehicleId);

    @Query("SELECT COUNT(m) FROM MaintenanceRecord m WHERE m.vehicle.id = :vehicleId AND m.serviceDate >= :startDate")
    long countMaintenanceSince(Long vehicleId, LocalDate startDate);
}
