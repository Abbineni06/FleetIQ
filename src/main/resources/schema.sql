-- FleetIQ Database Schema
CREATE DATABASE IF NOT EXISTS fleetiq_db;
USE fleetiq_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    vin VARCHAR(50) UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    manufacture_year INT NOT NULL,
    vehicle_type VARCHAR(40) NOT NULL,
    fuel_type VARCHAR(30) NOT NULL,
    assigned_driver_id BIGINT,
    current_odometer INT NOT NULL DEFAULT 0,
    last_service_km INT NOT NULL DEFAULT 0,
    service_interval_km INT NOT NULL DEFAULT 10000,
    next_service_km INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    registration_date DATE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_driver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Odometer Readings
CREATE TABLE IF NOT EXISTS odometer_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    reading_km INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by_id BIGINT,
    notes VARCHAR(255),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    service_date DATE NOT NULL,
    odometer_km INT NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    work_performed TEXT NOT NULL,
    parts_replaced TEXT,
    mechanic_name VARCHAR(100),
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    next_service_km INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 5. Repair Records
CREATE TABLE IF NOT EXISTS repair_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    repair_date DATE NOT NULL,
    problem_description TEXT NOT NULL,
    repair_category VARCHAR(50) NOT NULL,
    parts_replaced TEXT,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    mechanic_name VARCHAR(100),
    repair_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 6. Fuel Records
CREATE TABLE IF NOT EXISTS fuel_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    fuel_date DATE NOT NULL,
    odometer_km INT NOT NULL,
    fuel_quantity DECIMAL(8, 2) NOT NULL,
    price_per_litre DECIMAL(6, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    fuel_station VARCHAR(100),
    fuel_type VARCHAR(30) NOT NULL,
    is_full_tank BOOLEAN NOT NULL DEFAULT TRUE,
    distance_travelled INT,
    mileage_kml DECIMAL(6, 2),
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 7. Inspection Records
CREATE TABLE IF NOT EXISTS inspection_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inspector_id BIGINT,
    overall_status VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    has_critical_issue BOOLEAN NOT NULL DEFAULT FALSE,
    general_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Inspection Items
CREATE TABLE IF NOT EXISTS inspection_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inspection_id BIGINT NOT NULL,
    item_name VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    notes VARCHAR(255),
    FOREIGN KEY (inspection_id) REFERENCES inspection_records(id) ON DELETE CASCADE
);

-- 9. Vehicle Health Scores
CREATE TABLE IF NOT EXISTS vehicle_health_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    overall_score INT NOT NULL,
    category VARCHAR(30) NOT NULL,
    maintenance_compliance_score INT NOT NULL,
    inspection_score INT NOT NULL,
    repair_frequency_score INT NOT NULL,
    overdue_penalty INT NOT NULL DEFAULT 0,
    reasons TEXT,
    recommended_actions TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 10. QR Tokens
CREATE TABLE IF NOT EXISTS vehicle_qr_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    qr_code_base64 LONGTEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- 12. AI Chat History
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);
