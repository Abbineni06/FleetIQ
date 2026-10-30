# FleetIQ
### Intelligent Fleet. Smarter Maintenance.

FleetIQ is an enterprise-grade commercial SaaS web application designed for transport organizations and fleet operators. It combines predictive maintenance forecasting, dynamic vehicle health scoring, fuel economy analytics, ZXing-powered QR vehicle service passports, driver safety inspections, and an AI-powered fleet maintenance assistant connected directly to live operational data.

---

## 🚀 Key Innovative Features

### 1. Rule-Based Predictive Maintenance System
- **Formula:**
  $$\text{Next Service KM} = \text{Last Service KM} + \text{Service Interval}$$
  $$\text{Remaining KM} = \text{Next Service KM} - \text{Current KM}$$
  $$\text{Average Daily Distance} = \frac{\text{Total Distance Travelled}}{\text{Number of Elapsed Days}}$$
  $$\text{Estimated Days Until Service} = \frac{\text{Remaining KM}}{\text{Average Daily Distance}}$$
  $$\text{Predicted Service Date} = \text{Current Date} + \text{Estimated Days}$$
- **Dynamic Urgency Alerts:**
  - `NORMAL`: More than 1,000 KM remaining
  - `UPCOMING`: 500 – 1,000 KM remaining
  - `DUE_SOON`: Less than 500 KM remaining
  - `OVERDUE`: Current KM $\ge$ Next Service KM (Triggers alert and status lock)
- Displays *"Insufficient data for prediction"* when vehicle history is inadequate.

### 2. Vehicle Health Scoring Engine (0 – 100)
- **Weighted Multi-Factor Formula:**
  - **Maintenance Compliance (30%):** Evaluates proximity to scheduled service intervals.
  - **Inspection Results (30%):** Aggregates daily pre-trip checklist safety scores.
  - **Repair Frequency (20%):** Evaluates recurring breakdown stability over the past 12 months.
  - **Overdue Penalty (20%):** Deducts points progressively if service thresholds are violated.
- **Categorization:**
  - `85 – 100`: Excellent
  - `70 – 84`: Good
  - `50 – 69`: Needs Attention
  - `< 50`: Poor
- **Critical Safety Override Logic:** If any critical inspection defect is detected, the vehicle is immediately grounded and marked `UNSAFE` in the database, overriding numerical scoring.

### 3. Fuel Consumption & Mileage Analytics
- Computes actual fuel mileage between full-tank refills:
  $$\text{Mileage (KM/L)} = \frac{\text{Distance Travelled}}{\text{Fuel Consumed}}$$
  $$\text{Total Cost} = \text{Quantity (L)} \times \text{Price per Litre}$$
- Handles full-tank and partial-tank fills accurately without corrupting mileage averages.
- Detects abnormal efficiency drops (e.g., fuel theft or sensor malfunctions) and alerts leadership.

### 4. Daily 8-Point Driver Health Inspection
- Simple, mobile-friendly checklist:
  1. Brake Condition
  2. Tyre Condition
  3. Engine Oil
  4. Battery Condition
  5. Headlights
  6. Indicators
  7. Coolant Level
  8. Steering Condition
- Supported status: `Good`, `Needs Attention`, `Critical`.
- **Safety Lockout:** Critical defects automatically flag the vehicle as `UNSAFE` and notify the manager immediately.

### 5. QR Code Vehicle History Passports (ZXing)
- Unique base64 QR code automatically generated on vehicle registration.
- Print badges, download PNGs, and scan from any mobile device.
- Directs to `/qr-view.html?token=<uuid>`: a secure, read-only authorized public passport displaying health score, current odometer, recent maintenance, and repair history.

### 6. AI Maintenance Assistant (Gemini / OpenRouter + Fleet Engine)
- Hybrid AI engine that injects live database snapshots into LLM prompts.
- Answers complex queries such as:
  - *"Which vehicle needs maintenance next?"*
  - *"Which vehicle has the highest repair cost?"*
  - *"Show vehicles with poor health scores."*
  - *"What are the total repair expenses this month?"*
  - *"Which vehicles have frequent breakdowns?"*
  - *"Recommend maintenance priorities for this month."*
- Robust deterministic fallback query engine ensures 100% availability even if third-party LLM quotas or keys expire.

---

## 🎨 UI/UX Design System

- **Visual Direction:** Inspired by *FleetPro – Vehicle Management Dashboard UI by Saleh Ahmed on Dribbble*.
- **Aesthetic:** Minimal, modern, professional white-and-orange SaaS styling.
- **Color Palette:**
  - Primary Orange: `#F97316`
  - Secondary Orange: `#FB923C`
  - Light Orange (Selection & Highlights): `#FFF7ED`
  - Main Background: `#F8F8F8`
  - Card Background: `#FFFFFF`
  - Primary Text: `#171717` (Dark Charcoal)
  - Secondary Text: `#737373`
  - Borders: `#E5E5E5`
- **Typography:** Inter sans-serif font family.
- **Dark Mode:** Optional high-contrast dark theme with persistent local storage toggle.

---

## 💻 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js 4.4, Lucide Icons, Fetch API |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Web, Spring Data JPA, Hibernate, Bean Validation |
| **Security** | Spring Security 6, JWT (io.jsonwebtoken 0.12.6), BCrypt Password Hashing, RBAC |
| **Database** | MySQL 8.x / 9.x (`fleetiq_db`) |
| **QR Engine** | ZXing Core & JavaSE 3.5.3 |
| **AI Integration** | Google Gemini API / OpenRouter (`google/gemini-2.5-flash`) + Database Context Engine |
| **Notifications** | Spring Boot Scheduled Tasks (`@Scheduled`), Spring Mail Sender |
| **Build Tool** | Apache Maven |

