package OnBoard_HR.AI.HR.controller;

import OnBoard_HR.AI.HR.entity.Document;
import OnBoard_HR.AI.HR.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {
    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
        @RequestParam("file") MultipartFile file,
        @RequestParam("candidateId") Long candidateId
    ) throws IOException {
        Document doc = documentService.uploadDocument(file, candidateId);
        return ResponseEntity.ok(doc);
    }
} 