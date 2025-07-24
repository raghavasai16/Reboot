package OnBoard_HR.AI.HR.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {
    @Test
    void testAddCorsMappings() {
        CorsConfig config = new CorsConfig();
        CorsRegistry registry = new CorsRegistry();
        assertDoesNotThrow(() -> config.addCorsMappings(registry));
    }

    @Test
    void testCorsConfigurationSource() {
        CorsConfig config = new CorsConfig();
        CorsConfigurationSource source = config.corsConfigurationSource();
        assertNotNull(source);
    }
} 