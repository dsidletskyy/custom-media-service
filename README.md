# Custom Media Service

A NodeJS-based media service for handling file operations with AWS S3 integration.

## Features
- Custom HTTP server (no Express.js)
- File upload, retrieval, update, and deletion
- AWS S3 integration with pre-signed URLs
- File type validation and size limits (up to 33MB)
- Support for images (JPG, PNG, GIF), documents (PDF, DOC, DOCX), and media files (MP3, MP4)

## Prerequisites
- Node.js (v14 or higher)
- AWS Account (free tier is sufficient)
- Git

## AWS Setup Guide

### 1. Create an S3 Bucket
1. Go to [AWS Console](https://console.aws.amazon.com/) → S3
2. Click "Create bucket"
3. Enter a unique bucket name (e.g., "your-media-service-bucket")
4. Choose a region (remember this for later)
5. Under "Block Public Access settings":
   - Keep all blocks enabled (✓)
   - We use pre-signed URLs for secure access
6. Click "Create bucket"

### 2. Create an IAM User
1. Go to AWS Console → IAM
2. Click "Users" → "Create user"
3. Enter a name (e.g., "media-service-user")
4. Click "Next"
5. Select "Attach policies directly"
6. Click "Create Policy"
7. Choose JSON and paste this policy (replace `your-bucket-name`):
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject",
                   "s3:ListBucket"
               ],
               "Resource": [
                   "arn:aws:s3:::your-bucket-name",
                   "arn:aws:s3:::your-bucket-name/*"
               ]
           }
       ]
   }
   ```
8. Name the policy (e.g., "media-service-s3-access")
9. Attach this policy to your user
10. Click "Next" and "Create user"
11. **Important**: After creation, click on the user
12. Go to "Security credentials" tab
13. Create access key (choose "Local code" option)
14. **Save the Access Key ID and Secret Access Key**

### 3. Application Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd custom-media-service-bucket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your AWS credentials:
   ```
   PORT=3000
   AWS_REGION=your-region-name      # e.g., eu-north-1
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_BUCKET_NAME=your-bucket-name
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Testing the API

### Using Postman
Import the provided Postman collection (`media-service.postman_collection.json`):

1. **Upload File** (POST `/api/media`)
   - Use form-data
   - Key: `file`
   - Value: Select a file (max 33MB)

2. **Get File** (GET `/api/media?filename=`)
   - Add the filename from upload response
   - Returns a pre-signed URL (valid for 1 hour)

3. **Update File** (PUT `/api/media/update?filename=`)
   - Use form-data
   - Key: `file`
   - Add filename parameter

4. **Delete File** (DELETE `/api/media/delete?filename=`)
   - Add filename parameter

### Using Web Interface
1. Open `http://localhost:3000`
2. Use the provided HTML forms to test all operations

## File Restrictions
- Maximum file size: 33MB
- Allowed file types:
  - Images: .jpg, .png, .gif
  - Documents: .pdf, .doc, .docx
  - Media: .mp3, .mp4

## Security Notes
- S3 bucket remains private
- Files are accessed via pre-signed URLs
- URLs expire after 1 hour
- Each operation requires proper AWS credentials
- File types and sizes are validated

## Troubleshooting

### Common Issues
1. "Access Denied" errors:
   - Verify IAM policy is correctly attached
   - Check bucket name in .env matches exactly
   - Ensure region is correct

2. "File too large" error:
   - Files must be under 33MB

3. "Invalid file type" error:
   - Check allowed file extensions above

### AWS Costs
- Free tier includes:
  - 5GB S3 storage
  - 20,000 GET requests
  - 2,000 PUT requests
  - Sufficient for testing

## Documentation

The project uses JSDoc for generating comprehensive API documentation. The documentation includes detailed information about services, controllers, and routes.

### Generating Documentation

To generate the documentation, run:

```bash
npm run docs
```

This will create a `docs` directory containing the generated documentation.

### Viewing Documentation

1. Open the `docs/index.html` file in your web browser
2. Navigate through the documentation using the sidebar menu
3. Documentation is organized into sections:
   - Services (UploadService, S3Service, LoggerService)
   - Controllers (MediaController)
   - Routers (Router)

### Documentation Structure

The documentation includes:

- **Services**
  - `UploadService`: Handles file uploads with size limits and type validation
  - `S3Service`: Manages S3 bucket operations and file storage
  - `LoggerService`: Provides structured logging functionality

- **Controllers**
  - `MediaController`: Handles media-related HTTP requests

- **Routers**
  - `Router`: Defines API routes and their handlers

## License
MIT