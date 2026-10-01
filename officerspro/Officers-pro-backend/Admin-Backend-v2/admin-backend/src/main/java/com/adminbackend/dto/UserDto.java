package com.adminbackend.dto;


import com.adminbackend.entity.RefreshToken;
import com.adminbackend.entity.Role;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class UserDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePicture;
    private String token;
    private String refreshToken;
    private Role role;


}
