package com.fleetiq.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_records")
public class FuelRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "fuel_date", nullable = false)
    private LocalDate fuelDate;

    @Column(name = "odometer_km", nullable = false)
    private Integer odometerKm;

    @Column(name = "fuel_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal fuelQuantity;

    @Column(name = "price_per_litre", nullable = false, precision = 6, scale = 2)
    private BigDecimal pricePerLitre;

    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "fuel_station", length = 100)
    private String fuelStation;

    @Column(name = "fuel_type", nullable = false, length = 30)
    private String fuelType;

    @Column(name = "is_full_tank", nullable = false)
    private boolean fullTank = true;

    @Column(name = "distance_travelled")
    private Integer distanceTravelled;

    @Column(name = "mileage_kml", precision = 6, scale = 2)
    private BigDecimal mileageKml;

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (totalCost == null && fuelQuantity != null && pricePerLitre != null) {
            totalCost = fuelQuantity.multiply(pricePerLitre);
        }
    }

    public FuelRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public LocalDate getFuelDate() { return fuelDate; }
    public void setFuelDate(LocalDate fuelDate) { this.fuelDate = fuelDate; }

    public Integer getOdometerKm() { return odometerKm; }
    public void setOdometerKm(Integer odometerKm) { this.odometerKm = odometerKm; }

    public BigDecimal getFuelQuantity() { return fuelQuantity; }
    public void setFuelQuantity(BigDecimal fuelQuantity) { this.fuelQuantity = fuelQuantity; }

    public BigDecimal getPricePerLitre() { return pricePerLitre; }
    public void setPricePerLitre(BigDecimal pricePerLitre) { this.pricePerLitre = pricePerLitre; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public String getFuelStation() { return fuelStation; }
    public void setFuelStation(String fuelStation) { this.fuelStation = fuelStation; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public boolean isFullTank() { return fullTank; }
    public void setFullTank(boolean fullTank) { this.fullTank = fullTank; }

    public Integer getDistanceTravelled() { return distanceTravelled; }
    public void setDistanceTravelled(Integer distanceTravelled) { this.distanceTravelled = distanceTravelled; }

    public BigDecimal getMileageKml() { return mileageKml; }
    public void setMileageKml(BigDecimal mileageKml) { this.mileageKml = mileageKml; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
