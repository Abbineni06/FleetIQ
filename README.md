<p align="center">
  <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80" alt="FleetIQ Banner" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover;" />
</p>

# FleetIQ
### Intelligent Fleet. Smarter Maintenance.

[![Java 21](https://img.shields.io/badge/Java-21-orange?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4.1-FF6384?style=flat&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-F97316?style=flat&logo=github&logoColor=white)](https://Abbineni06.github.io/FleetIQ/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**FleetIQ** is a full-stack, enterprise-grade Fleet Vehicle Maintenance & Management SaaS web application built with **Java 21**, **Spring Boot 3.3.5**, **MySQL**, and modern **Vanilla JavaScript** (strictly no heavy JS frameworks). 

Inspired by the visual design direction of *"FleetPro by Saleh Ahmed on Dribbble"*, FleetIQ delivers an original, high-contrast **White and Orange (`#F97316`)** aesthetic featuring rule-based predictive maintenance, 8-point daily pre-trip driver inspections, automated health scoring (0–100), fuel efficiency analytics, ZXing-powered QR digital vehicle passports, and a Gemini-powered fleet AI maintenance assistant.

---

## 🌐 Live Interactive Demo

Experience the live interactive client deployment on GitHub Pages (runs in simulated demo mode with instant role-switching):

👉 **[Launch FleetIQ on GitHub Pages](https://Abbineni06.github.io/FleetIQ/)**

---

## 🔐 Demo Accounts & Role-Based Workspaces

FleetIQ implements strict Role-Based Access Control (RBAC). Three distinct workspaces are provided:

| Role | Username | Password | Full Name | Access Level & Workspace Features |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin` | `admin123` | Alex Morgan | **Total Access:** Executive dashboard, full vehicle CRUD, system configurations, weight tuning, and CSV ledger export. |
| **💼 Manager** | `manager` | `manager123` | Sarah Jenkins | **Operations Command:** Driver assignment, maintenance scheduling, workshop repair approvals, inspection audits. |
| **🚛 Driver** | `driver1` | `driver123` | David Miller | **Driver Dispatch Hub:** 8-point pre-trip checklists, refueling stop logs, odometer trip updates, QR vehicle pass. |

*(Quick-fill demo buttons are embedded directly on the login screen for 1-click evaluation).*

---

## 🚀 Key Modules & Innovation

### 1. Rule-Based Predictive Maintenance Engine
Computes real-time service countdowns and forecasts exact upcoming service dates based on historical daily mileage:

$$\text{Next Service KM} = \text{Last Service KM} + \text{Service Interval}$$
$$\text{Remaining KM} = \text{Next Service KM} - \text{Current KM}$$
$$\text{Average Daily Distance} = \frac{\text{Total Distance Travelled}}{\text{Number of Elapsed Days}}$$
$$\text{Estimated Days Until Service} = \frac{\text{Remaining KM}}{\text{Average Daily Distance}}$$
$$\text{Predicted Service Date} = \text{Current Date} + \text{Estimated Days}$$

- **Urgency Thresholds:**
  - `NORMAL`: $> 1,000\text{ KM}$ remaining.
  - `UPCOMING`: $500 - 1,000\text{ KM}$ remaining.
  - `DUE_SOON`: $< 500\text{ KM}$ remaining.
  - `OVERDUE`: Current KM $\ge$ Next Service KM (Status changes to `MAINTENANCE_DUE` with high-priority manager alerts).

---

### 2. Multi-Factor Vehicle Health Scoring (0 – 100)
Every fleet unit is audited continuously using a weighted four-factor scoring algorithm:

$$\text{Health Score} = 0.30(\text{Compliance}) + 0.30(\text{Inspection}) + 0.20(\text{Repair Stability}) + 0.20(\text{Overdue Penalty})$$

- **Score Tiers:** `85–100` (Excellent), `70–84` (Good), `50–69` (Needs Attention), `< 50` (Poor).
- **Immediate Grounding Override:** If a driver reports a **CRITICAL** defect (e.g., brake fluid leak, failed steering), the vehicle is immediately locked out with an `UNSAFE` status flag, halting dispatch.

---

### 3. Fuel Consumption & Mileage Analytics
- Computes fuel economy between refills:
  $$\text{Mileage (KM/L)} = \frac{\text{Distance Travelled Since Last Fill}}{\text{Liters Refueled}}$$
- Distinguishes full-tank from partial fills to prevent corrupted moving averages.
- Detects abnormal efficiency deviations ($> 30\%$) to identify fuel theft or engine sensor faults.

---

### 4. Commercial Transport Categories Supported
Supports all major vehicle transport types with tailored interval profiles:
- **Buses:** Transit / City Bus, Coach Bus (Intercity), School Bus, Minibus / Shuttle.
- **Trucks:** Heavy Duty Semi-Trailer, Box Truck, Pickup Truck, Flatbed Truck.
- **Cars & SUVs:** Sedan Car (Executive / Patrol), SUV / Crossover, Electric Vehicle (EV).
- **Vans:** Cargo Van, Passenger Van, Delivery Van.

---

### 5. ZXing QR Vehicle History Passports
- Generates encrypted QR tokens linked to each vehicle registration.
- Directs to `/qr-view.html?token=<uuid>`: a mobile-optimized public passport displaying health score, current odometer, last service date, and verified repair records for roadside inspectors and drivers.

---

### 6. AI Maintenance Assistant (Gemini / OpenRouter + Fleet Context)
- Ingests real-time MySQL database snapshots to answer diagnostic and operational questions.
- Built with an embedded deterministic fallback engine to ensure 100% uptime even during network or quota interruptions.

---

## 💻 Technology Stack

```
FleetIQ
 ├── Frontend (Client)
 │    ├── HTML5 & CSS3 (Custom Responsive Grid System)
 │    ├── Vanilla JavaScript (ES6+ Modules, Fetch API)
 │    ├── Chart.js 4.4.1 (Responsive Analytics Visualizations)
 │    └── Lucide Icons (SVG Iconography)
 │
 ├── Backend (REST APIs)
 │    ├── Java 21 LTS
 │    ├── Spring Boot 3.3.5
 │    ├── Spring Security 6 (JWT + BCrypt + RBAC)
 │    ├── Spring Data JPA & Hibernate
 │    ├── ZXing 3.5.3 (QR Code Generation Engine)
 │    └── Spring Boot Scheduled Tasks (@Scheduled Worker)
 │
 └── Database & Storage
      └── MySQL 8.x / 9.x (InnoDB, Foreign Key Constraints, Normalized Schema)
```

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- **Java 21 JDK**
- **Apache Maven 3.8+**
- **MySQL 8.0+** running on `localhost:3306`

### 1. Clone Repository
```bash
git clone https://github.com/Abbineni06/FleetIQ.git
cd FleetIQ
```

### 2. Configure MySQL Database
Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS fleetiq_db;
```
Configure database credentials in `src/main/resources/application.yml` or via environment variables:
```bash
export DB_USERNAME=root
export DB_PASSWORD=your_password
```

### 3. Run Application
```bash
mvn spring-boot:run
```
*(On initial launch, Hibernate generates all schema tables and `DataInitializer` seeds 9 vehicles, maintenance countdowns, fuel records, and demo user accounts).*

### 4. Access Application
Open **`http://localhost:8080`** in your browser.

---

## 📡 Key REST APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns JWT Bearer token |
| `/api/dashboard/summary` | `GET` | Authenticated | Live KPIs, 4 Chart.js datasets, maintenance countdowns |
| `/api/vehicles` | `GET`, `POST` | Manager/Admin | Lists and registers fleet vehicles |
| `/api/vehicles/{id}/odometer` | `POST` | Driver+ | Logs trip odometer reading & triggers threshold checks |
| `/api/maintenance/predictions` | `GET` | Authenticated | Predictive maintenance countdowns & urgency statuses |
| `/api/maintenance` | `POST` | Manager/Admin | Records completed service & resets countdown threshold |
| `/api/repairs` | `GET`, `POST` | Manager/Admin | Workshop breakdown and downtime logging |
| `/api/fuel` | `GET`, `POST` | Authenticated | Refueling logs and KM/L efficiency calculations |
| `/api/inspections` | `POST` | Driver+ | 8-point daily inspection submission (safety override) |
| `/api/qr/public/{token}` | `GET` | Public | Public read-only QR digital vehicle passport |
| `/api/reports/export` | `GET` | Manager/Admin | Authenticated CSV ledger export |
| `/api/ai/chat` | `POST` | Authenticated | Natural language fleet database assistant |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
