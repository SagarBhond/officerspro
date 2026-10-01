package com.adminbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user profile.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    private String firstName;       // ✅ Editable first name
    private String lastName;        // ✅ Editable last name
    private String mobile;          // ✅ Editable mobile number
    private String profilePicture;  // ✅ Base64 string or image URL
}