---

## 🔐 Default Demo Accounts

| Role | Username | Password | Full Name | Access Level |
|---|---|---|---|---|
| **Admin** | `admin` | `admin123` | Alex Morgan | Full system access, user management, settings |
| **Manager** | `manager` | `manager123` | Sarah Jenkins | Vehicle CRUD, maintenance, repairs, reports, AI assistant |
| **Driver** | `driver1` | `driver123` | David Miller | Odometer entry, daily inspection checklists |
| **Driver** | `driver2` | `driver123` | Elena Gomez | Odometer entry, daily inspection checklists |

*(Quick-fill demo buttons are available on the login page at `http://localhost:8080/login.html`)*

---

## 📁 Project Architecture

```
FleetIQ/
├── pom.xml
├── .gitignore
├── .env.example
├── README.md
├── src/
│   ├── main/
│   │   ├── java/com/fleetiq/
│   │   │   ├── FleetIqApplication.java
│   │   │   ├── ai/
│   │   │   │   └── AiAssistantService.java
│   │   │   ├── config/
│   │   │   │   └── DataInitializer.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── VehicleController.java
│   │   │   │   ├── MaintenanceController.java
│   │   │   │   ├── RepairController.java
│   │   │   │   ├── FuelController.java
│   │   │   │   ├── InspectionController.java
│   │   │   │   ├── HealthController.java
│   │   │   │   ├── QrController.java
│   │   │   │   ├── DashboardController.java
│   │   │   │   ├── NotificationController.java
│   │   │   │   ├── ReportController.java
│   │   │   │   ├── SettingController.java
│   │   │   │   └── UserController.java
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── scheduler/
│   │   │   ├── security/
│   │   │   ├── service/
│   │   │   └── util/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── schema.sql
│   │       └── static/
│   │           ├── index.html
│   │           ├── login.html
│   │           ├── dashboard.html
│   │           ├── vehicles.html
│   │           ├── vehicle-details.html
│   │           ├── maintenance.html
│   │           ├── repairs.html
│   │           ├── fuel.html
│   │           ├── inspections.html
│   │           ├── health.html
│   │           ├── qr-history.html
│   │           ├── qr-view.html
│   │           ├── ai-assistant.html
│   │           ├── reports.html
│   │           ├── notifications.html
│   │           ├── settings.html
│   │           ├── css/
│   │           │   ├── theme.css
│   │           │   ├── layout.css
│   │           │   └── components.css
│   │           └── js/
│   │               ├── api.js
│   │               ├── auth.js
│   │               ├── app.js
│   │               └── [module].js
│   └── test/
│       └── java/com/fleetiq/
│           ├── PredictiveMaintenanceTests.java
│           └── HealthScoreTests.java
```

---

## 🛠️ Local Setup & Execution Instructions

### Prerequisites
- **Java 21** LTS
- **Maven 3.8+**
- **MySQL 8.0+** running locally on port 3306

### Step 1: Database Setup
Make sure MySQL is running and execute:
```sql
CREATE DATABASE IF NOT EXISTS fleetiq_db;
```
*(Hibernate `ddl-auto: update` automatically generates all normalized tables and `DataInitializer` seeds 8 complete vehicles, maintenance records, repairs, fuel history, and QR tokens on first startup).*

### Step 2: Configure Environment (Optional)
Configure credentials in `src/main/resources/application.yml` or via environment variables:
```bash
export DB_USERNAME=root
export DB_PASSWORD=Aa9392*#
export GEMINI_API_KEY=your_gemini_api_key
```

### Step 3: Compile and Test
```bash
mvn clean test
```

### Step 4: Run Application
```bash
mvn spring-boot:run
```

### Step 5: Open in Browser
Visit **`http://localhost:8080`** in your browser.

---

## 📡 Key REST APIs

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticates user and returns JWT token |
| `/api/auth/register` | `POST` | Public | Registers a new driver/manager account |
| `/api/dashboard/summary` | `GET` | Authenticated | Live KPIs, 6 charts, upcoming countdowns |
| `/api/vehicles` | `GET`, `POST` | Manager/Admin | Lists and registers fleet vehicles |
| `/api/vehicles/{id}/odometer` | `POST` | Driver+ | Validates and submits odometer updates |
| `/api/maintenance/predictions` | `GET` | Authenticated | Rule-based forecasting countdowns |
| `/api/maintenance` | `POST` | Manager/Admin | Records completed service & resets threshold |
| `/api/repairs` | `GET`, `POST` | Manager/Admin | Tracks breakdowns and downtime |
| `/api/repairs/{id}/status` | `PATCH` | Manager/Admin | Updates repair status to Completed |
| `/api/fuel` | `GET`, `POST` | Authenticated | Logs refills and computes KM/L |
| `/api/fuel/comparison` | `GET` | Authenticated | Compares fuel efficiency between vehicles |
| `/api/inspections` | `POST` | Driver+ | Submits 8-point checklist (grounds vehicle if critical) |
| `/api/health/summary` | `GET` | Authenticated | Fleet health score distribution (0-100) |
| `/api/qr/public/{token}` | `GET` | Public | Public read-only digital vehicle passport |
| `/api/ai/chat` | `POST` | Authenticated | Fleet database conversational AI assistant |
| `/api/reports/export` | `GET` | Manager/Admin | Downloads CSV financial ledger |

---

## 📄 License
FleetIQ is developed as an enterprise smart fleet vehicle maintenance tracking and management platform. All rights reserved.
