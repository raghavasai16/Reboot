package OnBoard_HR.AI.HR.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/bgv")
@CrossOrigin(origins = "http://localhost:5173")
public class BgvCheckController {
    @GetMapping("/checks")
    public ResponseEntity<List<Map<String, Object>>> getAllChecks() {
        List<Map<String, Object>> checks = new ArrayList<>();
        String[] checkNames = {
            "Identity Verification",
            "Employment History",
            "Education Verification",
            "Criminal Background Check",
            "Reference Check"
        };
        for (String name : checkNames) {
            Map<String, Object> check = new HashMap<>();
            check.put("checkName", name);
            check.put("status", "completed");
            check.put("progress", 100);
            check.put("completedAt", java.time.LocalDateTime.now());
            checks.add(check);
        }
        return ResponseEntity.ok(checks);
    }
} 