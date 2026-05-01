package com.sliit.smartcampus.model;

public enum Role {
    USER,
    STUDENT,
    ADMIN,
    TECHNICIAN,
    MANAGER;

    public static Role fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role is required.");
        }

        String normalized = value.trim().toUpperCase();
        if ("STUDENT".equals(normalized)) {
            return USER;
        }

        return Role.valueOf(normalized);
    }

    public Role canonical() {
        return this == STUDENT ? USER : this;
    }

    public String apiName() {
        return canonical().name();
    }
}
