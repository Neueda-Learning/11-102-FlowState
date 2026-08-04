INSERT IGNORE INTO account (id, account_number, balance, created_at)
VALUES (1, 'ACC1001', 250000, '2026-08-01 09:00:00'),
	   (2, 'ACC1002', 185000, '2026-08-01 09:15:00'),
	   (3, 'ACC1003', 990000, '2026-08-01 09:30:00'),
	   (4, 'ACC1004', 42000,  '2026-08-01 09:45:00');

INSERT IGNORE INTO payment (
	id,
	source_account_id,
	destination_account_id,
	amount,
	currency,
	status,
	idempotency_key,
	reference,
	created_at,
	updated_at
)
VALUES ('pay_demo000000000000000001', 1, 2, 15000, 'INR', 'COMPLETED', 'idem-demo-001', 'Invoice settlement - August', '2026-08-02 10:00:00', '2026-08-02 10:05:00'),
	   ('pay_demo000000000000000002', 2, 3, 22000, 'INR', 'FAILED',    'idem-demo-002', 'Vendor payout retry',       '2026-08-02 11:00:00', '2026-08-02 11:03:00'),
	   ('pay_demo000000000000000003', 3, 4, 5000,  'INR', 'SENT',      'idem-demo-003', 'Wallet transfer',           '2026-08-02 12:00:00', '2026-08-02 12:02:00');

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000001', NULL, 'CREATED', NULL, 'Payment request received', '2026-08-02 10:00:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000001' AND new_status = 'CREATED' AND event_timestamp = '2026-08-02 10:00:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000001', 'CREATED', 'VALIDATED', NULL, 'Balance and beneficiary validated', '2026-08-02 10:01:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000001' AND new_status = 'VALIDATED' AND event_timestamp = '2026-08-02 10:01:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000001', 'VALIDATED', 'SENT', NULL, 'Payment sent to bank network', '2026-08-02 10:03:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000001' AND new_status = 'SENT' AND event_timestamp = '2026-08-02 10:03:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000001', 'SENT', 'COMPLETED', NULL, 'Funds transferred successfully', '2026-08-02 10:05:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000001' AND new_status = 'COMPLETED' AND event_timestamp = '2026-08-02 10:05:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000002', NULL, 'CREATED', NULL, 'Payment request received', '2026-08-02 11:00:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000002' AND new_status = 'CREATED' AND event_timestamp = '2026-08-02 11:00:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000002', 'CREATED', 'VALIDATED', NULL, 'Payment validation passed', '2026-08-02 11:01:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000002' AND new_status = 'VALIDATED' AND event_timestamp = '2026-08-02 11:01:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000002', 'VALIDATED', 'FAILED', 'BANK_TIMEOUT', 'Downstream bank did not respond in time', '2026-08-02 11:03:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000002' AND new_status = 'FAILED' AND event_timestamp = '2026-08-02 11:03:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000003', NULL, 'CREATED', NULL, 'Payment request received', '2026-08-02 12:00:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000003' AND new_status = 'CREATED' AND event_timestamp = '2026-08-02 12:00:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000003', 'CREATED', 'VALIDATED', NULL, 'Payment validation passed', '2026-08-02 12:01:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000003' AND new_status = 'VALIDATED' AND event_timestamp = '2026-08-02 12:01:00'
);

INSERT INTO payment_status_history (payment_id, old_status, new_status, error_code, message, event_timestamp)
SELECT 'pay_demo000000000000000003', 'VALIDATED', 'SENT', NULL, 'Payment sent and awaiting confirmation', '2026-08-02 12:02:00'
WHERE NOT EXISTS (
	SELECT 1 FROM payment_status_history
	WHERE payment_id = 'pay_demo000000000000000003' AND new_status = 'SENT' AND event_timestamp = '2026-08-02 12:02:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'ACCOUNT', '1', 'CREATED', 'Seeded demo account ACC1001', '2026-08-01 09:00:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'ACCOUNT' AND aggregate_id = '1' AND event_type = 'CREATED' AND created_at = '2026-08-01 09:00:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'ACCOUNT', '2', 'CREATED', 'Seeded demo account ACC1002', '2026-08-01 09:15:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'ACCOUNT' AND aggregate_id = '2' AND event_type = 'CREATED' AND created_at = '2026-08-01 09:15:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'ACCOUNT', '3', 'CREATED', 'Seeded demo account ACC1003', '2026-08-01 09:30:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'ACCOUNT' AND aggregate_id = '3' AND event_type = 'CREATED' AND created_at = '2026-08-01 09:30:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'ACCOUNT', '4', 'CREATED', 'Seeded demo account ACC1004', '2026-08-01 09:45:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'ACCOUNT' AND aggregate_id = '4' AND event_type = 'CREATED' AND created_at = '2026-08-01 09:45:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'PAYMENT', 'pay_demo000000000000000001', 'COMPLETED', 'Demo payment completed successfully', '2026-08-02 10:05:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'PAYMENT' AND aggregate_id = 'pay_demo000000000000000001' AND event_type = 'COMPLETED' AND created_at = '2026-08-02 10:05:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'PAYMENT', 'pay_demo000000000000000002', 'FAILED', 'Demo payment failed due to bank timeout', '2026-08-02 11:03:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'PAYMENT' AND aggregate_id = 'pay_demo000000000000000002' AND event_type = 'FAILED' AND created_at = '2026-08-02 11:03:00'
);

INSERT INTO audit_log (aggregate_type, aggregate_id, event_type, message, created_at)
SELECT 'PAYMENT', 'pay_demo000000000000000003', 'SENT', 'Demo payment sent and pending completion callback', '2026-08-02 12:02:00'
WHERE NOT EXISTS (
	SELECT 1 FROM audit_log
	WHERE aggregate_type = 'PAYMENT' AND aggregate_id = 'pay_demo000000000000000003' AND event_type = 'SENT' AND created_at = '2026-08-02 12:02:00'
);
