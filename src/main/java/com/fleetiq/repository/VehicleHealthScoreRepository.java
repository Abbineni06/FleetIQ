package com.fleetiq.repository;

import com.fleetiq.entity.Vehicle;
import com.fleetiq.entity.VehicleHealthScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleHealthScoreRepository extends JpaRepository<VehicleHealthScore, Long> {
    Optional<VehicleHealthScore> findTopByVehicleOrderByCalculatedAtDesc(Vehicle vehicle);
    List<VehicleHealthScore> findByVehicleOrderByCalculatedAtDesc(Vehicle vehicle);

    @Query("SELECT AVG(h.overallScore) FROM VehicleHealthScore h WHERE h.id IN (SELECT MAX(h2.id) FROM VehicleHealthScore h2 GROUP BY h2.vehicle.id)")
    Double findAverageFleetHealthScore();

    @Query("SELECT h FROM VehicleHealthScore h WHERE h.id IN (SELECT MAX(h2.id) FROM VehicleHealthScore h2 GROUP BY h2.vehicle.id)")
    List<VehicleHealthScore> findLatestHealthScoresForAllVehicles();
}
