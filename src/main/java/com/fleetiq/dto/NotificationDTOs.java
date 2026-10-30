package com.fleetiq.dto;

import com.fleetiq.entity.NotificationPriority;
import com.fleetiq.entity.NotificationType;
import java.time.LocalDateTime;

public class NotificationDTOs {

    public static class NotificationDTO {
        private Long id;
        private Long vehicleId;
        private String vehicleRegistration;
        private NotificationType type;
        private NotificationPriority priority;
        private String title;
        private String message;
        private boolean read;
        private LocalDateTime createdAt;

        public NotificationDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public NotificationType getType() { return type; }
        public void setType(NotificationType type) { this.type = type; }
        public NotificationPriority getPriority() { return priority; }
        public void setPriority(NotificationPriority priority) { this.priority = priority; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
