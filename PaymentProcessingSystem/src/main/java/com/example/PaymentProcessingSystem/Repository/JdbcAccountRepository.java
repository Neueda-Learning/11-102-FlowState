package com.example.PaymentProcessingSystem.Repository;

import com.example.PaymentProcessingSystem.model.Account;
import com.example.PaymentProcessingSystem.model.AuditRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JdbcAccountRepository implements AccountRepository {
    private final JdbcTemplate jdbc;

    public JdbcAccountRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Account> accountRowMapper = (rs, rowNum) ->
            new Account(
                    rs.getLong("id"),
                    rs.getString("account_number"),
                    rs.getLong("balance"),
                    rs.getTimestamp("created_at").toLocalDateTime()
            );

    private final RowMapper<AuditRecord> auditRowMapper = (rs, rowNum) ->
            new AuditRecord(
                    rs.getLong("id"),
                    rs.getString("aggregate_type"),
                    rs.getString("aggregate_id"),
                    rs.getString("event_type"),
                    rs.getString("message"),
                    rs.getTimestamp("created_at").toLocalDateTime()
            );

    @Override
    public List<Account> findAll() {
        return jdbc.query("SELECT id, account_number, balance, created_at FROM account", accountRowMapper);
    }

    @Override
    public Optional<Account> findById(Long account_id) {
        List<Account> results = jdbc.query(
                "SELECT id, account_number, balance, created_at FROM account WHERE id = ?",
                accountRowMapper,
                account_id
        );
        return results.stream().findFirst();
    }

    @Override
    public Optional<Account> findByAccountNumber(String account_number) {
        List<Account> results = jdbc.query(
                "SELECT id, account_number, balance, created_at FROM account WHERE account_number = ?",
                accountRowMapper,
                account_number
        );
        return results.stream().findFirst();
    }

    @Override
    public Account save(Account account) {
        jdbc.update(
                "INSERT INTO account (account_number, balance) VALUES (?, ?)",
                account.account_number(),
                account.balance()
        );
        Account saved = findByAccountNumber(account.account_number()).orElseThrow();
        insertAudit("ACCOUNT", String.valueOf(saved.id()), "CREATED", "Account created");
        return saved;
    }

    @Override
    public Account update(Account account) {
        jdbc.update(
                "UPDATE account SET account_number = ?, balance = ? WHERE id = ?",
                account.account_number(),
                account.balance(),
                account.id()
        );
        insertAudit("ACCOUNT", String.valueOf(account.id()), "UPDATED", "Account details updated");
        return findById(account.id()).orElseThrow();
    }

    @Override
    public List<AuditRecord> findAuditByAccountId(Long account_id) {
        return jdbc.query(
                "SELECT id, aggregate_type, aggregate_id, event_type, message, created_at FROM audit_log WHERE aggregate_type = ? AND aggregate_id = ? ORDER BY created_at DESC",
                auditRowMapper,
                "ACCOUNT",
                String.valueOf(account_id)
        );
    }

    private void insertAudit(String aggregateType, String aggregateId, String eventType, String message) {
        jdbc.update(
                "INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message) VALUES (?, ?, ?, ?)",
                aggregateType,
                aggregateId,
                eventType,
                message
        );
    }
}
