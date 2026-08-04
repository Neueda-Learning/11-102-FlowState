package com.example.PaymentProcessingSystem.Repository;

import com.example.PaymentProcessingSystem.model.Account;
import com.example.PaymentProcessingSystem.model.AuditRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
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
                    rs.getLong("account_id"),
                    rs.getString("account_number"),
                    rs.getString("account_holder_name"),
                    rs.getString("email"),
                    rs.getString("phone_number"),
                    rs.getBigDecimal("balance"),
                    rs.getString("currency"),
                    rs.getString("status"),
                    rs.getInt("version"),
                    toLocalDateTime(rs.getTimestamp("created_at")),
                    toLocalDateTime(rs.getTimestamp("updated_at"))
            );

    private final RowMapper<AuditRecord> auditRowMapper = (rs, rowNum) ->
            new AuditRecord(
                    rs.getLong("id"),
                    rs.getString("aggregate_type"),
                    rs.getString("aggregate_id"),
                    rs.getString("event_type"),
                    rs.getString("message"),
                    toLocalDateTime(rs.getTimestamp("created_at"))
            );

    @Override
    public List<Account> findAll() {
        return jdbc.query("SELECT account_id, account_number, account_holder_name, email, phone_number, balance, currency, status, version, created_at, updated_at FROM account", accountRowMapper);
    }

    @Override
    public Optional<Account> findById(Long account_id) {
        List<Account> results = jdbc.query(
                "SELECT account_id, account_number, account_holder_name, email, phone_number, balance, currency, status, version, created_at, updated_at FROM account WHERE account_id = ?",
                accountRowMapper,
                account_id
        );
        return results.stream().findFirst();
    }

    @Override
    public Optional<Account> findByAccountNumber(String account_number) {
        List<Account> results = jdbc.query(
                "SELECT account_id, account_number, account_holder_name, email, phone_number, balance, currency, status, version, created_at, updated_at FROM account WHERE account_number = ?",
                accountRowMapper,
                account_number
        );
        return results.stream().findFirst();
    }

    @Override
    public Account save(Account account) {
        jdbc.update(
                "INSERT INTO account (account_number, account_holder_name, email, phone_number, balance, currency, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                account.account_number(),
                account.account_holder_name(),
                account.email(),
                account.phone_number(),
                account.balance(),
                account.currency() == null ? "INR" : account.currency(),
                account.status() == null ? "ACTIVE" : account.status()
        );
        Account saved = findByAccountNumber(account.account_number()).orElseThrow();
        insertAudit("ACCOUNT", String.valueOf(saved.account_id()), "CREATED", "Account created");
        return saved;
    }

    @Override
    public Account update(Account account) {
        jdbc.update(
                "UPDATE account SET account_number = ?, account_holder_name = ?, email = ?, phone_number = ?, balance = ?, currency = ?, status = ?, version = version + 1 WHERE account_id = ?",
                account.account_number(),
                account.account_holder_name(),
                account.email(),
                account.phone_number(),
                account.balance(),
                account.currency(),
                account.status(),
                account.account_id()
        );
        insertAudit("ACCOUNT", String.valueOf(account.account_id()), "UPDATED", "Account details updated");
        return findById(account.account_id()).orElseThrow();
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

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
