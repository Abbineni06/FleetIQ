package com.fleetiq.repository;

import com.fleetiq.entity.FuelRecord;
import com.fleetiq.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FuelRecordRepository extends JpaRepository<FuelRecord, Long> {
    List<FuelRecord> findByVehicleOrderByFuelDateDesc(Vehicle vehicle);
    List<FuelRecord> findByVehicleOrderByOdometerKmAsc(Vehicle vehicle);
    List<FuelRecord> findTop2ByVehicleOrderByOdometerKmDesc(Vehicle vehicle);

    @Query("SELECT COALESCE(SUM(f.totalCost), 0) FROM FuelRecord f")
    BigDecimal sumTotalCost();

    @Query("SELECT COALESCE(SUM(f.totalCost), 0) FROM FuelRecord f WHERE f.fuelDate >= :startDate")
    BigDecimal sumTotalCostSince(LocalDate startDate);

    @Query("SELECT COALESCE(SUM(f.totalCost), 0) FROM FuelRecord f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(Long vehicleId);

    @Query("SELECT COALESCE(AVG(f.mileageKml), 0) FROM FuelRecord f WHERE f.mileageKml IS NOT NULL AND f.mileageKml > 0")
    Double averageFleetMileage();

    @Query("SELECT COALESCE(AVG(f.mileageKml), 0) FROM FuelRecord f WHERE f.vehicle.id = :vehicleId AND f.mileageKml IS NOT NULL AND f.mileageKml > 0")
    Double averageMileageByVehicleId(Long vehicleId);
}
