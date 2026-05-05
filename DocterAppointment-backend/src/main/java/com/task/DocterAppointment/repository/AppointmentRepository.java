package com.task.DocterAppointment.repository;

import com.task.DocterAppointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserId(Long userId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(Long userId);

    /**
     * Check if a time slot is already booked for a doctor (excluding CANCELLED status).
     * This is the core duplicate-booking prevention query.
     */
    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.appointmentTime = :time " +
            "AND a.status <> 'CANCELLED'")
    boolean isSlotBooked(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time
    );

    @Query("SELECT a.appointmentTime FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.status <> 'CANCELLED'")
    List<LocalTime> findBookedSlotsByDoctorAndDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date
    );

    Optional<Appointment> findByIdAndUserId(Long id, Long userId);
}