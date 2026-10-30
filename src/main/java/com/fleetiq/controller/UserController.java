package com.fleetiq.controller;

import com.fleetiq.dto.AuthDTOs.UserDTO;
import com.fleetiq.entity.Role;
import com.fleetiq.entity.User;
import com.fleetiq.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> list = userRepository.findAll().stream()
                .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getPhone(), u.getRole().name(), u.isActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");
        String fullName = payload.get("fullName");
        String phone = payload.get("phone");
        String roleStr = payload.get("role");

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Role role = Role.valueOf(roleStr != null ? roleStr : "ROLE_DRIVER");
        User user = new User(username, email, passwordEncoder.encode(password != null ? password : "password123"), fullName, phone, role);
        User saved = userRepository.save(user);

        return ResponseEntity.ok(new UserDTO(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getPhone(), saved.getRole().name(), saved.isActive()));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User status updated", "active", user.isActive()));
    }
}
