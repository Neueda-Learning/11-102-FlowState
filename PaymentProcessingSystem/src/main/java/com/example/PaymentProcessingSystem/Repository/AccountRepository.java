package com.example.PaymentProcessingSystem.Repository;

import com.example.PaymentProcessingSystem.model.Account;

import java.util.List;
import java.util.Optional;

public interface AccountRepository {
    List<Account> findAll();
    Optional<Account> findById(Long account_id);
    Optional<Account> findByAccountNumber(String account_number);
    Account save(Account account);
    Account update(Account account);
    void updateStatus(Long account_id, String status);
}
