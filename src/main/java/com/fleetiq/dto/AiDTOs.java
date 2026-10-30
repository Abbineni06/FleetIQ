package com.fleetiq.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AiDTOs {

    public static class ChatRequest {
        private String message;

        public ChatRequest() {}
        public ChatRequest(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ChatResponse {
        private String reply;
        private List<String> followUpSuggestions;
        private LocalDateTime timestamp;
        private boolean isFallback;

        public ChatResponse() {}
        public ChatResponse(String reply, List<String> followUpSuggestions, boolean isFallback) {
            this.reply = reply;
            this.followUpSuggestions = followUpSuggestions;
            this.timestamp = LocalDateTime.now();
            this.isFallback = isFallback;
        }

        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
        public List<String> getFollowUpSuggestions() { return followUpSuggestions; }
        public void setFollowUpSuggestions(List<String> followUpSuggestions) { this.followUpSuggestions = followUpSuggestions; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public boolean isFallback() { return isFallback; }
        public void setFallback(boolean fallback) { isFallback = fallback; }
    }

    public static class ChatHistoryItemDTO {
        private Long id;
        private String role;
        private String message;
        private LocalDateTime createdAt;

        public ChatHistoryItemDTO() {}
        public ChatHistoryItemDTO(Long id, String role, String message, LocalDateTime createdAt) {
            this.id = id;
            this.role = role;
            this.message = message;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
