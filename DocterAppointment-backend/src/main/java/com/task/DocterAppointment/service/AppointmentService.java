package com.task.DocterAppointment.service;

import com.task.DocterAppointment.dto.AppointmentDto;
import com.task.DocterAppointment.entity.Appointment;
import com.task.DocterAppointment.entity.Doctor;
import com.task.DocterAppointment.entity.User;
import com.task.DocterAppointment.repository.AppointmentRepository;
import com.task.DocterAppointment.repository.DoctorRepository;
import com.task.DocterAppointment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public AppointmentDto.AppointmentResponse bookAppointment(AppointmentDto.BookRequest req) {
        User user = getCurrentUser();

        // Validate date is not in the past
        if (req.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book an appointment in the past");
        }

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + req.getDoctorId()));

        if (!doctor.getAvailable()) {
            throw new RuntimeException("Doctor is not available at the moment");
        }

        // ── Core duplicate-booking check ──────────────────────────────────────
        boolean slotTaken = appointmentRepository.isSlotBooked(
                doctor.getId(),
                req.getAppointmentDate(),
                req.getAppointmentTime()
        );
        if (slotTaken) {
            throw new RuntimeException(
                    "This time slot is already booked for Dr. " + doctor.getName() +
                            " on " + req.getAppointmentDate() + " at " + req.getAppointmentTime() +
                            ". Please choose a different time."
            );
        }

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(req.getAppointmentDate());
        appointment.setAppointmentTime(req.getAppointmentTime());
        appointment.setReason(req.getReason());
        appointment.setNotes(req.getNotes());
        appointment.setStatus(Appointment.Status.SCHEDULED);

        Appointment saved = appointmentRepository.save(appointment);
        return AppointmentDto.AppointmentResponse.from(saved);
    }

    public List<AppointmentDto.AppointmentResponse> getMyAppointments() {
        User user = getCurrentUser();
        return appointmentRepository
                .findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(user.getId())
                .stream()
                .map(AppointmentDto.AppointmentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto.AppointmentResponse cancelAppointment(Long appointmentId) {
        User user = getCurrentUser();
        Appointment appointment = appointmentRepository
                .findByIdAndUserId(appointmentId, user.getId())
                .orElseThrow(() -> new RuntimeException("Appointment not found or not owned by you"));

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }
        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        return AppointmentDto.AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    public List<LocalTime> getBookedSlots(Long doctorId, LocalDate date) {
        return appointmentRepository.findBookedSlotsByDoctorAndDate(doctorId, date);
    }
}