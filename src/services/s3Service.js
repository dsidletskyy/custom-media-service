const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/**
 * Service for interacting with AWS S3 storage
 * Handles file uploads, retrievals, and deletions
 * 
 * @class S3Service
 */
class S3Service {
    /**
     * Creates a new S3Service instance
     * 
     * @param {Object} config - Configuration object for S3 client
     * @param {string} config.region - AWS region (e.g., 'us-east-1')
     * @param {string} config.accessKeyId - AWS access key ID
     * @param {string} config.secretAccessKey - AWS secret access key
     * @param {string} config.bucketName - Name of the S3 bucket
     */
    constructor(config) {
        this.client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
        this.bucketName = config.bucketName;
    }

    /**
     * Uploads a file to S3
     * 
     * @param {string} key - The key (path) where the file will be stored in S3
     * @param {Buffer} buffer - The file content as a buffer
     * @param {string} contentType - The MIME type of the file
     * @returns {Promise<void>}
     * @throws {Error} If the upload fails
     */
    async uploadFile(key, buffer, contentType) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType
        });

        await this.client.send(command);
    }

    /**
     * Generates a signed URL for accessing a file from S3
     * The URL is valid for 1 hour (3600 seconds)
     * 
     * @param {string} key - The key (path) of the file in S3
     * @returns {Promise<string>} A signed URL that can be used to access the file
     * @throws {Error} If the signed URL generation fails
     */
    async getSignedUrl(key) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    }

    /**
     * Deletes a file from S3
     * 
     * @param {string} key - The key (path) of the file to delete in S3
     * @returns {Promise<void>}
     * @throws {Error} If the deletion fails
     */
    async deleteFile(key) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        await this.client.send(command);
    }
}

module.exports = S3Service; 