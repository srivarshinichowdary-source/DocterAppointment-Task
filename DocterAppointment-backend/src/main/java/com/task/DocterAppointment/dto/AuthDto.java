package com.task.DocterAppointment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

// ── Auth DTOs ─────────────────────────────────────────────────────────────────

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(max = 100)
        private String name;

        @NotBlank @Email @Size(max = 100)
        private String email;

        @NotBlank @Size(min = 6, max = 40)
        private String password;

        @Size(max = 20)
        private String phone;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class JwtResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String name;
        private String email;
        private String role;

        public JwtResponse(String token, Long id, String name, String email, String role) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }
}

// ── Appointment DTOs ──────────────────────────────────────────────────────────

