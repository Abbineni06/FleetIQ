package com.fleetiq.repository;

import com.fleetiq.entity.Vehicle;
import com.fleetiq.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    List<Vehicle> findByStatus(VehicleStatus status);
    long countByStatus(VehicleStatus status);

    @Query("SELECT v FROM Vehicle v ORDER BY v.registrationNumber ASC")
    List<Vehicle> findAllOrdered();

    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.registrationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.make) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.model) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Vehicle> searchVehicles(String query);

    @Query("SELECT v FROM Vehicle v WHERE v.assignedDriver.id = :driverId")
    List<Vehicle> findByAssignedDriverId(Long driverId);
}
