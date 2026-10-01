package com.configserver.officerspro.complainandfirservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Service for compressing images before storage.
 * Supports JPEG and PNG formats with configurable quality settings.
 */
@Service
public class ImageCompressionService {

    private static final Logger logger = LoggerFactory.getLogger(ImageCompressionService.class);

    // Compression quality settings (0.0 = lowest quality, 1.0 = highest quality)
    private static final float JPEG_QUALITY = 0.8f;
    private static final float PNG_COMPRESSION = 0.9f;

    // Maximum dimensions for different document types
    private static final int PHOTO_MAX_WIDTH = 800;
    private static final int PHOTO_MAX_HEIGHT = 800;
    private static final int DOCUMENT_MAX_WIDTH = 1200;
    private static final int DOCUMENT_MAX_HEIGHT = 1600;

    /**
     * Compress an uploaded image file.
     * Automatically detects format and applies appropriate compression.
     *
     * @param file The uploaded multipart file
     * @param isDocument true if this is a document (PAN/Aadhaar), false if it's a photo
     * @return Compressed image as byte array
     * @throws IOException if compression fails
     */
    public byte[] compressImage(MultipartFile file, boolean isDocument) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isImageContentType(contentType)) {
            throw new IllegalArgumentException("File must be a valid image (JPEG, PNG)");
        }

        try {
            // Validate that the file is actually readable as an image before processing
            BufferedImage originalImage = validateAndReadImage(file);

            logger.info("Original image size: {}x{}, {} bytes",
                originalImage.getWidth(), originalImage.getHeight(),
                file.getSize());

            // Resize image if needed
            BufferedImage resizedImage = resizeImage(originalImage, isDocument);

            // Compress based on format
            byte[] compressedData = compressBasedOnFormat(resizedImage, contentType);

            logger.info("Compressed image size: {} bytes ({}% reduction)",
                compressedData.length,
                calculateCompressionRatio(file.getSize(), compressedData.length));

            return compressedData;

        } catch (Exception e) {
            logger.error("Error compressing image file: {} (size: {} bytes, content-type: {}) - {}",
                file.getOriginalFilename(), file.getSize(), contentType, e.getMessage());
            throw new IOException("Failed to compress image: " + e.getMessage(), e);
        }
    }

    /**
     * Validates that the uploaded file is actually a readable image.
     * This prevents issues where files claim to be images but aren't valid.
     */
    private BufferedImage validateAndReadImage(MultipartFile file) throws IOException {
        try {
            // First, validate the file's magic bytes to ensure it's actually an image
            if (!isValidImageFile(file)) {
                throw new IOException("File is not a valid image format despite having image content-type");
            }

            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IOException("Unable to read image file - the file may be corrupted or not a valid image format");
            }
            return image;
        } catch (IOException e) {
            // Try to provide more specific error information
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            long fileSize = file.getSize();

            logger.error("Failed to read image file: {} (type: {}, size: {} bytes)",
                fileName, contentType, fileSize);

            // Check if file is too large
            if (fileSize > 10 * 1024 * 1024) { // 10MB
                throw new IOException("Image file is too large (max 10MB allowed)", e);
            }

            // Check for common issues
            if (fileSize < 100) {
                throw new IOException("Image file is too small or empty", e);
            }

            throw new IOException("Unable to read image file - please ensure the file is a valid image (JPEG, PNG)", e);
        }
    }

    /**
     * Validates that a file is actually a valid image by checking its magic bytes.
     * This prevents processing of files that claim to be images but aren't.
     */
    private boolean isValidImageFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return false;
        }

        byte[] header = new byte[12]; // Read first 12 bytes to check magic numbers
        try (var inputStream = file.getInputStream()) {
            int bytesRead = inputStream.read(header);
            if (bytesRead < 8) { // Need at least 8 bytes for most image formats
                return false;
            }
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }

        // Check magic bytes for different image formats
        switch (contentType) {
            case "image/jpeg":
            case "image/jpg":
                // JPEG files start with FF D8 FF
                return header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF;
            case "image/png":
                // PNG files start with 89 50 4E 47
                return header[0] == (byte) 0x89 && header[1] == (byte) 0x50 &&
                       header[2] == (byte) 0x4E && header[3] == (byte) 0x47;
            default:
                return false;
        }
    }

    private boolean isImageContentType(String contentType) {
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png");
    }

    private BufferedImage resizeImage(BufferedImage originalImage, boolean isDocument) {
        int maxWidth = isDocument ? DOCUMENT_MAX_WIDTH : PHOTO_MAX_WIDTH;
        int maxHeight = isDocument ? DOCUMENT_MAX_HEIGHT : PHOTO_MAX_HEIGHT;

        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        // Check if resizing is needed
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return originalImage;
        }

        // Calculate new dimensions maintaining aspect ratio
        double aspectRatio = (double) originalWidth / originalHeight;
        int newWidth, newHeight;

        if (originalWidth > originalHeight) {
            newWidth = Math.min(originalWidth, maxWidth);
            newHeight = (int) (newWidth / aspectRatio);
        } else {
            newHeight = Math.min(originalHeight, maxHeight);
            newWidth = (int) (newHeight * aspectRatio);
        }

        // Ensure dimensions don't exceed maximums after calculation
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = (int) (newWidth / aspectRatio);
        }
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = (int) (newHeight * aspectRatio);
        }

        logger.info("Resizing image from {}x{} to {}x{}",
            originalWidth, originalHeight, newWidth, newHeight);

        return resizeImageTo(originalImage, newWidth, newHeight);
    }

    private BufferedImage resizeImageTo(BufferedImage originalImage, int width, int height) {
        BufferedImage resizedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        resizedImage.getGraphics().drawImage(
            originalImage.getScaledInstance(width, height, java.awt.Image.SCALE_SMOOTH),
            0, 0, null
        );
        return resizedImage;
    }

    private byte[] compressBasedOnFormat(BufferedImage image, String contentType) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        String formatName = getFormatName(contentType);

        if ("jpeg".equalsIgnoreCase(formatName) || "jpg".equalsIgnoreCase(formatName)) {
            // For JPEG, we need to write to output stream first, then compress
            ImageIO.write(image, "JPEG", outputStream);
            return outputStream.toByteArray();
        } else if ("png".equalsIgnoreCase(formatName)) {
            // PNG compression is handled by ImageIO
            ImageIO.write(image, "PNG", outputStream);
            return outputStream.toByteArray();
        }

        throw new IllegalArgumentException("Unsupported image format: " + contentType);
    }

    private String getFormatName(String contentType) {
        if (contentType.equals("image/jpeg") || contentType.equals("image/jpg")) {
            return "jpeg";
        } else if (contentType.equals("image/png")) {
            return "png";
        }
        return "jpeg"; // default
    }

    private int calculateCompressionRatio(long originalSize, long compressedSize) {
        if (originalSize == 0) return 0;
        return (int) (((originalSize - compressedSize) * 100) / originalSize);
    }
}
