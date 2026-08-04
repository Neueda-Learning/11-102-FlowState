package com.example.PaymentProcessingSystem.Repository;

import com.example.PaymentProcessingSystem.model.Account;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public class JdbcAccountRepository implements  AccountRepository {
    private final JdbcTemplate jdbc;
    public JdbcAccountRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Account> accountRowMapper = (rs, rowNum) ->
        new Account(
                rs.getLong("account_id"),
                rs.getString("account_number"),
                rs.getString("account_holder_name"),
                rs.getString("email"),
                rs.getString("phone_number"),
                rs.getBigDecimal("balance"),
                rs.getString("currency"),
                rs.getString("status"),
                rs.getInt("version"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        );

    @Override
    public List<Account> findAll() {
        return jdbc.query("SELECT * FROM account", accountRowMapper);
    }

    @Override
    public Optional<Account> findById(Long account_id) {
        List<Account> results = jdbc.query(
                "SELECT * FROM account WHERE account_id = ?",
                accountRowMapper, account_id);
        return results.stream().findFirst();
    }

    @Override
    public Optional<Account> findByAccountNumber(String account_number) {
        List<Account> results = jdbc.query(
                "SELECT * FROM account WHERE account_number = ?",
                accountRowMapper, account_number);
        return results.stream().findFirst();
    }

    @Override
    public Account save(Account account) {
        jdbc.update(
                "INSERT INTO account (account_number, account_holder_name, email, phone_number, balance, currency, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                account.account_number(), account.account_holder_name(), account.email(),
                account.phone_number(), account.balance(), account.currency(), account.status()
        );
        return findByAccountNumber(account.account_number()).orElseThrow();
    }

    @Override
    public Account update(Account account) {
        jdbc.update(
                "UPDATE account SET account_holder_name = ?, email = ?, phone_number = ?, balance = ?, currency = ?, status = ?, version = version + 1 " +
                "WHERE account_id = ?",
                account.account_holder_name(), account.email(), account.phone_number(),
                account.balance(), account.currency(), account.status(), account.account_id()
        );
        return account;
    }

    @Override
    public void updateStatus(Long account_id, String status) {
        jdbc.update(
                "UPDATE account SET status = ?, version = version + 1 WHERE account_id = ?",
                status, account_id
        );
    }
}
