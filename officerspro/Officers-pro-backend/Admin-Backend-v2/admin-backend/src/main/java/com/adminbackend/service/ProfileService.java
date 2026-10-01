package com.adminbackend.service;

import com.adminbackend.dto.UpdateProfileRequest;

public interface ProfileService {
    Object getProfile();
    void updateProfile(String email, UpdateProfileRequest request); // ✅ Added this
}
