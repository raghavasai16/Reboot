# Backend Troubleshooting Guide

## Common 500 Error Causes and Solutions

### 1. **Email Configuration Issues**

**Problem**: Gmail authentication fails
**Solution**: 
- Ensure 2FA is enabled on Gmail account
- Use App Password instead of regular password
- Check if the password `RaghavaTest@16` is an App Password

**To fix Gmail authentication**:
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Update `application.properties` with the new App Password

### 2. **Template Processing Issues**

**Problem**: Thymeleaf template not found
**Solution**:
- Ensure `onboarding-email.html` exists in `src/main/resources/templates/`
- Check template syntax for errors

### 3. **Dependencies Issues**

**Problem**: Missing dependencies
**Solution**:
```bash
mvn clean install
```

### 4. **Port Conflicts**

**Problem**: Port 8080 already in use
**Solution**:
- Change port in `application.properties`
- Or kill process using port 8080

### 5. **CORS Issues**

**Problem**: Frontend can't connect to backend
**Solution**:
- Ensure frontend is running on `http://localhost:5173`
- Check CORS configuration

## Testing Steps

### Step 1: Test Backend Health
```bash
curl http://localhost:8080/api/candidates/health
```
Expected: `{"status":"UP","message":"Candidate API is running"}`

### Step 2: Test Without Email
```bash
curl -X POST http://localhost:8080/api/candidates/test \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "position": "Software Engineer",
    "department": "Engineering"
  }'
```

### Step 3: Check Logs
Look for these log messages:
- `"Received candidate request"`
- `"Processing candidate"`
- `"Email sent successfully"`

## Debug Mode

The application now includes detailed logging. Check the console output for:
- `DEBUG` level logs for email processing
- `INFO` level logs for request processing
- `ERROR` level logs for failures

## Quick Fixes

### If Email is the Issue:
1. Comment out email sending in `EmailService.java`
2. Test the API without email
3. Fix Gmail configuration
4. Re-enable email

### If Template is the Issue:
1. Check `onboarding-email.html` syntax
2. Ensure file is in correct location
3. Restart the application

### If Dependencies are Missing:
```bash
mvn dependency:resolve
mvn clean compile
```

## Common Error Messages

- `"Authentication failed"` → Gmail App Password issue
- `"Template not found"` → Template file missing
- `"Connection refused"` → Backend not running
- `"CORS error"` → Frontend/backend port mismatch

## Emergency Mode

If you need to test without email functionality, use the `/test` endpoint which skips email sending. 