package com.example.PaymentProcessingSystem.model;

import java.time.LocalDateTime;

public record Account(
        Long id,
        String account_number,
        Long balance,
        LocalDateTime created_at
        ) {
}
