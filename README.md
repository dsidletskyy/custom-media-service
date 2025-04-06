# Custom Media Service

A NodeJS application that provides a media management service with AWS S3 integration. This service allows you to upload, retrieve, update, and delete media files stored in AWS S3.

## Features

- Custom HTTP server implementation
- AWS S3 integration for file storage
- Support for common HTTP methods (GET, POST, PUT, DELETE)
- File type validation
- Simple HTML interface for testing
- Error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- AWS account with S3 bucket
- AWS credentials with appropriate permissions

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd custom-media-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
PORT=3000
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Documentation

### Upload File
- **Endpoint:** `/api/media`
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** file
- **Response:** 
  ```json
  {
    "message": "File uploaded successfully",
    "filename": "example.jpg"
  }
  ```

### Get File
- **Endpoint:** `/api/media`
- **Method:** GET
- **Query Parameters:** filename
- **Response:**
  ```json
  {
    "url": "https://s3-signed-url"
  }
  ```

### Update File
- **Endpoint:** `/api/media/update`
- **Method:** PUT
- **Query Parameters:** filename (old filename)
- **Content-Type:** multipart/form-data
- **Body:** file
- **Response:**
  ```json
  {
    "message": "File updated successfully",
    "filename": "new-example.jpg"
  }
  ```

### Delete File
- **Endpoint:** `/api/media/delete`
- **Method:** DELETE
- **Query Parameters:** filename
- **Response:**
  ```json
  {
    "message": "File deleted successfully"
  }
  ```

## Testing

1. Start the server
2. Open `http://localhost:3000` in your browser
3. Use the HTML interface to test the API endpoints

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 400: Bad Request (invalid input)
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error

## File Type Validation

The service supports the following file types:
- Images: jpg, jpeg, png, gif
- Documents: pdf, doc, docx

## Security Considerations

- AWS credentials are stored in environment variables
- CORS is enabled for testing purposes
- File type validation is implemented
- Signed URLs are used for file retrieval

## License

MIT 