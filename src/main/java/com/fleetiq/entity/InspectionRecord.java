package com.fleetiq.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inspection_records")
public class InspectionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "inspection_date", nullable = false)
    private LocalDateTime inspectionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id")
    private User inspector;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false, length = 30)
    private InspectionStatus overallStatus = InspectionStatus.PASSED;

    @Column(name = "has_critical_issue", nullable = false)
    private boolean hasCriticalIssue = false;

    @Column(name = "general_notes", columnDefinition = "TEXT")
    private String generalNotes;

    @OneToMany(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<InspectionItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (inspectionDate == null) {
            inspectionDate = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
    }

    public InspectionRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public LocalDateTime getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDateTime inspectionDate) { this.inspectionDate = inspectionDate; }

    public User getInspector() { return inspector; }
    public void setInspector(User inspector) { this.inspector = inspector; }

    public InspectionStatus getOverallStatus() { return overallStatus; }
    public void setOverallStatus(InspectionStatus overallStatus) { this.overallStatus = overallStatus; }

    public boolean isHasCriticalIssue() { return hasCriticalIssue; }
    public void setHasCriticalIssue(boolean hasCriticalIssue) { this.hasCriticalIssue = hasCriticalIssue; }

    public String getGeneralNotes() { return generalNotes; }
    public void setGeneralNotes(String generalNotes) { this.generalNotes = generalNotes; }

    public List<InspectionItem> getItems() { return items; }
    public void setItems(List<InspectionItem> items) { this.items = items; }

    public void addItem(InspectionItem item) {
        items.add(item);
        item.setInspection(this);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
