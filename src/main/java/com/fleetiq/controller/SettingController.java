package com.fleetiq.controller;

import com.fleetiq.entity.SystemSetting;
import com.fleetiq.repository.SystemSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class SettingController {

    private final SystemSettingRepository settingRepository;

    public SettingController(SystemSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        Map<String, String> map = new HashMap<>();
        List<SystemSetting> list = settingRepository.findAll();
        for (SystemSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return ResponseEntity.ok(map);
    }

    @PostMapping
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            SystemSetting s = settingRepository.findBySettingKey(entry.getKey())
                    .orElse(new SystemSetting(entry.getKey(), entry.getValue(), "Fleet threshold setting"));
            s.setSettingValue(entry.getValue());
            settingRepository.save(s);
        }
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }
}
