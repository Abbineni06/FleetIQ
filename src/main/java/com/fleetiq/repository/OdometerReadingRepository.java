package com.fleetiq.repository;

import com.fleetiq.entity.OdometerReading;
import com.fleetiq.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OdometerReadingRepository extends JpaRepository<OdometerReading, Long> {
    List<OdometerReading> findByVehicleOrderByRecordedAtDesc(Vehicle vehicle);
    List<OdometerReading> findByVehicleOrderByRecordedAtAsc(Vehicle vehicle);
}
