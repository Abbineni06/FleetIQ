package com.fleetiq.controller;

import com.fleetiq.dto.ReportDTOs.FleetReportDTO;
import com.fleetiq.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<FleetReportDTO> getReport(@RequestParam(required = false) String type,
                                                    @RequestParam(required = false) String dateRange,
                                                    @RequestParam(required = false) Long vehicleId) {
        return ResponseEntity.ok(reportService.generateReport(type, dateRange, vehicleId));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(@RequestParam(required = false) String type,
                                            @RequestParam(required = false) String dateRange,
                                            @RequestParam(required = false) Long vehicleId) {
        FleetReportDTO report = reportService.generateReport(type, dateRange, vehicleId);
        String csv = reportService.exportToCsv(report);

        byte[] output = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fleetiq_report_" + System.currentTimeMillis() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(output);
    }
}
