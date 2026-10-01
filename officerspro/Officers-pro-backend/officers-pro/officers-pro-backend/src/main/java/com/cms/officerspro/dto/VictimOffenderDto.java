package com.cms.officerspro.dto;

import com.cms.officerspro.configuration.AesEncryptor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VictimOffenderDto {

    private String victimId;
    private String victimName;
    private String firNo;
    private String caseStatus;
    private String created_on;
    private String offenderName;
    private String sectionId;
    private String shortDescription;
    private String officerId;

    public void decryptEncryptedAttributes(AesEncryptor aesEncryptor) {
        if (victimName != null) {
            victimName = (String) aesEncryptor.convertToEntityAttribute(victimName);
        }
        if (offenderName != null) {
            String[] encryptedNames = offenderName.split(", ");
            List<String> decryptedNamesList = new ArrayList<>();
            for (int i = 0; i < encryptedNames.length; i++) {
                String decryptedName = (String) aesEncryptor.convertToEntityAttribute(encryptedNames[i]); // Decrypt each encrypted name
                decryptedNamesList.add(decryptedName); // Add decrypted name to the list
            }
            offenderName = String.join(", ", decryptedNamesList); // Join decrypted names without brackets
        }

        if (firNo != null) {
            firNo = (String) aesEncryptor.convertToEntityAttribute(firNo);
        }

        if(sectionId != null){
            String[] encryptedIds = sectionId.split(", ");
            List<String> decryptedIdsList = new ArrayList<>();
            for (int i = 0; i < encryptedIds.length; i++) {
                String decryptedId = (String) aesEncryptor.convertToEntityAttribute(encryptedIds[i]); // Decrypt each encrypted name
                decryptedIdsList.add(decryptedId); // Add decrypted name to the list
            }
            sectionId = String.join(", ", decryptedIdsList); // Join decrypted names without brackets
        }

        if(shortDescription != null){
            shortDescription=(String) aesEncryptor.convertToEntityAttribute(shortDescription);
        }

    }

}


