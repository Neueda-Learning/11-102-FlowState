INSERT IGNORE INTO account (
    account_id,
    account_number,
    account_holder_name,
    email,
    phone_number,
    balance,
    currency,
    status,
    version,
    created_at,
    updated_at
)
VALUES
    (1, 'ACC1001', 'Aarav Mehta', 'aarav.mehta@example.com', '9000000001', 250000.00, 'INR', 'ACTIVE', 0, '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
    (2, 'ACC1002', 'Diya Sharma', 'diya.sharma@example.com', '9000000002', 185000.00, 'INR', 'ACTIVE', 0, '2026-08-01 09:15:00', '2026-08-01 09:15:00'),
    (3, 'ACC1003', 'Ishaan Verma', 'ishaan.verma@example.com', '9000000003', 990000.00, 'INR', 'ACTIVE', 0, '2026-08-01 09:30:00', '2026-08-01 09:30:00'),
    (4, 'ACC1004', 'Mira Nair', 'mira.nair@example.com', '9000000004', 42000.00, 'INR', 'INACTIVE', 0, '2026-08-01 09:45:00', '2026-08-01 09:45:00');

INSERT IGNORE INTO payment (
    payment_id,
    payment_reference,
    source_account_id,
    destination_account_id,
    amount,
    currency,
    status,
    failure_reason,
    retry_count,
    idempotency_key,
    created_at,
    updated_at
)
VALUES
    (1, 'PAYREF-20260802-0001', 1, 2, 15000.00, 'INR', 'COMPLETED', NULL, 0, 'idem-demo-001', '2026-08-02 10:00:00', '2026-08-02 10:05:00'),
    (2, 'PAYREF-20260802-0002', 2, 3, 22000.00, 'INR', 'FAILED', 'BANK_TIMEOUT', 1, 'idem-demo-002', '2026-08-02 11:00:00', '2026-08-02 11:03:00'),
    (3, 'PAYREF-20260802-0003', 3, 4, 5000.00, 'INR', 'SENT', NULL, 0, 'idem-demo-003', '2026-08-02 12:00:00', '2026-08-02 12:02:00');

INSERT IGNORE INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
VALUES
    (1, NULL, 'CREATED', NULL, 'Payment request received', '2026-08-02 10:00:00'),
    (1, 'CREATED', 'VALIDATED', NULL, 'Balance and beneficiary validated', '2026-08-02 10:01:00'),
    (1, 'VALIDATED', 'SENT', NULL, 'Payment sent to bank network', '2026-08-02 10:03:00'),
    (1, 'SENT', 'COMPLETED', NULL, 'Funds transferred successfully', '2026-08-02 10:05:00'),
    (2, NULL, 'CREATED', NULL, 'Payment request received', '2026-08-02 11:00:00'),
    (2, 'CREATED', 'VALIDATED', NULL, 'Payment validation passed', '2026-08-02 11:01:00'),
    (2, 'VALIDATED', 'FAILED', 'BANK_TIMEOUT', 'Downstream bank did not respond in time', '2026-08-02 11:03:00'),
    (3, NULL, 'CREATED', NULL, 'Payment request received', '2026-08-02 12:00:00'),
    (3, 'CREATED', 'VALIDATED', NULL, 'Payment validation passed', '2026-08-02 12:01:00'),
    (3, 'VALIDATED', 'SENT', NULL, 'Payment sent and awaiting confirmation', '2026-08-02 12:02:00');

INSERT IGNORE INTO audit_log (id, aggregate_type, aggregate_id, event_type, message, created_at)
VALUES
    (1, 'ACCOUNT', '1', 'CREATED', 'Seeded demo account ACC1001', '2026-08-01 09:00:00'),
    (2, 'ACCOUNT', '2', 'CREATED', 'Seeded demo account ACC1002', '2026-08-01 09:15:00'),
    (3, 'ACCOUNT', '3', 'CREATED', 'Seeded demo account ACC1003', '2026-08-01 09:30:00'),
    (4, 'ACCOUNT', '4', 'CREATED', 'Seeded demo account ACC1004', '2026-08-01 09:45:00'),
    (5, 'PAYMENT', 'PAYREF-20260802-0001', 'COMPLETED', 'Demo payment completed successfully', '2026-08-02 10:05:00'),
    (6, 'PAYMENT', 'PAYREF-20260802-0002', 'FAILED', 'Demo payment failed due to bank timeout', '2026-08-02 11:03:00'),
    (7, 'PAYMENT', 'PAYREF-20260802-0003', 'SENT', 'Demo payment sent and pending completion callback', '2026-08-02 12:02:00');
