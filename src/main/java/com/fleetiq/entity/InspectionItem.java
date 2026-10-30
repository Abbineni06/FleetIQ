package com.fleetiq.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "inspection_items")
public class InspectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    @JsonBackReference
    private InspectionRecord inspection;

    @Column(name = "item_name", nullable = false, length = 50)
    private String itemName; // e.g., "Brake Condition", "Tyre Condition", "Engine Oil", etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ItemCondition status = ItemCondition.GOOD;

    @Column(length = 255)
    private String notes;

    public InspectionItem() {}

    public InspectionItem(String itemName, ItemCondition status, String notes) {
        this.itemName = itemName;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public InspectionRecord getInspection() { return inspection; }
    public void setInspection(InspectionRecord inspection) { this.inspection = inspection; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public ItemCondition getStatus() { return status; }
    public void setStatus(ItemCondition status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
