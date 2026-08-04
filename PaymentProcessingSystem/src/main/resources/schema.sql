CREATE TABLE IF NOT EXISTS account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(64) NOT NULL UNIQUE,
    balance BIGINT NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment (
    id VARCHAR(40) PRIMARY KEY,
    source_account_id BIGINT NOT NULL,
    destination_account_id BIGINT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency ENUM('INR') NOT NULL DEFAULT 'INR',
    status ENUM('CREATED','VALIDATED','SENT','COMPLETED','FAILED') NOT NULL DEFAULT 'CREATED',
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    reference VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_id_prefix CHECK (id LIKE 'pay_%'),
    FOREIGN KEY (source_account_id) REFERENCES account(id),
    FOREIGN KEY (destination_account_id) REFERENCES account(id)
);

CREATE TABLE IF NOT EXISTS payment_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(40) NOT NULL,
    old_status ENUM('CREATED','VALIDATED','SENT','COMPLETED','FAILED'),
    new_status ENUM('CREATED','VALIDATED','SENT','COMPLETED','FAILED') NOT NULL,
    error_code VARCHAR(64),
    message VARCHAR(255),
    event_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payment(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_type VARCHAR(32) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    message VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

