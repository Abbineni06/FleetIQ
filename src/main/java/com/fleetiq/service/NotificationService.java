package com.fleetiq.service;

import com.fleetiq.dto.NotificationDTOs.NotificationDTO;
import com.fleetiq.entity.Notification;
import com.fleetiq.entity.NotificationPriority;
import com.fleetiq.entity.NotificationType;
import com.fleetiq.entity.Vehicle;
import com.fleetiq.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailNotificationService emailNotificationService;

    public NotificationService(NotificationRepository notificationRepository, EmailNotificationService emailNotificationService) {
        this.notificationRepository = notificationRepository;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional
    public Notification createNotification(Vehicle vehicle, NotificationType type, NotificationPriority priority,
                                           String title, String message) {
        // Prevent spamming duplicate unread notifications for the same vehicle and type
        if (vehicle != null && notificationRepository.existsUnreadForVehicleAndType(vehicle.getId(), type)) {
            return null;
        }

        Notification notification = new Notification(vehicle, type, priority, title, message);
        Notification saved = notificationRepository.save(notification);

        // If CRITICAL or OVERDUE, dispatch email alert
        if (priority == NotificationPriority.CRITICAL || type == NotificationType.OVERDUE_MAINTENANCE) {
            String subject = "[FleetIQ Alert] " + title;
            emailNotificationService.sendEmail("fleetmanager@fleetiq.io", subject, message);
        }

        return saved;
    }

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getRecentNotifications() {
        return notificationRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount() {
        return notificationRepository.countByReadFalse();
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(n -> !n.isRead())
                .peek(n -> n.setRead(true))
                .collect(Collectors.toList());
        notificationRepository.saveAll(unread);
    }

    public NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        if (n.getVehicle() != null) {
            dto.setVehicleId(n.getVehicle().getId());
            dto.setVehicleRegistration(n.getVehicle().getRegistrationNumber());
        }
        dto.setType(n.getType());
        dto.setPriority(n.getPriority());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
