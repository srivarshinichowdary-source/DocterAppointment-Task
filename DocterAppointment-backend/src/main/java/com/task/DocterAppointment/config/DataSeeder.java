package com.task.DocterAppointment.config;

import com.task.DocterAppointment.entity.Doctor;
import com.task.DocterAppointment.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public void run(String... args) {
        if (doctorRepository.count() == 0) {
            List<Doctor> doctors = List.of(
                    createDoctor("Dr. Arjun Sharma", "Cardiology", "+91-9876543210", "arjun.sharma@docapp.com", 12, "Specialist in heart diseases and cardiovascular health."),
                    createDoctor("Dr. Priya Mehta", "Dermatology", "+91-9876543211", "priya.mehta@docapp.com", 8, "Expert in skin conditions and cosmetic dermatology."),
                    createDoctor("Dr. Ravi Kumar", "Orthopedics", "+91-9876543212", "ravi.kumar@docapp.com", 15, "Bone and joint specialist with expertise in sports injuries."),
                    createDoctor("Dr. Sneha Reddy", "Pediatrics", "+91-9876543213", "sneha.reddy@docapp.com", 10, "Dedicated children's health specialist."),
                    createDoctor("Dr. Vijay Nair", "Neurology", "+91-9876543214", "vijay.nair@docapp.com", 18, "Brain and nervous system specialist."),
                    createDoctor("Dr. Ananya Iyer", "Gynecology", "+91-9876543215", "ananya.iyer@docapp.com", 11, "Women's health and maternity care specialist.")
            );
            doctorRepository.saveAll(doctors);
            System.out.println("✅ Seeded " + doctors.size() + " doctors.");
        }
    }

    private Doctor createDoctor(String name, String specialty, String phone,
                                String email, int exp, String bio) {
        Doctor d = new Doctor();
        d.setName(name);
        d.setSpecialty(specialty);
        d.setPhone(phone);
        d.setEmail(email);
        d.setExperienceYears(exp);
        d.setBio(bio);
        d.setAvailable(true);
        return d;
    }
}