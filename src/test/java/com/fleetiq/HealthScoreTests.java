package com.fleetiq;

import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import com.fleetiq.service.HealthScoreService;
import com.fleetiq.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HealthScoreTests {

    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private VehicleHealthScoreRepository healthScoreRepository;
    @Mock
    private InspectionRecordRepository inspectionRepository;
    @Mock
    private RepairRecordRepository repairRepository;
    @Mock
    private MaintenanceRecordRepository maintenanceRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private HealthScoreService healthScoreService;

    @Test
    @DisplayName("Verify that critical safety inspection failure forces vehicle to UNSAFE status")
    void testCriticalSafetyOverride() {
        Vehicle v = new Vehicle();
        v.setId(7L);
        v.setRegistrationNumber("UNSAFE-01");
        v.setCurrentOdometer(50000);
        v.setNextServiceKm(60000);
        v.setLastServiceKm(45000);
        v.setStatus(VehicleStatus.ACTIVE);

        InspectionRecord criticalInspection = new InspectionRecord();
        criticalInspection.setHasCriticalIssue(true);
        criticalInspection.setOverallStatus(InspectionStatus.FAILED_UNSAFE);

        when(inspectionRepository.findTopByVehicleOrderByInspectionDateDesc(v)).thenReturn(Optional.of(criticalInspection));
        when(repairRepository.countRepairsSince(eq(7L), any())).thenReturn(0L);
        when(healthScoreRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        VehicleHealthScore result = healthScoreService.calculateAndSaveHealthScore(v);

        assertNotNull(result);
        assertEquals(VehicleStatus.UNSAFE, v.getStatus(), "Vehicle status must be set to UNSAFE");
        assertTrue(result.getOverallScore() <= 45, "Numerical score must reflect safety grounding penalty");
        assertEquals("Poor", result.getCategory());
        verify(vehicleRepository, atLeastOnce()).save(v);
    }
}
