CREATE TABLE IF NOT EXISTS account (
    account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_holder_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    source_account_id BIGINT NOT NULL,
    destination_account_id BIGINT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL CHECK (amount > 0.00),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status ENUM('CREATED','VALIDATED','SENT','COMPLETED','FAILED') NOT NULL DEFAULT 'CREATED',
    failure_reason VARCHAR(255),
    retry_count INT NOT NULL DEFAULT 0,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (source_account_id) REFERENCES account(account_id),
    FOREIGN KEY (destination_account_id) REFERENCES account(account_id)
);

CREATE TABLE IF NOT EXISTS payment_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    old_status ENUM('CREATED','VALIDATED','SENT','COMPLETED','FAILED'),
    new_status ENUM('CREATED','VALIDATED','SENT','COMPLETED','FAILED') NOT NULL,
    error_code VARCHAR(64),
    message VARCHAR(255),
    event_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payment_history_event UNIQUE (payment_id, new_status, event_timestamp),
    FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_type VARCHAR(32) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    message VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

