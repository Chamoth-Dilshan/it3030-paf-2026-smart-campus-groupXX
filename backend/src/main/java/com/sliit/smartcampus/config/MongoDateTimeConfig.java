package com.sliit.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.LocalTime;
import java.util.List;

@Configuration
public class MongoDateTimeConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
                new StringToLocalDateConverter(),
                new LocalDateToStringConverter(),
                new StringToLocalTimeConverter(),
                new LocalTimeToStringConverter()));
    }

    @ReadingConverter
    static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(String source) {
            if (source == null || source.isBlank()) {
                return null;
            }
            if (source.contains("T")) {
                return OffsetDateTime.parse(source).toLocalDate();
            }
            return LocalDate.parse(source);
        }
    }

    @WritingConverter
    static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(LocalDate source) {
            return source == null ? null : source.toString();
        }
    }

    @ReadingConverter
    static class StringToLocalTimeConverter implements Converter<String, LocalTime> {
        @Override
        public LocalTime convert(String source) {
            if (source == null || source.isBlank()) {
                return null;
            }
            if (source.contains("T")) {
                return OffsetDateTime.parse(source).toLocalTime();
            }
            return LocalTime.parse(source);
        }
    }

    @WritingConverter
    static class LocalTimeToStringConverter implements Converter<LocalTime, String> {
        @Override
        public String convert(LocalTime source) {
            return source == null ? null : source.toString();
        }
    }
}
