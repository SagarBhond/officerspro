package com.adminbackend.mapper;

import com.adminbackend.dto.SignUpDto;
import com.adminbackend.dto.UserDto;
import com.adminbackend.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {


    UserDto mapToUserDto(User user);

    @Mapping(target = "password", ignore = true)
   // @Mapping(target = "createdBy", ignore = true)
    User mapToUser(SignUpDto signUpDto);

    default User map(String id) {
        if (id == null) return null;
        User user = new User();
        user.setId(Long.parseLong(id)); // Or use setUsername() based on logic
        return user;
    }



}
