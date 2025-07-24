# HR Onboarding Backend

This is the backend service for the HR Onboarding system that handles candidate management and email notifications.

## Features

- **Email Integration**: Sends attractive onboarding emails using Thymeleaf templates
- **REST API**: Provides endpoints for candidate management
- **CORS Support**: Configured for frontend integration
- **Gmail SMTP**: Uses Gmail for sending emails

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Gmail account with App Password enabled

### Configuration

1. **Email Configuration**: The application is configured to use Gmail SMTP
   - Email: `batchusaimanoj@gmail.com`
   - Password: `RaghavaTest@16`
   - SMTP Host: `smtp.gmail.com`
   - Port: `587`

2. **CORS Configuration**: Configured to allow requests from `http://localhost:5173`

### Running the Application

1. **Navigate to the backend directory**:
   ```bash
   cd "Backend java"
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Verify the application is running**:
   - Health check: `http://localhost:8080/api/candidates/health`
   - Should return: `{"status":"UP","message":"Candidate API is running"}`

### API Endpoints

#### POST `/api/candidates/add`
Adds a new candidate and sends onboarding email.

**Request Body**:
```json
{
  "firstName": "Veera",
  "lastName": "Raghava",
  "email": "veera.raghava@example.com",
  "position": "Software Engineer",
  "department": "Engineering",
  "startDate": "2024-03-01"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Candidate added successfully and onboarding email sent!",
  "candidateName": "Veera Raghava",
  "email": "veera.raghava@example.com",
  "position": "Software Engineer",
  "department": "Engineering"
}
```

#### GET `/api/candidates/health`
Health check endpoint.

**Response**:
```json
{
  "status": "UP",
  "message": "Candidate API is running"
}
```

### Email Template

The application uses a beautiful HTML email template located at:
`src/main/resources/templates/onboarding-email.html`

The template includes:
- Congratulations message
- Onboarding process overview
- Login URL: `http://localhost:5173/`
- Company branding and contact information

### Troubleshooting

1. **Email not sending**: 
   - Check Gmail App Password is correctly set
   - Ensure 2FA is enabled on Gmail account
   - Check firewall settings

2. **CORS errors**:
   - Ensure frontend is running on `http://localhost:5173`
   - Check CORS configuration in `CorsConfig.java`

3. **Port conflicts**:
   - Default port is 8080
   - Change in `application.properties` if needed

### Integration with Frontend

The frontend React application will automatically:
- Check backend connection status
- Send candidate data when HR adds a new candidate
- Display success/error notifications
- Show backend connection indicator

### Development

- **Main Application**: `AiHrApplication.java`
- **Controller**: `CandidateController.java`
- **Service**: `EmailService.java`
- **DTO**: `CandidateRequest.java`
- **Config**: `CorsConfig.java`
- **Template**: `onboarding-email.html` 

## Payroll Service Setup

### 1. Database Migration
- Run the SQL script in `src/main/resources/payroll_table.sql` on your MySQL or GCP Cloud SQL instance to create the `payroll` table.

### 2. Local Development
- Configure your `application.properties`:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/your_db
  spring.datasource.username=your_user
  spring.datasource.password=your_password
  spring.jpa.hibernate.ddl-auto=update
  spring.jpa.show-sql=true
  ```

### 3. GCP Deployment
- Add the Cloud SQL Socket Factory dependency (see `pom.xml`).
- Configure your `application.properties` for GCP:
  ```properties
  spring.datasource.url=jdbc:mysql:///<DB_NAME>?cloudSqlInstance=<INSTANCE_CONNECTION_NAME>&socketFactory=com.google.cloud.sql.mysql.SocketFactory
  spring.datasource.username=<GCP_USER>
  spring.datasource.password=<GCP_PASSWORD>
  spring.jpa.hibernate.ddl-auto=update
  ```
- Replace placeholders with your Cloud SQL instance details.

### 4. Endpoints
- `POST /api/payroll/process` — Process a payroll record
- `GET /api/payroll/candidate/{candidateId}` — List payrolls for a candidate
- `GET /api/payroll` — List all payrolls

### 5. Notes
- Use environment variables or secret manager for production DB credentials.
- The service is designed for easy migration between local and GCP environments. 