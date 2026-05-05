package com.task.DocterAppointment.controller;

import com.task.DocterAppointment.dto.AppointmentDto;

import com.task.DocterAppointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * Book a new appointment. Automatically rejects duplicate time slots.
     */
    @PostMapping
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentDto.BookRequest req) {
        try {
            AppointmentDto.AppointmentResponse response = appointmentService.bookAppointment(req);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all appointments for the currently authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getMyAppointments());
    }

    /**
     * Cancel a specific appointment (only owner can cancel).
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            AppointmentDto.AppointmentResponse response = appointmentService.cancelAppointment(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get booked time slots for a doctor on a specific date.
     * Used by the frontend to grey out unavailable slots.
     */
    @GetMapping("/booked-slots")
    public ResponseEntity<List<LocalTime>> getBookedSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getBookedSlots(doctorId, date));
    }
}