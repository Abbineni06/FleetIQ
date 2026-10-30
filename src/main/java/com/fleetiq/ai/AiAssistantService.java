package com.fleetiq.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.AiDTOs.ChatResponse;
import com.fleetiq.dto.MaintenanceDTOs.PredictiveMaintenanceDTO;
import com.fleetiq.entity.*;
import com.fleetiq.repository.*;
import com.fleetiq.service.MaintenanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiAssistantService {

    private static final Logger logger = LoggerFactory.getLogger(AiAssistantService.class);

    private final VehicleRepository vehicleRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final RepairRecordRepository repairRepository;
    private final FuelRecordRepository fuelRepository;
    private final VehicleHealthScoreRepository healthRepository;
    private final AiChatMessageRepository chatHistoryRepository;
    private final MaintenanceService maintenanceService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${fleetiq.ai.openrouter-api-key:${OPENROUTER_API_KEY:}}")
    private String openrouterApiKey;

    @Value("${fleetiq.ai.gemini-api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Value("${fleetiq.ai.model:google/gemini-2.5-flash}")
    private String modelName;

    public AiAssistantService(VehicleRepository vehicleRepository,
                              MaintenanceRecordRepository maintenanceRepository,
                              RepairRecordRepository repairRepository,
                              FuelRecordRepository fuelRepository,
                              VehicleHealthScoreRepository healthRepository,
                              AiChatMessageRepository chatHistoryRepository,
                              MaintenanceService maintenanceService) {
        this.vehicleRepository = vehicleRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.repairRepository = repairRepository;
        this.fuelRepository = fuelRepository;
        this.healthRepository = healthRepository;
        this.chatHistoryRepository = chatHistoryRepository;
        this.maintenanceService = maintenanceService;
    }

    @Transactional
    public ChatResponse processQuery(String userQuery, User user) {
        // Save user message to history
        chatHistoryRepository.save(new AiChatMessage(user, "user", userQuery));

        // 1. Gather live database facts
        String fleetContext = buildFleetContext();

        // 2. Attempt LLM generation
        ChatResponse response = null;
        if (openrouterApiKey != null && !openrouterApiKey.trim().isEmpty()) {
            response = callOpenRouterGemini(userQuery, fleetContext);
        }

        // 3. Fallback to deterministic expert engine if LLM unavailable or failed
        if (response == null || response.getReply() == null || response.getReply().trim().isEmpty()) {
            response = executeDeterministicFleetQuery(userQuery);
        }

        // Save AI reply to history
        chatHistoryRepository.save(new AiChatMessage(user, "assistant", response.getReply()));

        return response;
    }

    private ChatResponse callOpenRouterGemini(String userQuery, String fleetContext) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openrouterApiKey);

            String systemPrompt = "You are FleetIQ AI, an enterprise fleet maintenance and analytics assistant.\n" +
                    "Use ONLY the following verified fleet database records to answer questions precisely.\n" +
                    "Format responses with clean Markdown tables, bold headers, and bullet points.\n" +
                    "Distinguish between calculated predictions and actual maintenance records.\n\n" +
                    "VERIFIED FLEET DATABASE SNAPSHOT:\n" + fleetContext;

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("model", modelName);
            reqBody.put("max_tokens", 500);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userQuery));
            reqBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    String content = choices.get(0).path("message").path("content").asText();
                    List<String> suggestions = generateSuggestions(userQuery);
                    return new ChatResponse(content, suggestions, false);
                }
            }
        } catch (Exception e) {
            logger.warn("OpenRouter API call failed or quota exceeded: {}. Falling back to deterministic engine.", e.getMessage());
        }
        return null;
    }

    private ChatResponse executeDeterministicFleetQuery(String query) {
        String q = query.toLowerCase();
        StringBuilder reply = new StringBuilder();
        List<String> suggestions = new ArrayList<>();

        if (q.contains("maintenance next") || q.contains("needs maintenance") || q.contains("upcoming service")) {
            List<PredictiveMaintenanceDTO> list = maintenanceService.getAllPredictions().stream()
                    .sorted(Comparator.comparingInt(PredictiveMaintenanceDTO::getRemainingKm))
                    .collect(Collectors.toList());

            if (!list.isEmpty()) {
                PredictiveMaintenanceDTO top = list.get(0);
                reply.append("### 🔧 Next Vehicle Requiring Maintenance\n\n");
                reply.append("**Vehicle:** `").append(top.getRegistrationNumber()).append("` (").append(top.getVehicleModel()).append(")\n\n");
                reply.append("- **Current Odometer:** ").append(top.getCurrentOdometer()).append(" KM\n");
                reply.append("- **Next Service Threshold:** ").append(top.getNextServiceKm()).append(" KM\n");
                reply.append("- **Remaining Distance:** ").append(top.getRemainingKm()).append(" KM\n");
                reply.append("- **Status / Urgency:** `").append(top.getUrgency()).append("`\n");
                if (top.isHasSufficientData() && top.getPredictedServiceDate() != null) {
                    reply.append("- **Estimated Service Date:** ").append(top.getPredictedServiceDate()).append(" (~").append(top.getEstimatedDaysRemaining()).append(" days)\n");
                }
                reply.append("\n**Recommended Action:** Schedule a service slot before the vehicle crosses threshold to avoid breakdown.");
            } else {
                reply.append("No vehicles currently logged in the fleet database.");
            }
            suggestions.add("Which vehicles are overdue for service?");
            suggestions.add("Show vehicles with poor health scores.");

        } else if (q.contains("overdue")) {
            List<PredictiveMaintenanceDTO> overdueList = maintenanceService.getAllPredictions().stream()
                    .filter(p -> "OVERDUE".equals(p.getUrgency()) || p.getRemainingKm() <= 0)
                    .collect(Collectors.toList());

            reply.append("### ⚠️ Overdue Vehicles for Service\n\n");
            if (overdueList.isEmpty()) {
                reply.append("Great news! There are **no vehicles currently overdue** for service in the fleet.");
            } else {
                reply.append("| Vehicle | Model | Current KM | Next Svc KM | Overdue By |\n");
                reply.append("|---|---|---|---|---|\n");
                for (PredictiveMaintenanceDTO p : overdueList) {
                    reply.append("| `").append(p.getRegistrationNumber()).append("` | ")
                            .append(p.getVehicleModel()).append(" | ")
                            .append(p.getCurrentOdometer()).append(" KM | ")
                            .append(p.getNextServiceKm()).append(" KM | ")
                            .append(Math.abs(p.getRemainingKm())).append(" KM |\n");
                }
                reply.append("\n> **Priority Alert:** Overdue vehicles risk mechanical failure and carry health score penalties.");
            }
            suggestions.add("Which vehicle needs maintenance next?");
            suggestions.add("What are the total repair expenses this month?");

        } else if (q.contains("highest repair cost") || q.contains("repair cost") || q.contains("expensive vehicle to maintain") || q.contains("most expensive")) {
            List<Vehicle> vehicles = vehicleRepository.findAll();
            Vehicle maxRepairVehicle = null;
            BigDecimal maxRepairCost = BigDecimal.ZERO;
            Vehicle maxTotalVehicle = null;
            BigDecimal maxTotalCost = BigDecimal.ZERO;

            for (Vehicle v : vehicles) {
                BigDecimal rCost = repairRepository.sumCostByVehicleId(v.getId());
                BigDecimal mCost = maintenanceRepository.sumCostByVehicleId(v.getId());
                BigDecimal total = rCost.add(mCost);

                if (rCost.compareTo(maxRepairCost) > 0) {
                    maxRepairCost = rCost;
                    maxRepairVehicle = v;
                }
                if (total.compareTo(maxTotalCost) > 0) {
                    maxTotalCost = total;
                    maxTotalVehicle = v;
                }
            }

            reply.append("### 💰 Fleet Expense & Repair Breakdown\n\n");
            if (maxRepairVehicle != null) {
                reply.append("- **Highest Repair Expense:** `").append(maxRepairVehicle.getRegistrationNumber())
                        .append("` (").append(maxRepairVehicle.getMake()).append(" ").append(maxRepairVehicle.getModel())
                        .append(") with **$").append(maxRepairCost).append("** in cumulative repairs.\n");
            }
            if (maxTotalVehicle != null) {
                reply.append("- **Most Expensive Overall (Maint + Repairs):** `").append(maxTotalVehicle.getRegistrationNumber())
                        .append("` with **$").append(maxTotalCost).append("** total maintenance cost.\n");
            }
            suggestions.add("What are the total repair expenses this month?");
            suggestions.add("Which vehicles have frequent breakdowns?");

        } else if (q.contains("lowest mileage") || q.contains("fuel efficiency") || q.contains("fuel consumption") || q.contains("compare fuel")) {
            List<Vehicle> vehicles = vehicleRepository.findAllOrdered();
            reply.append("### ⛽ Fuel Efficiency & Mileage Comparison\n\n");
            reply.append("| Vehicle | Fuel Type | Avg Mileage (KM/L) | Total Fuel Cost |\n");
            reply.append("|---|---|---|---|\n");

            for (Vehicle v : vehicles) {
                Double avgM = fuelRepository.averageMileageByVehicleId(v.getId());
                BigDecimal cost = fuelRepository.sumCostByVehicleId(v.getId());
                reply.append("| `").append(v.getRegistrationNumber()).append("` | ")
                        .append(v.getFuelType()).append(" | ")
                        .append(avgM != null ? String.format("%.2f", avgM) : "N/A").append(" | ")
                        .append("$").append(cost != null ? cost : BigDecimal.ZERO).append(" |\n");
            }
            suggestions.add("Which vehicle needs maintenance next?");
            suggestions.add("Recommend maintenance priorities for this month.");

        } else if (q.contains("poor health") || q.contains("health score") || q.contains("health")) {
            List<Vehicle> vehicles = vehicleRepository.findAllOrdered();
            reply.append("### 🏥 Vehicle Health Audit\n\n");
            reply.append("| Vehicle | Status | Health Score | Category | Condition |\n");
            reply.append("|---|---|---|---|---|\n");

            for (Vehicle v : vehicles) {
                VehicleHealthScore h = healthRepository.findTopByVehicleOrderByCalculatedAtDesc(v).orElse(null);
                int score = h != null ? h.getOverallScore() : 85;
                String cat = h != null ? h.getCategory() : "Good";
                String cond = v.getStatus() == VehicleStatus.UNSAFE ? "🚨 UNSAFE DEFECT" : (score >= 70 ? "✅ Operational" : "⚠️ Needs Attention");

                reply.append("| `").append(v.getRegistrationNumber()).append("` | ")
                        .append(v.getStatus().name()).append(" | ")
                        .append(score).append("/100 | ")
                        .append(cat).append(" | ")
                        .append(cond).append(" |\n");
            }
            suggestions.add("Which vehicles are overdue for service?");
            suggestions.add("Which vehicles have frequent breakdowns?");

        } else if (q.contains("total repair expenses") || q.contains("expenses this month")) {
            LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
            BigDecimal mCost = maintenanceRepository.sumTotalCostSince(firstDayOfMonth);
            BigDecimal rCost = repairRepository.sumTotalCostSince(firstDayOfMonth);
            BigDecimal fCost = fuelRepository.sumTotalCostSince(firstDayOfMonth);

            reply.append("### 📊 Fleet Expenses for This Month (").append(firstDayOfMonth.getMonth()).append(")\n\n");
            reply.append("- **Scheduled Maintenance:** $").append(mCost).append("\n");
            reply.append("- **Unscheduled Repairs:** $").append(rCost).append("\n");
            reply.append("- **Fuel Expenditure:** $").append(fCost).append("\n");
            reply.append("- **Total Combined Expenses:** **$").append(mCost.add(rCost).add(fCost)).append("**\n\n");
            reply.append("All figures reflect verified database entries for the current billing cycle.");
            suggestions.add("Show the most expensive vehicle to maintain.");
            suggestions.add("Recommend maintenance priorities for this month.");

        } else if (q.contains("frequent breakdown") || q.contains("breakdown")) {
            LocalDate oneYearAgo = LocalDate.now().minusYears(1);
            List<Vehicle> vehicles = vehicleRepository.findAll();
            reply.append("### 🛠️ Vehicles with Breakdown & Repair History (Past 12 Months)\n\n");

            boolean found = false;
            for (Vehicle v : vehicles) {
                long count = repairRepository.countRepairsSince(v.getId(), oneYearAgo);
                if (count > 0) {
                    found = true;
                    BigDecimal cost = repairRepository.sumCostByVehicleId(v.getId());
                    reply.append("- `").append(v.getRegistrationNumber()).append("` (").append(v.getMake()).append(" ").append(v.getModel())
                            .append("): **").append(count).append(" repair incidents**, totaling **$").append(cost).append("**\n");
                }
            }
            if (!found) {
                reply.append("No recurring mechanical breakdowns logged in the past 12 months.");
            }
            suggestions.add("Which vehicle needs maintenance next?");
            suggestions.add("Show vehicles with poor health scores.");

        } else {
            // General Priority Recommendation
            reply.append("### 📋 Fleet Maintenance Executive Summary & Priorities\n\n");
            List<PredictiveMaintenanceDTO> predictions = maintenanceService.getAllPredictions();
            long overdueCount = predictions.stream().filter(p -> "OVERDUE".equals(p.getUrgency())).count();
            long dueSoonCount = predictions.stream().filter(p -> "DUE_SOON".equals(p.getUrgency())).count();
            long unsafeCount = vehicleRepository.countByStatus(VehicleStatus.UNSAFE);

            reply.append("1. **Critical Safety Groundings:** ").append(unsafeCount).append(" vehicle(s) flagged unsafe. Resolve critical inspection checklist defects before dispatch.\n");
            reply.append("2. **Overdue Service:** ").append(overdueCount).append(" vehicle(s) currently exceed recommended mileage thresholds.\n");
            reply.append("3. **Due Soon (<500 KM):** ").append(dueSoonCount).append(" vehicle(s) nearing service. Book workshop slots now.\n\n");
            reply.append("You can ask for specific vehicle details, expense breakdowns, or fuel comparisons.");

            suggestions.add("Which vehicle needs maintenance next?");
            suggestions.add("Which vehicle has the highest repair cost?");
            suggestions.add("Which vehicle has the lowest mileage?");
        }

        return new ChatResponse(reply.toString(), suggestions, true);
    }

    private String buildFleetContext() {
        StringBuilder sb = new StringBuilder();
        List<Vehicle> vehicles = vehicleRepository.findAllOrdered();
        sb.append("Total fleet count: ").append(vehicles.size()).append(" vehicles.\n");

        for (Vehicle v : vehicles) {
            VehicleHealthScore h = healthRepository.findTopByVehicleOrderByCalculatedAtDesc(v).orElse(null);
            BigDecimal rCost = repairRepository.sumCostByVehicleId(v.getId());
            BigDecimal mCost = maintenanceRepository.sumCostByVehicleId(v.getId());
            Double avgMileage = fuelRepository.averageMileageByVehicleId(v.getId());

            sb.append("Vehicle ").append(v.getRegistrationNumber())
                    .append(" (").append(v.getMake()).append(" ").append(v.getModel()).append("): ")
                    .append("Status=").append(v.getStatus())
                    .append(", CurrentKM=").append(v.getCurrentOdometer())
                    .append(", NextSvcKM=").append(v.getNextServiceKm())
                    .append(", RemainingKM=").append(v.getNextServiceKm() - v.getCurrentOdometer())
                    .append(", HealthScore=").append(h != null ? h.getOverallScore() : "N/A")
                    .append(", TotalRepairs=$").append(rCost)
                    .append(", TotalMaint=$").append(mCost)
                    .append(", AvgMileage=").append(avgMileage != null ? avgMileage + " KM/L" : "N/A")
                    .append("\n");
        }
        return sb.toString();
    }

    private List<String> generateSuggestions(String query) {
        return List.of(
                "Which vehicle needs maintenance next?",
                "Which vehicle has the highest repair cost?",
                "Show vehicles with poor health scores."
        );
    }
}
