package com.fleetiq.repository;

import com.fleetiq.entity.Vehicle;
import com.fleetiq.entity.VehicleQrToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleQrTokenRepository extends JpaRepository<VehicleQrToken, Long> {
    Optional<VehicleQrToken> findByToken(String token);
    Optional<VehicleQrToken> findTopByVehicleAndRevokedFalseOrderByCreatedAtDesc(Vehicle vehicle);
}
