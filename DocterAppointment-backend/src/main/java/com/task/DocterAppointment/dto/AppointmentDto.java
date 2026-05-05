package com.task.DocterAppointment.dto;

import com.task.DocterAppointment.entity.Appointment;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentDto {

    @Data
    public static class BookRequest {
        @NotNull
        private Long doctorId;

        @NotNull
        private LocalDate appointmentDate;

        @NotNull
        private LocalTime appointmentTime;

        @Size(max = 300)
        private String reason;

        @Size(max = 500)
        private String notes;
    }

    @Data
    public static class AppointmentResponse {
        private Long id;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialty;
        private Long userId;
        private String patientName;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private Appointment.Status status;
        private String reason;
        private String notes;
        private String createdAt;

        public static AppointmentResponse from(Appointment a) {
            AppointmentResponse res = new AppointmentResponse();
            res.setId(a.getId());
            res.setDoctorId(a.getDoctor().getId());
            res.setDoctorName(a.getDoctor().getName());
            res.setDoctorSpecialty(a.getDoctor().getSpecialty());
            res.setUserId(a.getUser().getId());
            res.setPatientName(a.getUser().getName());
            res.setAppointmentDate(a.getAppointmentDate());
            res.setAppointmentTime(a.getAppointmentTime());
            res.setStatus(a.getStatus());
            res.setReason(a.getReason());
            res.setNotes(a.getNotes());
            if (a.getCreatedAt() != null) {
                res.setCreatedAt(a.getCreatedAt().toString());
            }
            return res;
        }
    }
}