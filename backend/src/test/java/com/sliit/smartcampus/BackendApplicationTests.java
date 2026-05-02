package com.sliit.smartcampus;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "app.seed.enabled=false",
        "spring.data.mongodb.auto-index-creation=false",
        "spring.mongodb.uri=mongodb://localhost:27017/smartcampus-test"
})
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }

}
