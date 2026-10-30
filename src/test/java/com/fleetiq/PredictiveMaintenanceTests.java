package com.fleetiq;

import com.fleetiq.dto.MaintenanceDTOs.PredictiveMaintenanceDTO;
import com.fleetiq.entity.Vehicle;
import com.fleetiq.entity.VehicleStatus;
import com.fleetiq.service.MaintenanceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PredictiveMaintenanceTests {

    @Mock
    private com.fleetiq.repository.MaintenanceRecordRepository maintenanceRepository;
    @Mock
    private com.fleetiq.repository.VehicleRepository vehicleRepository;
    @Mock
    private com.fleetiq.repository.OdometerReadingRepository odometerRepository;
    @Mock
    private com.fleetiq.service.NotificationService notificationService;
    @Mock
    private com.fleetiq.service.HealthScoreService healthScoreService;

    @InjectMocks
    private MaintenanceService maintenanceService;

    @Test
    @DisplayName("Verify Next Service KM calculation and Remaining KM")
    void testNextServiceKmCalculation() {
        Vehicle v = new Vehicle();
        v.setId(1L);
        v.setRegistrationNumber("TEST-01");
        v.setMake("Freightliner");
        v.setModel("Cascadia");
        v.setLastServiceKm(10000);
        v.setServiceIntervalKm(5000);
        v.setNextServiceKm(15000);
        v.setCurrentOdometer(13500);
        v.setRegistrationDate(LocalDate.now().minusDays(135));

        when(odometerRepository.findByVehicleOrderByRecordedAtAsc(any())).thenReturn(Collections.emptyList());

        PredictiveMaintenanceDTO dto = maintenanceService.calculatePrediction(v);

        assertNotNull(dto);
        assertEquals(1500, dto.getRemainingKm());
        assertEquals("NORMAL", dto.getUrgency());
        assertTrue(dto.isHasSufficientData());
        assertEquals(100.0, dto.getAvgDailyDistanceKm());
        assertEquals(15, dto.getEstimatedDaysRemaining());
        assertEquals(LocalDate.now().plusDays(15), dto.getPredictedServiceDate());
    }

    @Test
    @DisplayName("Verify Due Soon and Overdue alert logic")
    void testOverdueAlertLogic() {
        Vehicle v = new Vehicle();
        v.setId(2L);
        v.setRegistrationNumber("TEST-02");
        v.setMake("Ford");
        v.setModel("Transit");
        v.setLastServiceKm(20000);
        v.setServiceIntervalKm(10000);
        v.setNextServiceKm(30000);
        v.setCurrentOdometer(30500); // 500 KM overdue!
        v.setRegistrationDate(LocalDate.now().minusDays(300));

        when(odometerRepository.findByVehicleOrderByRecordedAtAsc(any())).thenReturn(Collections.emptyList());

        PredictiveMaintenanceDTO dto = maintenanceService.calculatePrediction(v);

        assertEquals(-500, dto.getRemainingKm());
        assertEquals("OVERDUE", dto.getUrgency());
    }
}
