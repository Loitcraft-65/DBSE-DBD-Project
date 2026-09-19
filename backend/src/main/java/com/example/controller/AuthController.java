package com.example.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.repository.UserAccountRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserAccountRepository userRepository;

    public AuthController(UserAccountRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null || username.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required."));
        }

        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password))
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "userId", user.getUserId(),
                        "username", user.getUsername(),
                        "displayName", user.getDisplayName() != null ? user.getDisplayName()
                                : (user.getName() != null ? user.getName() : user.getUsername())
                )))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Invalid username or password."
                )));
    }
}
