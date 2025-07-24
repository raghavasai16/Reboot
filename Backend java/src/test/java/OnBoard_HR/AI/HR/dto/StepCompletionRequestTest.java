package OnBoard_HR.AI.HR.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StepCompletionRequestTest {
    @Test
    void testGettersAndSetters() {
        StepCompletionRequest s = new StepCompletionRequest();
        s.setEmail("john@example.com");
        s.setStep("forms");
        assertEquals("john@example.com", s.getEmail());
        assertEquals("forms", s.getStep());
    }
} 