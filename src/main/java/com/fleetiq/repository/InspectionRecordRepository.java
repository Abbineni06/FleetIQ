package com.fleetiq.repository;

import com.fleetiq.entity.InspectionRecord;
import com.fleetiq.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRecordRepository extends JpaRepository<InspectionRecord, Long> {
    List<InspectionRecord> findByVehicleOrderByInspectionDateDesc(Vehicle vehicle);
    List<InspectionRecord> findTop10ByOrderByInspectionDateDesc();
    Optional<InspectionRecord> findTopByVehicleOrderByInspectionDateDesc(Vehicle vehicle);

    @Query("SELECT COUNT(i) FROM InspectionRecord i WHERE i.vehicle.id = :vehicleId AND i.hasCriticalIssue = true")
    long countCriticalIssuesByVehicleId(Long vehicleId);

    @Query("SELECT COUNT(i) FROM InspectionRecord i WHERE i.vehicle.id = :vehicleId AND i.overallStatus = 'PASSED'")
    long countPassedInspectionsByVehicleId(Long vehicleId);

    @Query("SELECT COUNT(i) FROM InspectionRecord i WHERE i.vehicle.id = :vehicleId")
    long countTotalInspectionsByVehicleId(Long vehicleId);
}
