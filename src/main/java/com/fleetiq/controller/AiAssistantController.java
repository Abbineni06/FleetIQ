package com.fleetiq.controller;

import com.fleetiq.ai.AiAssistantService;
import com.fleetiq.dto.AiDTOs.ChatHistoryItemDTO;
import com.fleetiq.dto.AiDTOs.ChatRequest;
import com.fleetiq.dto.AiDTOs.ChatResponse;
import com.fleetiq.entity.User;
import com.fleetiq.repository.AiChatMessageRepository;
import com.fleetiq.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiAssistantService aiService;
    private final UserRepository userRepository;
    private final AiChatMessageRepository chatHistoryRepository;

    public AiAssistantController(AiAssistantService aiService,
                                 UserRepository userRepository,
                                 AiChatMessageRepository chatHistoryRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request, Principal principal) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = principal != null ? userRepository.findByUsername(principal.getName()).orElse(null) : null;
        ChatResponse response = aiService.processQuery(request.getMessage().trim(), user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatHistoryItemDTO>> getHistory(Principal principal) {
        User user = principal != null ? userRepository.findByUsername(principal.getName()).orElse(null) : null;
        List<ChatHistoryItemDTO> list = (user != null ? chatHistoryRepository.findTop50ByUserOrderByCreatedAtAsc(user) : chatHistoryRepository.findTop50ByOrderByCreatedAtAsc())
                .stream()
                .map(m -> new ChatHistoryItemDTO(m.getId(), m.getRole(), m.getMessage(), m.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/history")
    @Transactional
    public ResponseEntity<?> clearHistory(Principal principal) {
        if (principal != null) {
            userRepository.findByUsername(principal.getName()).ifPresent(chatHistoryRepository::deleteByUser);
        }
        return ResponseEntity.ok("Chat history cleared");
    }
}
