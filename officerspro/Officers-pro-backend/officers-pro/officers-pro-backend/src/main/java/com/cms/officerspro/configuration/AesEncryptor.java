package com.cms.officerspro.configuration;

import jakarta.persistence.AttributeConverter;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.SerializationUtils;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;

@Configuration
@Slf4j
public class AesEncryptor implements AttributeConverter<Object, String> {

    @Value("${aes.encryption.key}")
    private String encryptionKey;

    private final String encryptionCipher = "AES";
    private Key key;
    private Cipher cipher;

    private Key getKey() {
        if (key == null) {
            key = new SecretKeySpec(encryptionKey.getBytes(), encryptionCipher);
        }
        return key;
    }

    private Cipher getCipher() throws Exception {
        if (cipher == null) {
            cipher = Cipher.getInstance(encryptionCipher);
        }
        return cipher;
    }

    private void initCipher(int mode) throws Exception {
        getCipher().init(mode, getKey());
    }

    @SneakyThrows
    @Override
    public String convertToDatabaseColumn(Object attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            initCipher(Cipher.ENCRYPT_MODE);
            byte[] encryptedBytes = getCipher().doFinal(SerializationUtils.serialize(attribute));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("Encryption failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @SneakyThrows
    @Override
    public Object convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            initCipher(Cipher.DECRYPT_MODE);
            byte[] decryptedBytes = getCipher().doFinal(Base64.getDecoder().decode(dbData));
            return SerializationUtils.deserialize(decryptedBytes);
        } catch (Exception e) {
            log.error("Decryption failed: {}", e.getMessage(), e);
            return null;
        }
    }
}
