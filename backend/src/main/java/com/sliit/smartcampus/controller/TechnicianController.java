package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.model.Technician;
import com.sliit.smartcampus.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class TechnicianController {

    @Autowired
    private TechnicianRepository technicianRepository;

    @GetMapping
    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    @PostMapping
    public Technician addTechnician(@RequestBody Technician technician) {
        return technicianRepository.save(technician);
    }

    @DeleteMapping("/{id}")
    public void deleteTechnician(@PathVariable String id) {
        technicianRepository.deleteById(id);
    }
}