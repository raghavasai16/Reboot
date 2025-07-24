package OnBoard_HR.AI.HR;

import OnBoard_HR.AI.HR.controller.BgvCheckController;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class BgvCheckControllerTest {
    @Test
    void testGetAllChecks() {
        BgvCheckController controller = new BgvCheckController();
        ResponseEntity<List<Map<String, Object>>> resp = controller.getAllChecks();
        assertEquals(5, resp.getBody().size());
        assertEquals(200, resp.getStatusCodeValue());
        assertTrue(resp.getBody().get(0).containsKey("checkName"));
    }
} 