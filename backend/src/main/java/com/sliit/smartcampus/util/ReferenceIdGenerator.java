package com.sliit.smartcampus.util;

import java.security.SecureRandom;

public final class ReferenceIdGenerator {
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private ReferenceIdGenerator() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String generate() {
        return String.format("%s-%04d-%s", randomLetters(4), RANDOM.nextInt(10_000), randomLetters(4));
    }

    private static String randomLetters(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            builder.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return builder.toString();
    }
}
