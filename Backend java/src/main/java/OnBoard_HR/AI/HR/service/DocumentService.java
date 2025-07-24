package OnBoard_HR.AI.HR.service;

import com.google.cloud.storage.*;
import OnBoard_HR.AI.HR.entity.Document;
import OnBoard_HR.AI.HR.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final Storage storage;

    @Value("${gcp.bucket-name}")
    private String bucketName;

    public DocumentService(DocumentRepository documentRepository, Storage storage) {
        this.documentRepository = documentRepository;
        this.storage = storage;
    }

    public Document uploadDocument(MultipartFile file, Long candidateId) throws IOException {
        String objectName = "documents/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(file.getContentType()).build();
        storage.create(blobInfo, file.getBytes());

        Document doc = new Document();
        doc.setCandidateId(candidateId);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setGcsPath(objectName);
        doc.setUploadTime(LocalDateTime.now());
        doc.setGcsUrl(String.format("https://storage.googleapis.com/%s/%s", bucketName, objectName));
        return documentRepository.save(doc);
    }
} 