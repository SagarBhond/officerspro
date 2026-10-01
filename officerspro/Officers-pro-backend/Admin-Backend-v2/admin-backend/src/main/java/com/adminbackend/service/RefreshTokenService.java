package com.adminbackend.service;

import com.adminbackend.entity.RefreshToken;
import com.adminbackend.entity.User;
import com.adminbackend.repository.RefreshTokenRepo;
import com.adminbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    @Autowired
    private UserRepository userRepository;


    public RefreshToken createRefeshToken(String Email){
        User user=userRepository.findByEmail(Email).get();
        Optional<RefreshToken> refreshTokenOptional =refreshTokenRepo.findByUserId(user.getId());
        if(refreshTokenOptional.isPresent()){
            return refreshTokenOptional.get();
        }
        RefreshToken refreshToken=RefreshToken.builder()
                .user(userRepository.findByEmail(Email).get())
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(Duration.ofDays(1).toMillis()))
                .build();
           return refreshTokenRepo.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepo.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token){
        if(token.getExpiryDate().compareTo(Instant.now())<0){
            refreshTokenRepo.delete(token);
            throw new RuntimeException(token.getToken()+"Refresh token was expired.please make a new signin request");
        }
        return token;
    }

    public void deleteRefreshTokenByUserId(Long userId) {
        refreshTokenRepo.deleteById(userId);
    }
}
