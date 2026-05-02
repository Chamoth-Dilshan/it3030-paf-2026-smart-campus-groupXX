package com.sliit.smartcampus.model;

public enum Role {
    USER,
    STUDENT,
    STAFF,
    ADMIN,
    TECHNICIAN,
    MANAGER;

    public static Role fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role is required.");
        }

        String normalized = value.trim().toUpperCase();
        if ("STUDENT".equals(normalized) || "STAFF".equals(normalized)) {
            return USER;
        }

        return Role.valueOf(normalized);
    }

    public Role canonical() {
        return this == STUDENT || this == STAFF ? USER : this;
    }

    public String apiName() {
        return canonical().name();
    }
}
