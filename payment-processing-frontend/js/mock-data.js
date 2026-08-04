(function () {
  const accounts = [
    { id: "ACC001", holderName: "Lavitha", balance: 10000, status: "ACTIVE", createdDate: "2026-08-01" },
    { id: "ACC002", holderName: "Rahul Menon", balance: 18500, status: "ACTIVE", createdDate: "2026-07-20" },
    { id: "ACC003", holderName: "Ananya Singh", balance: 6200, status: "INACTIVE", createdDate: "2026-06-12" },
    { id: "ACC004", holderName: "Karthik Reddy", balance: 25500, status: "ACTIVE", createdDate: "2026-08-01" }
  ];

  const payments = [
    {
      id: "PAY1001",
      fromAccountId: "ACC001",
      toAccountId: "ACC002",
      amount: 2000,
      description: "Vendor settlement",
      status: "COMPLETED",
      retryCount: 0,
      failureReason: "",
      createdAt: "2026-08-01T10:30:01",
      lastUpdated: "2026-08-01T10:30:06",
      statusHistory: [
        { timestamp: "2026-08-01T10:30:01", previousStatus: "-", newStatus: "CREATED", message: "Payment created" },
        { timestamp: "2026-08-01T10:30:02", previousStatus: "CREATED", newStatus: "VALIDATED", message: "Validation successful" },
        { timestamp: "2026-08-01T10:30:03", previousStatus: "VALIDATED", newStatus: "PROCESSING", message: "Processing started" },
        { timestamp: "2026-08-01T10:30:06", previousStatus: "PROCESSING", newStatus: "COMPLETED", message: "Payment successful" }
      ]
    },
    {
      id: "PAY1002",
      fromAccountId: "ACC003",
      toAccountId: "ACC001",
      amount: 5000,
      description: "Subscription payout",
      status: "FAILED",
      retryCount: 2,
      failureReason: "Core banking timeout",
      createdAt: "2026-08-01T10:31:01",
      lastUpdated: "2026-08-01T10:31:29",
      statusHistory: [
        { timestamp: "2026-08-01T10:31:01", previousStatus: "-", newStatus: "CREATED", message: "Payment created" },
        { timestamp: "2026-08-01T10:31:03", previousStatus: "CREATED", newStatus: "VALIDATED", message: "Validation successful" },
        { timestamp: "2026-08-01T10:31:05", previousStatus: "VALIDATED", newStatus: "PROCESSING", message: "Processing started" },
        { timestamp: "2026-08-01T10:31:08", previousStatus: "PROCESSING", newStatus: "FAILED", message: "Simulated processing failure" },
        { timestamp: "2026-08-01T10:31:20", previousStatus: "FAILED", newStatus: "RETRY", message: "Retry requested" },
        { timestamp: "2026-08-01T10:31:22", previousStatus: "RETRY", newStatus: "PROCESSING", message: "Retry processing started" },
        { timestamp: "2026-08-01T10:31:29", previousStatus: "PROCESSING", newStatus: "FAILED", message: "Retry attempt failed" }
      ]
    },
    {
      id: "PAY1003",
      fromAccountId: "ACC002",
      toAccountId: "ACC004",
      amount: 1500,
      description: "Training material fee",
      status: "PROCESSING",
      retryCount: 0,
      failureReason: "",
      createdAt: "2026-08-01T12:14:00",
      lastUpdated: "2026-08-01T12:14:12",
      statusHistory: [
        { timestamp: "2026-08-01T12:14:00", previousStatus: "-", newStatus: "CREATED", message: "Payment created" },
        { timestamp: "2026-08-01T12:14:05", previousStatus: "CREATED", newStatus: "VALIDATED", message: "Validation successful" },
        { timestamp: "2026-08-01T12:14:12", previousStatus: "VALIDATED", newStatus: "PROCESSING", message: "Processing started" }
      ]
    },
    {
      id: "PAY1004",
      fromAccountId: "ACC004",
      toAccountId: "ACC001",
      amount: 4000,
      description: "Reimbursement",
      status: "CANCELLED",
      retryCount: 0,
      failureReason: "",
      createdAt: "2026-08-02T09:08:00",
      lastUpdated: "2026-08-02T09:10:00",
      statusHistory: [
        { timestamp: "2026-08-02T09:08:00", previousStatus: "-", newStatus: "CREATED", message: "Payment created" },
        { timestamp: "2026-08-02T09:08:04", previousStatus: "CREATED", newStatus: "VALIDATED", message: "Validation successful" },
        { timestamp: "2026-08-02T09:10:00", previousStatus: "VALIDATED", newStatus: "CANCELLED", message: "Payment cancelled by user" }
      ]
    },
    {
      id: "PAY1005",
      fromAccountId: "ACC001",
      toAccountId: "ACC004",
      amount: 8200,
      description: "Monthly transfer",
      status: "VALIDATED",
      retryCount: 0,
      failureReason: "",
      createdAt: "2026-08-03T09:45:00",
      lastUpdated: "2026-08-03T09:45:09",
      statusHistory: [
        { timestamp: "2026-08-03T09:45:00", previousStatus: "-", newStatus: "CREATED", message: "Payment created" },
        { timestamp: "2026-08-03T09:45:09", previousStatus: "CREATED", newStatus: "VALIDATED", message: "Validation successful" }
      ]
    }
  ];

  const auditLogs = [
    { id: "AUD001", timestamp: "2026-08-01T10:30:00", user: "USER01", action: "PAYMENT_CREATED", paymentId: "PAY1001", details: "Payment created for INR 2,000" },
    { id: "AUD002", timestamp: "2026-08-01T10:31:00", user: "SYSTEM", action: "PAYMENT_VALIDATED", paymentId: "PAY1001", details: "Payment validation successful" },
    { id: "AUD003", timestamp: "2026-08-01T10:32:00", user: "USER01", action: "PAYMENT_RETRIED", paymentId: "PAY1002", details: "Failed payment retry requested" },
    { id: "AUD004", timestamp: "2026-08-02T09:10:00", user: "USER02", action: "PAYMENT_CANCELLED", paymentId: "PAY1004", details: "Payment cancelled by user" },
    { id: "AUD005", timestamp: "2026-08-03T09:45:00", user: "USER01", action: "PAYMENT_CREATED", paymentId: "PAY1005", details: "Payment created for INR 8,200" }
  ];

  window.MockData = {
    currentUser: "USER01",
    maxRetryCount: 3,
    accounts,
    payments,
    auditLogs
  };
})();

