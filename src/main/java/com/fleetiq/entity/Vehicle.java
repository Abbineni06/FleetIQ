package com.fleetiq.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 30)
    private String registrationNumber;

    @Column(unique = true, length = 50)
    private String vin;

    @Column(nullable = false, length = 50)
    private String make;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(name = "manufacture_year", nullable = false)
    private Integer manufactureYear;

    @Column(name = "vehicle_type", nullable = false, length = 40)
    private String vehicleType; // e.g. "Cargo Van", "Box Truck", "Semi-Trailer", "Pickup"

    @Column(name = "fuel_type", nullable = false, length = 30)
    private String fuelType; // "Diesel", "Gasoline", "Electric", "Hybrid"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_driver_id")
    private User assignedDriver;

    @Column(name = "current_odometer", nullable = false)
    private Integer currentOdometer = 0;

    @Column(name = "last_service_km", nullable = false)
    private Integer lastServiceKm = 0;

    @Column(name = "service_interval_km", nullable = false)
    private Integer serviceIntervalKm = 10000;

    @Column(name = "next_service_km", nullable = false)
    private Integer nextServiceKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VehicleStatus status = VehicleStatus.ACTIVE;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (nextServiceKm == null) {
            nextServiceKm = (lastServiceKm != null ? lastServiceKm : 0) + (serviceIntervalKm != null ? serviceIntervalKm : 10000);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Vehicle() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getManufactureYear() { return manufactureYear; }
    public void setManufactureYear(Integer manufactureYear) { this.manufactureYear = manufactureYear; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public User getAssignedDriver() { return assignedDriver; }
    public void setAssignedDriver(User assignedDriver) { this.assignedDriver = assignedDriver; }

    public Integer getCurrentOdometer() { return currentOdometer; }
    public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }

    public Integer getLastServiceKm() { return lastServiceKm; }
    public void setLastServiceKm(Integer lastServiceKm) { this.lastServiceKm = lastServiceKm; }

    public Integer getServiceIntervalKm() { return serviceIntervalKm; }
    public void setServiceIntervalKm(Integer serviceIntervalKm) { this.serviceIntervalKm = serviceIntervalKm; }

    public Integer getNextServiceKm() { return nextServiceKm; }
    public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }

    public VehicleStatus getStatus() { return status; }
    public void setStatus(VehicleStatus status) { this.status = status; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
