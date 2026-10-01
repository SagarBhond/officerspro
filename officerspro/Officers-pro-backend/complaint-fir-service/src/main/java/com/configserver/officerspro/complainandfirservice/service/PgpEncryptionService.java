package com.configserver.officerspro.complainandfirservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.file.Files;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for PGP-like encryption and decryption of files.
 * Uses AES encryption with a system-wide key for simplicity and security.
 */
@Service
public class PgpEncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(PgpEncryptionService.class);

    // Fixed encryption key for the system (in production, this should come from secure config)
    private static final String SYSTEM_ENCRYPTION_KEY = "police_app_encryption_key_2024!@#$%";
    private static final String ALGORITHM = "AES";

    /**
     * Encrypt a file using AES encryption.
     *
     * @param inputFileData The file data to encrypt
     * @return Encrypted file data as byte array
     * @throws Exception if encryption fails
     */
    public byte[] encryptFile(byte[] inputFileData) throws Exception {
        if (inputFileData == null || inputFileData.length == 0) {
            throw new IllegalArgumentException("Input file data cannot be null or empty");
        }

        logger.info("Starting file encryption for {} bytes of data", inputFileData.length);

        try {
            // Generate AES key from system key
            SecretKey secretKey = generateAESKey();

            // Initialize cipher for encryption
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            // Encrypt the data
            byte[] encryptedData = cipher.doFinal(inputFileData);

            logger.info("File encryption completed. Encrypted size: {} bytes", encryptedData.length);
            return encryptedData;

        } catch (Exception e) {
            logger.error("Error during file encryption: {}", e.getMessage());
            throw new Exception("Failed to encrypt file: " + e.getMessage(), e);
        }
    }

    /**
     * Decrypt a file using AES decryption.
     *
     * @param encryptedData The encrypted file data
     * @return Decrypted file data as byte array
     * @throws Exception if decryption fails
     */
    public byte[] decryptFile(byte[] encryptedData) throws Exception {
        if (encryptedData == null || encryptedData.length == 0) {
            throw new IllegalArgumentException("Encrypted data cannot be null or empty");
        }

        logger.info("Starting file decryption for {} bytes of encrypted data", encryptedData.length);

        try {
            // Generate AES key from system key
            SecretKey secretKey = generateAESKey();

            // Initialize cipher for decryption
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            // Decrypt the data
            byte[] decryptedData = cipher.doFinal(encryptedData);

            logger.info("File decryption completed. Decrypted size: {} bytes", decryptedData.length);
            return decryptedData;

        } catch (Exception e) {
            logger.error("Error during file decryption: {}", e.getMessage());
            throw new Exception("Failed to decrypt file: " + e.getMessage(), e);
        }
    }

    /**
     * Encrypt file to a temporary encrypted file.
     * Useful for storing files securely on disk.
     *
     * @param inputFile The input file to encrypt
     * @param outputFile The output encrypted file
     * @throws Exception if encryption fails
     */
    public void encryptFileToDisk(File inputFile, File outputFile) throws Exception {
        try (FileInputStream fis = new FileInputStream(inputFile);
             FileOutputStream fos = new FileOutputStream(outputFile)) {

            SecretKey secretKey = generateAESKey();
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            try (CipherOutputStream cos = new CipherOutputStream(fos, cipher)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    cos.write(buffer, 0, bytesRead);
                }
            }

            logger.info("File encrypted to disk: {} -> {}", inputFile.getName(), outputFile.getName());
        }
    }

    /**
     * Decrypt file from disk.
     *
     * @param encryptedFile The encrypted input file
     * @param outputFile The decrypted output file
     * @throws Exception if decryption fails
     */
    public void decryptFileFromDisk(File encryptedFile, File outputFile) throws Exception {
        try (FileInputStream fis = new FileInputStream(encryptedFile);
             FileOutputStream fos = new FileOutputStream(outputFile)) {

            SecretKey secretKey = generateAESKey();
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            try (CipherInputStream cis = new CipherInputStream(fis, cipher)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = cis.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }

            logger.info("File decrypted from disk: {} -> {}", encryptedFile.getName(), outputFile.getName());
        }
    }

    private SecretKey generateAESKey() throws Exception {
        // Use the system key to generate a consistent AES key
        byte[] keyBytes = SYSTEM_ENCRYPTION_KEY.getBytes("UTF-8");

        // Ensure we have 256 bits (32 bytes) for AES-256
        byte[] aesKeyBytes = new byte[32];
        System.arraycopy(keyBytes, 0, aesKeyBytes, 0, Math.min(keyBytes.length, 32));

        return new SecretKeySpec(aesKeyBytes, ALGORITHM);
    }

    /**
     * Generate a secure random key for additional security.
     * This can be used to create unique encryption keys per file if needed.
     *
     * @return Base64 encoded random key
     */
    public String generateRandomKey() {
        SecureRandom random = new SecureRandom();
        byte[] keyBytes = new byte[32];
        random.nextBytes(keyBytes);
        return Base64.getEncoder().encodeToString(keyBytes);
    }
}
