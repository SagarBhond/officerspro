package com.adminbackend.repository;

import com.adminbackend.entity.RefreshToken;
import com.adminbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken,Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserId(Long userId);

    @Modifying
    @Query(value = "delete from refresh_token where user_id = :userId",nativeQuery = true)
    void deleteByUserId(Long userId);
}
