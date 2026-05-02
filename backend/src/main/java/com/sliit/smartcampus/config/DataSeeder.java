package com.sliit.smartcampus.config;

import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.model.Incident;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.ResourceStatus;
import com.sliit.smartcampus.model.Technician;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.IncidentRepository;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.TechnicianRepository;
import com.sliit.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Configuration
@Profile("!mock")
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
@Slf4j
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            BookingRepository bookingRepository,
            IncidentRepository incidentRepository,
            TechnicianRepository technicianRepository,
            NotificationRepository notificationRepository,
            MongoTemplate mongoTemplate,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.default-password:Password@123}") String defaultPassword) {
        return args -> {
            try {
                migrateLegacyBookingStatuses(mongoTemplate);
                migrateLegacyResourceDocuments(mongoTemplate);
                SeedUsers users = seedUsers(userRepository, passwordEncoder, defaultPassword);
                SeedResources resources = seedResources(resourceRepository, users);
                SeedTechnicians technicians = seedTechnicians(technicianRepository);
                seedBookings(bookingRepository, users, resources);
                seedIncidents(incidentRepository, technicians);
                seedNotifications(notificationRepository, users);
                log.info("Seed data synchronized for users, resources, bookings, incidents, technicians, and notifications.");
            } catch (Exception ex) {
                log.warn("Skipping seed initialization because MongoDB is unavailable or rejected the seed data: {}", ex.getMessage());
            }
        };
    }

    private void migrateLegacyBookingStatuses(MongoTemplate mongoTemplate) {
        mongoTemplate.updateMulti(
                Query.query(Criteria.where("status").is("CONFIRMED")),
                Update.update("status", BookingStatus.APPROVED.name()),
                "bookings");
        mongoTemplate.updateMulti(
                Query.query(Criteria.where("status").is("DECLINED")),
                Update.update("status", BookingStatus.REJECTED.name()),
                "bookings");
        mongoTemplate.updateMulti(
                Query.query(Criteria.where("status").is("CANCELED")),
                Update.update("status", BookingStatus.CANCELLED.name()),
                "bookings");
    }

    private void migrateLegacyResourceDocuments(MongoTemplate mongoTemplate) {
        List<String> validStatuses = Arrays.stream(ResourceStatus.values())
                .map(Enum::name)
                .toList();

        mongoTemplate.updateMulti(
                Query.query(new Criteria().orOperator(
                        Criteria.where("status").exists(false),
                        Criteria.where("status").is(null),
                        Criteria.where("status").nin(validStatuses)
                )),
                Update.update("status", ResourceStatus.ACTIVE.name()),
                "resources");

        normalizeLegacyResource(mongoTemplate, "resource-lab-001", "Laboratory", "lab", 40,
                List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
                Map.of("start", "08:00", "end", "18:00"));
        normalizeLegacyResource(mongoTemplate, "resource-hall-001", "Auditorium", "room", 300,
                List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
                Map.of("start", "08:00", "end", "20:00"));
        normalizeLegacyResource(mongoTemplate, "resource-room-001", "Meeting Room", "room", 20,
                List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
                Map.of("start", "09:00", "end", "18:00"));
        normalizeLegacyResource(mongoTemplate, "resource-bus-001", "Equipment", "vehicle", 30,
                List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
                Map.of("start", "07:00", "end", "19:00"));

        mongoTemplate.updateMulti(
                Query.query(blankOrMissing("category")),
                Update.update("category", "Uncategorized"),
                "resources");
        mongoTemplate.updateMulti(
                Query.query(blankOrMissing("type")),
                Update.update("type", "resource"),
                "resources");
        mongoTemplate.updateMulti(
                Query.query(blankOrMissing("location")),
                Update.update("location", "Campus"),
                "resources");
        mongoTemplate.updateMulti(
                Query.query(nonPositiveOrMissingNumber("capacity")),
                Update.update("capacity", 1),
                "resources");
    }

    private void normalizeLegacyResource(
            MongoTemplate mongoTemplate,
            String id,
            String category,
            String type,
            int capacity,
            List<String> availableDays,
            Map<String, String> availableTimes) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(id)),
                new Update()
                        .set("category", category)
                        .set("type", type)
                        .set("capacity", capacity)
                        .set("availableDays", availableDays)
                        .set("availableTimes", availableTimes),
                "resources");
    }

    private Criteria blankOrMissing(String field) {
        return new Criteria().orOperator(
                Criteria.where(field).exists(false),
                Criteria.where(field).is(null),
                Criteria.where(field).is(""));
    }

    private Criteria nonPositiveOrMissingNumber(String field) {
        return new Criteria().orOperator(
                Criteria.where(field).exists(false),
                Criteria.where(field).is(null),
                Criteria.where(field).lte(0));
    }

    private SeedUsers seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder, String defaultPassword) {
        User admin = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "Admin User", "admin@campus.edu", Role.ADMIN);
        User primaryManager = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "John Manager", "john.m@campus.edu", Role.MANAGER);
        User secondaryManager = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "Sara Wilson", "sara.w@campus.edu", Role.MANAGER);
        User studentOne = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "Student One", "student1@campus.edu", Role.USER);
        User studentTwo = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "Nimasha Perera", "nimasha.perera@campus.edu", Role.USER);
        User itTechnician = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "Lahiru Fernando", "lahiru.fernando@campus.edu", Role.TECHNICIAN);
        User facilitiesTechnician = ensureUser(userRepository, passwordEncoder, defaultPassword,
                "Amaya Silva", "amaya.silva@campus.edu", Role.TECHNICIAN);

        return new SeedUsers(admin, primaryManager, secondaryManager, studentOne, studentTwo, itTechnician, facilitiesTechnician);
    }

    private User ensureUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String defaultPassword,
            String name,
            String email,
            Role role) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;

            if (isBlank(user.getName())) {
                user.setName(name);
                changed = true;
            }
            if (user.getRole() == null) {
                user.setRole(role);
                changed = true;
            }
            if (isBlank(user.getPassword())) {
                user.setPassword(passwordEncoder.encode(defaultPassword));
                user.setActive(true);
                changed = true;
            }
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(LocalDateTime.now());
                changed = true;
            }

            return changed ? userRepository.save(user) : user;
        }

        return userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(defaultPassword))
                .role(role)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private SeedResources seedResources(ResourceRepository resourceRepository, SeedUsers users) {
        Resource auditorium = ensureResource(resourceRepository, Resource.builder()
                .name("Grand Auditorium")
                .category("Auditorium")
                .type("room")
                .location("Main Building, Floor 1")
                .capacity(500)
                .status(ResourceStatus.ACTIVE)
                .managerId(users.primaryManager().getId())
                .managerName(users.primaryManager().getName())
                .availableDays(List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"))
                .availableTimes(Map.of("start", "08:00", "end", "18:00"))
                .description("High-capacity venue for symposiums and major campus events.")
                .imageUrl("https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200")
                .build());

        Resource computingLab = ensureResource(resourceRepository, Resource.builder()
                .name("Advanced Computing Lab")
                .category("Laboratory")
                .type("lab")
                .location("Engineering Wing, Floor 3")
                .capacity(50)
                .status(ResourceStatus.ACTIVE)
                .managerId(users.primaryManager().getId())
                .managerName(users.primaryManager().getName())
                .availableDays(List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"))
                .availableTimes(Map.of("start", "09:00", "end", "20:00"))
                .description("Computing lab for software engineering workshops, research sessions, and practical classes.")
                .imageUrl("https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200")
                .build());

        Resource collaborativeSpace = ensureResource(resourceRepository, Resource.builder()
                .name("Collaborative Space A")
                .category("Classroom")
                .type("room")
                .location("Innovation Hub, Floor 2")
                .capacity(15)
                .status(ResourceStatus.ACTIVE)
                .managerId(users.secondaryManager().getId())
                .managerName(users.secondaryManager().getName())
                .availableDays(List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"))
                .availableTimes(Map.of("start", "08:30", "end", "17:30"))
                .description("Small collaborative room with modular furniture and smart display support.")
                .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200")
                .build());

        Resource lectureHall = ensureResource(resourceRepository, Resource.builder()
                .name("Lecture Hall 4B")
                .category("Classroom")
                .type("room")
                .location("Academic Block, Floor 4")
                .capacity(100)
                .status(ResourceStatus.OUT_OF_SERVICE)
                .managerId(users.secondaryManager().getId())
                .managerName(users.secondaryManager().getName())
                .availableDays(List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"))
                .availableTimes(Map.of("start", "08:00", "end", "17:00"))
                .description("Lecture hall temporarily unavailable during AV and seating maintenance.")
                .imageUrl("https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200")
                .build());

        Resource seminarRoom = ensureResource(resourceRepository, Resource.builder()
                .name("Smart Seminar Room B")
                .category("Meeting Room")
                .type("room")
                .location("Library Complex, Floor 2")
                .capacity(30)
                .status(ResourceStatus.ACTIVE)
                .managerId(users.primaryManager().getId())
                .managerName(users.primaryManager().getName())
                .availableDays(List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"))
                .availableTimes(Map.of("start", "08:00", "end", "19:00"))
                .description("Seminar room with video conferencing, wireless presentation, and movable seating.")
                .imageUrl("https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200")
                .build());

        seedGeneratedResources(resourceRepository, users);

        return new SeedResources(auditorium, computingLab, collaborativeSpace, lectureHall, seminarRoom);
    }

    private void seedGeneratedResources(ResourceRepository resourceRepository, SeedUsers users) {
        Set<String> existingNames = resourceRepository.findAll().stream()
                .map(Resource::getName)
                .filter(name -> !isBlank(name))
                .map(name -> name.toLowerCase().trim())
                .collect(Collectors.toSet());

        List<Resource> generated = new ArrayList<>();
        addGeneratedCategoryResources(generated, existingNames, users,
                "Auditorium",
                "room",
                "Auditorium",
                "Main Campus",
                45,
                120,
                650,
                "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200",
                "Event venue with managed seating, AV support, and campus booking controls.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Laboratory",
                "lab",
                "Lab",
                "Engineering Wing",
                45,
                24,
                80,
                "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200",
                "Academic laboratory configured for practical sessions, research work, and supervised workshops.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Equipment",
                "equipment",
                "Equipment Kit",
                "Central Store",
                45,
                1,
                12,
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
                "Shared campus equipment available for approved academic and operational use.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Classroom",
                "room",
                "Classroom",
                "Academic Block",
                45,
                25,
                140,
                "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200",
                "Teaching space with standard classroom facilities and scheduled availability windows.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Sports",
                "outdoor",
                "Sports Facility",
                "Sports Complex",
                45,
                20,
                220,
                "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200",
                "Sports resource configured for student activities, training sessions, and campus events.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Meeting Room",
                "room",
                "Meeting Room",
                "Collaboration Hub",
                45,
                6,
                40,
                "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200",
                "Bookable meeting space for group discussions, staff reviews, and project consultations.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Library",
                "study-space",
                "Library Space",
                "Library Complex",
                45,
                8,
                90,
                "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200",
                "Library resource configured for reading, quiet study, and collaborative academic work.");
        addGeneratedCategoryResources(generated, existingNames, users,
                "Media Studio",
                "studio",
                "Media Studio",
                "Creative Media Center",
                45,
                4,
                25,
                "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200",
                "Studio space for video recording, audio production, streaming, and digital coursework.");

        if (!generated.isEmpty()) {
            resourceRepository.saveAll(generated);
            log.info("Seeded {} generated campus resources.", generated.size());
        }
    }

    private void addGeneratedCategoryResources(
            List<Resource> generated,
            Set<String> existingNames,
            SeedUsers users,
            String category,
            String type,
            String namePrefix,
            String locationPrefix,
            int count,
            int minCapacity,
            int maxCapacity,
            String imageUrl,
            String description) {
        int capacityRange = Math.max(1, maxCapacity - minCapacity + 1);

        for (int i = 1; i <= count; i++) {
            String name = "%s %03d".formatted(namePrefix, i);
            String normalizedName = name.toLowerCase();
            if (existingNames.contains(normalizedName)) {
                continue;
            }

            User manager = i % 2 == 0 ? users.primaryManager() : users.secondaryManager();
            int floor = (i % 6) + 1;
            int roomNumber = 100 + i;
            int capacity = minCapacity + ((i * 17) % capacityRange);
            ResourceStatus status = i % 17 == 0 ? ResourceStatus.OUT_OF_SERVICE : ResourceStatus.ACTIVE;
            List<String> availableDays = i % 5 == 0
                    ? List.of("MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY")
                    : List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");
            Map<String, String> availableTimes = i % 4 == 0
                    ? Map.of("start", "10:00", "end", "19:00")
                    : Map.of("start", "08:00", "end", "18:00");

            generated.add(Resource.builder()
                    .name(name)
                    .category(category)
                    .type(type)
                    .location("%s, Floor %d, Room %d".formatted(locationPrefix, floor, roomNumber))
                    .capacity(capacity)
                    .status(status)
                    .managerId(manager.getId())
                    .managerName(manager.getName())
                    .availableDays(availableDays)
                    .availableTimes(availableTimes)
                    .description(description)
                    .imageUrl(imageUrl)
                    .build());
            existingNames.add(normalizedName);
        }
    }

    private Resource ensureResource(ResourceRepository resourceRepository, Resource seed) {
        Optional<Resource> existing = resourceRepository.findAll().stream()
                .filter(resource -> seed.getName().equalsIgnoreCase(resource.getName()))
                .findFirst();

        if (existing.isEmpty()) {
            return resourceRepository.save(seed);
        }

        Resource resource = existing.get();
        boolean changed = false;

        if (isBlank(resource.getCategory())) {
            resource.setCategory(seed.getCategory());
            changed = true;
        }
        if (isBlank(resource.getType())) {
            resource.setType(seed.getType());
            changed = true;
        }
        if (isBlank(resource.getLocation())) {
            resource.setLocation(seed.getLocation());
            changed = true;
        }
        if (resource.getCapacity() <= 0) {
            resource.setCapacity(seed.getCapacity());
            changed = true;
        }
        if (resource.getStatus() == null) {
            resource.setStatus(seed.getStatus());
            changed = true;
        }
        if (isBlank(resource.getManagerId())) {
            resource.setManagerId(seed.getManagerId());
            changed = true;
        }
        if (isBlank(resource.getManagerName())) {
            resource.setManagerName(seed.getManagerName());
            changed = true;
        }
        if (resource.getAvailableDays() == null || resource.getAvailableDays().isEmpty()) {
            resource.setAvailableDays(seed.getAvailableDays());
            changed = true;
        }
        if (resource.getAvailableTimes() == null || resource.getAvailableTimes().isEmpty()) {
            resource.setAvailableTimes(seed.getAvailableTimes());
            changed = true;
        }
        if (isBlank(resource.getDescription())) {
            resource.setDescription(seed.getDescription());
            changed = true;
        }
        if (isBlank(resource.getImageUrl())) {
            resource.setImageUrl(seed.getImageUrl());
            changed = true;
        }

        return changed ? resourceRepository.save(resource) : resource;
    }

    private SeedTechnicians seedTechnicians(TechnicianRepository technicianRepository) {
        Technician itSupport = ensureTechnician(technicianRepository,
                "Lahiru Fernando", "lahiru.fernando@campus.edu", "IT Support");
        Technician facilities = ensureTechnician(technicianRepository,
                "Amaya Silva", "amaya.silva@campus.edu", "Maintenance");
        Technician electrical = ensureTechnician(technicianRepository,
                "Ravindu Jayasekara", "ravindu.jayasekara@campus.edu", "Electrical");

        return new SeedTechnicians(itSupport, facilities, electrical);
    }

    private Technician ensureTechnician(TechnicianRepository technicianRepository, String name, String email, String category) {
        Optional<Technician> existing = technicianRepository.findAll().stream()
                .filter(technician -> email.equalsIgnoreCase(technician.getEmail()))
                .findFirst();

        if (existing.isEmpty()) {
            Technician technician = new Technician();
            technician.setName(name);
            technician.setEmail(email);
            technician.setCategory(category);
            return technicianRepository.save(technician);
        }

        Technician technician = existing.get();
        boolean changed = false;
        if (isBlank(technician.getName())) {
            technician.setName(name);
            changed = true;
        }
        if (isBlank(technician.getCategory())) {
            technician.setCategory(category);
            changed = true;
        }

        return changed ? technicianRepository.save(technician) : technician;
    }

    private void seedBookings(BookingRepository bookingRepository, SeedUsers users, SeedResources resources) {
        LocalDate today = LocalDate.now();
        ensureBooking(bookingRepository, users.studentOne(), resources.auditorium(), users.admin(),
                "Orientation workshop setup",
                today.plusDays(1), LocalTime.of(9, 0), LocalTime.of(11, 0),
                120, BookingStatus.PENDING, null);
        ensureBooking(bookingRepository, users.studentTwo(), resources.computingLab(), users.admin(),
                "AI club hands-on session",
                today.plusDays(2), LocalTime.of(14, 0), LocalTime.of(16, 0),
                35, BookingStatus.APPROVED, null);
        ensureBooking(bookingRepository, users.studentOne(), resources.collaborativeSpace(), users.admin(),
                "Project mentor meeting",
                today.plusDays(3), LocalTime.of(10, 0), LocalTime.of(12, 0),
                10, BookingStatus.REJECTED, "Requested time overlaps with a reserved faculty review slot.");
        ensureBooking(bookingRepository, users.studentTwo(), resources.seminarRoom(), users.admin(),
                "Research presentation rehearsal",
                today.plusDays(4), LocalTime.of(13, 0), LocalTime.of(15, 0),
                24, BookingStatus.CANCELLED, null);
    }

    private Booking ensureBooking(
            BookingRepository bookingRepository,
            User user,
            Resource resource,
            User reviewer,
            String purpose,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            int expectedAttendees,
            BookingStatus status,
            String reviewReason) {
        Optional<Booking> existing = bookingRepository.findAll().stream()
                .filter(booking -> purpose.equals(booking.getPurpose()) && user.getId().equals(booking.getUserId()))
                .findFirst();

        LocalDateTime now = LocalDateTime.now();
        Booking booking = existing.orElseGet(Booking::new);
        if (booking.getCreatedAt() == null) {
            booking.setCreatedAt(now.minusDays(2));
        }

        booking.setResourceId(resource.getId());
        booking.setUserId(user.getId());
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(expectedAttendees);
        booking.setStatus(status);
        booking.setReviewReason(reviewReason);
        booking.setReviewedBy(status == BookingStatus.APPROVED || status == BookingStatus.REJECTED ? reviewer.getId() : null);
        booking.setUpdatedAt(now);

        bookingRepository.save(booking);
        return booking;
    }

    private void seedIncidents(IncidentRepository incidentRepository, SeedTechnicians technicians) {
        LocalDate today = LocalDate.now();

        ensureIncident(incidentRepository, "SC-INC-1001", incident -> {
            incident.setReportedBy("Student One");
            incident.setEmail("student1@campus.edu");
            incident.setRegistrationNumber("IT22566034");
            incident.setFaculty("Faculty of Computing");
            incident.setContactNumber("+94 77 123 4567");
            incident.setTitle("Projector display not working in Auditorium");
            incident.setCampus("Malabe Campus");
            incident.setCategory("IT Support");
            incident.setResource("Grand Auditorium");
            incident.setDescription("The projector turns on, but the HDMI input does not show on screen during rehearsals.");
            incident.setPriority("High");
            incident.setDateReported(today.minusDays(1));
            incident.setCreatedAt(LocalDateTime.now().minusDays(1).minusHours(2));
            incident.setStatus("Pending");
            incident.setUrgent(true);
            incident.setProofUrls(List.of());
            incident.setRemarksHistory(List.of("Admin: Awaiting technician assignment after initial triage."));
        });

        ensureIncident(incidentRepository, "SC-INC-1002", incident -> {
            incident.setReportedBy("Nimasha Perera");
            incident.setEmail("nimasha.perera@campus.edu");
            incident.setRegistrationNumber("IT22670012");
            incident.setFaculty("Faculty of Engineering");
            incident.setContactNumber("+94 76 555 9012");
            incident.setTitle("Network ports unavailable in Computing Lab");
            incident.setCampus("Malabe Campus");
            incident.setCategory("Network");
            incident.setResource("Advanced Computing Lab");
            incident.setDescription("Several wired network ports in row C are not assigning IP addresses.");
            incident.setPriority("Medium");
            incident.setDateReported(today.minusDays(3));
            incident.setCreatedAt(LocalDateTime.now().minusDays(3).minusHours(4));
            incident.setStatus("IN_PROGRESS");
            incident.setUrgent(false);
            incident.setProofUrls(List.of());
            incident.setAssignedTechnicianId(technicians.itSupport().getId());
            incident.setAssignedTechnicianName(technicians.itSupport().getName());
            incident.setAssignedTechnicianCategory(technicians.itSupport().getCategory());
            incident.setRemarksHistory(List.of(
                    "Admin: Assigned to Lahiru Fernando for switch-port diagnostics.",
                    "Technician: Tested row C ports and identified a faulty patch panel segment."
            ));
        });

        ensureIncident(incidentRepository, "SC-INC-1003", incident -> {
            incident.setReportedBy("John Manager");
            incident.setEmail("john.m@campus.edu");
            incident.setRegistrationNumber("EMP-MGR-004");
            incident.setFaculty("Administration");
            incident.setContactNumber("+94 71 222 3333");
            incident.setTitle("Air conditioning leak in Seminar Room B");
            incident.setCampus("Malabe Campus");
            incident.setCategory("Maintenance");
            incident.setResource("Smart Seminar Room B");
            incident.setDescription("Water was collecting near the front wall after the AC was used for a two-hour session.");
            incident.setPriority("Low");
            incident.setDateReported(today.minusDays(6));
            incident.setCreatedAt(LocalDateTime.now().minusDays(6).minusHours(1));
            incident.setStatus("RESOLVED");
            incident.setUrgent(false);
            incident.setProofUrls(List.of());
            incident.setAssignedTechnicianId(technicians.facilities().getId());
            incident.setAssignedTechnicianName(technicians.facilities().getName());
            incident.setAssignedTechnicianCategory(technicians.facilities().getCategory());
            incident.setRemarksHistory(List.of(
                    "Admin: Assigned to facilities maintenance.",
                    "Technician: Cleared drain line and confirmed normal operation."
            ));
        });

        ensureIncident(incidentRepository, "SC-INC-1004", incident -> {
            incident.setReportedBy("Student One");
            incident.setEmail("student1@campus.edu");
            incident.setRegistrationNumber("IT22566034");
            incident.setFaculty("Faculty of Computing");
            incident.setContactNumber("+94 77 123 4567");
            incident.setTitle("Request to replace personal laptop charger");
            incident.setCampus("Malabe Campus");
            incident.setCategory("General");
            incident.setResource("Student Lounge");
            incident.setDescription("Asked whether campus support can replace a privately owned laptop charger.");
            incident.setPriority("Low");
            incident.setDateReported(today.minusDays(2));
            incident.setCreatedAt(LocalDateTime.now().minusDays(2).minusHours(5));
            incident.setStatus("REJECTED");
            incident.setUrgent(false);
            incident.setProofUrls(List.of());
            incident.setRemarksHistory(List.of("Admin: Rejected because the request is outside campus resource support scope."));
            incident.setRejectionReason("Personal equipment replacement is not covered by the campus maintenance workflow.");
        });
    }

    private Incident ensureIncident(IncidentRepository incidentRepository, String referenceId, Consumer<Incident> seedData) {
        Optional<Incident> existing = incidentRepository.findAll().stream()
                .filter(incident -> referenceId.equalsIgnoreCase(incident.getReferenceId()))
                .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        Incident incident = new Incident();
        incident.setReferenceId(referenceId);
        seedData.accept(incident);
        return incidentRepository.save(incident);
    }

    private void seedNotifications(NotificationRepository notificationRepository, SeedUsers users) {
        ensureNotification(notificationRepository, users.admin().getEmail(),
                "New booking awaiting approval",
                "Orientation workshop setup is waiting for admin review.",
                "BOOKING",
                false);
        ensureNotification(notificationRepository, users.studentTwo().getEmail(),
                "Booking approved",
                "Your AI club hands-on session booking was approved.",
                "BOOKING",
                false);
        ensureNotification(notificationRepository, users.itTechnician().getEmail(),
                "Ticket assigned",
                "Network ports unavailable in Computing Lab has been assigned to you.",
                "TICKET",
                false);
        ensureNotification(notificationRepository, users.studentOne().getEmail(),
                "Incident update",
                "Your projector display incident is awaiting technician assignment.",
                "TICKET",
                true);
    }

    private void ensureNotification(
            NotificationRepository notificationRepository,
            String userId,
            String title,
            String message,
            String type,
            boolean read) {
        boolean exists = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .anyMatch(notification -> title.equals(notification.getTitle()));

        if (exists) {
            return;
        }

        Notification notification = new Notification(userId, title, message, type);
        notification.setRead(read);
        notificationRepository.save(notification);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record SeedUsers(
            User admin,
            User primaryManager,
            User secondaryManager,
            User studentOne,
            User studentTwo,
            User itTechnician,
            User facilitiesTechnician) {
    }

    private record SeedResources(
            Resource auditorium,
            Resource computingLab,
            Resource collaborativeSpace,
            Resource lectureHall,
            Resource seminarRoom) {
    }

    private record SeedTechnicians(
            Technician itSupport,
            Technician facilities,
            Technician electrical) {
    }
}
