package OnBoard_HR.AI.HR.controller;

import OnBoard_HR.AI.HR.entity.Candidate;
import OnBoard_HR.AI.HR.entity.User;
import OnBoard_HR.AI.HR.repository.CandidateRepository;
import OnBoard_HR.AI.HR.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        Map<String, Object> response = new HashMap<>();

        User user = userRepository.findByEmail(email);

        if (user == null || !user.getPassword().equals(password)) {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        }

        response.put("success", true);
        response.put("role", user.getRole());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("email", user.getEmail());

        // If candidate, get candidateId from candidates table
        if ("candidate".equals(user.getRole())) {
            Candidate candidate = candidateRepository.findByEmail(user.getEmail());
            if (candidate != null) {
                response.put("id", candidate.getId()); // <-- This is the candidate's id!
            }
        }
        if ("hr".equals(user.getRole()) || "admin".equals(user.getRole())) {
            response.put("id", user.getId()); // For profile/audit only, not for onboarding actions
        }

        // For HR/admin, you can use user.getId() or whatever is appropriate

        return ResponseEntity.ok(response);
    }
//    @PostMapping("/login")
//    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
//        String email = loginRequest.get("email");
//        String password = loginRequest.get("password");
//        Map<String, Object> response = new HashMap<>();
//
//        User user = userRepository.findByEmail(email);
//
//        if (user == null || !user.getPassword().equals(password)) {
//            response.put("success", false);
//            response.put("message", "Invalid email or password");
//            return ResponseEntity.status(401).body(response);
//        }
//
//        response.put("success", true);
//        response.put("role", user.getRole());
//        response.put("firstName", user.getFirstName());
//        response.put("lastName", user.getLastName());
//        response.put("email", user.getEmail());
//        // Add more user info as needed
//
//        return ResponseEntity.ok(response);
//    }
} 