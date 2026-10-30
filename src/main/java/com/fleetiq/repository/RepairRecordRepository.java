package com.fleetiq.repository;

import com.fleetiq.entity.RepairRecord;
import com.fleetiq.entity.RepairStatus;
import com.fleetiq.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RepairRecordRepository extends JpaRepository<RepairRecord, Long> {
    List<RepairRecord> findByVehicleOrderByRepairDateDesc(Vehicle vehicle);
    List<RepairRecord> findByRepairStatus(RepairStatus status);
    long countByRepairStatus(RepairStatus status);

    @Query("SELECT COALESCE(SUM(r.cost), 0) FROM RepairRecord r")
    BigDecimal sumTotalCost();

    @Query("SELECT COALESCE(SUM(r.cost), 0) FROM RepairRecord r WHERE r.repairDate >= :startDate")
    BigDecimal sumTotalCostSince(LocalDate startDate);

    @Query("SELECT COALESCE(SUM(r.cost), 0) FROM RepairRecord r WHERE r.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(Long vehicleId);

    @Query("SELECT COUNT(r) FROM RepairRecord r WHERE r.vehicle.id = :vehicleId AND r.repairDate >= :startDate")
    long countRepairsSince(Long vehicleId, LocalDate startDate);
}
