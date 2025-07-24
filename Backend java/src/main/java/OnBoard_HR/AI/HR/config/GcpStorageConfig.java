package OnBoard_HR.AI.HR.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class GcpStorageConfig {
    @Value("${gcp.credentials.location}")
    private String credentialsPath;

    @Value("${gcp.project-id:your-gcp-project-id}")
    private String projectId;

    @Bean
    public Storage storage() throws IOException {
        if (credentialsPath.startsWith("classpath:")) {
            String resourcePath = credentialsPath.replace("classpath:", "");
            return StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(GoogleCredentials.fromStream(new ClassPathResource(resourcePath).getInputStream()))
                .build()
                .getService();
        } else {
            return StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(GoogleCredentials.fromStream(new FileInputStream(credentialsPath)))
                .build()
                .getService();
        }
    }
} 