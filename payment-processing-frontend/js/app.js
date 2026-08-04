(function () {
  const pageName = document.body.getAttribute("data-page") || "";
  const storageKeys = {
    paymentResult: "pps.paymentResult"
  };

  const DataService = {
    getAccounts: function () {
      return MockData.accounts.slice();
    },
    getAccountById: function (accountId) {
      return MockData.accounts.find(function (account) {
        return account.id === accountId;
      });
    },
    getPayments: function () {
      return MockData.payments.slice();
    },
    getPaymentById: function (paymentId) {
      return MockData.payments.find(function (payment) {
        return payment.id === paymentId;
      });
    },
    getAuditLogs: function () {
      return MockData.auditLogs.slice();
    }
  };

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function formatDate(isoDateTime) {
    const date = new Date(isoDateTime);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  function formatDateOnly(isoDateTime) {
    const date = new Date(isoDateTime);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatAmount(amount) {
    return "INR " + Number(amount).toLocaleString("en-IN");
  }

  function badgeClass(status) {
    return "badge badge-" + String(status || "").toLowerCase();
  }

  function setActiveNavigation() {
    const links = document.querySelectorAll(".sidebar-link[data-nav]");
    links.forEach(function (link) {
      if (link.getAttribute("data-nav") === pageName) {
        link.classList.add("active");
      }
    });
  }

  function attachLogout() {
    const logoutLink = document.getElementById("logoutLink");
    if (!logoutLink) {
      return;
    }

    logoutLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "login.html";
    });
  }

  function showBanner(type, message) {
    const host = document.getElementById("messageHost");
    if (!host) {
      return;
    }
    host.className = "alert alert-" + type;
    host.textContent = message;
    host.classList.remove("hidden");
  }

  function hideBanner() {
    const host = document.getElementById("messageHost");
    if (host) {
      host.classList.add("hidden");
      host.textContent = "";
    }
  }

  function renderPaymentRows(tableBody, payments) {
    tableBody.innerHTML = "";

    payments.forEach(function (payment) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + payment.id + "</td>" +
        "<td>" + payment.fromAccountId + "</td>" +
        "<td>" + payment.toAccountId + "</td>" +
        "<td>" + formatAmount(payment.amount) + "</td>" +
        "<td>" + formatDateOnly(payment.createdAt) + "</td>" +
        "<td><span class='" + badgeClass(payment.status) + "'>" + payment.status + "</span></td>" +
        "<td>" + payment.retryCount + "</td>" +
        "<td>" + renderActionButtons(payment) + "</td>";

      tableBody.appendChild(row);
    });
  }

  function renderActionButtons(payment) {
    const view = "<a class='btn btn-link' href='payment-details.html?id=" + payment.id + "'>View</a>";
    if (payment.status === "FAILED") {
      return view + " <button class='btn btn-link' data-retry='" + payment.id + "'>Retry</button>";
    }
    if (PaymentUtils.isCancellable(payment)) {
      return view + " <button class='btn btn-link' data-cancel='" + payment.id + "'>Cancel</button>";
    }
    return view;
  }

  function populateAccountSelects(selectElements) {
    const accounts = DataService.getAccounts();
    selectElements.forEach(function (select) {
      if (!select) {
        return;
      }
      accounts.forEach(function (account) {
        const option = document.createElement("option");
        option.value = account.id;
        option.textContent = account.id + " - " + account.holderName;
        select.appendChild(option);
      });
    });
  }

  function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideBanner();
      Validation.clearFormErrors(form);

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      let valid = true;

      if (!Validation.isRequired(username)) {
        Validation.showFieldError("username", "Username is required.");
        valid = false;
      }

      if (!Validation.isRequired(password)) {
        Validation.showFieldError("password", "Password is required.");
        valid = false;
      }

      if (!valid) {
        showBanner("error", "Please correct the validation errors.");
        return;
      }

      window.location.href = "dashboard.html";
    });
  }

  function initDashboardPage() {
    const accounts = DataService.getAccounts();
    const payments = DataService.getPayments();

    document.getElementById("totalAccounts").textContent = String(accounts.length);
    document.getElementById("totalPayments").textContent = String(payments.length);
    document.getElementById("successfulPayments").textContent = String(payments.filter(function (item) { return item.status === "COMPLETED"; }).length);
    document.getElementById("failedPayments").textContent = String(payments.filter(function (item) { return item.status === "FAILED"; }).length);
    document.getElementById("processingPayments").textContent = String(payments.filter(function (item) { return item.status === "PROCESSING"; }).length);

    const recent = payments.slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 5);

    const tbody = document.getElementById("recentPaymentsBody");
    tbody.innerHTML = "";
    recent.forEach(function (payment) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + payment.id + "</td>" +
        "<td>" + payment.fromAccountId + "</td>" +
        "<td>" + payment.toAccountId + "</td>" +
        "<td>" + formatAmount(payment.amount) + "</td>" +
        "<td>" + formatDateOnly(payment.createdAt) + "</td>" +
        "<td><span class='" + badgeClass(payment.status) + "'>" + payment.status + "</span></td>" +
        "<td><a class='btn btn-link' href='payment-details.html?id=" + payment.id + "'>View</a></td>";
      tbody.appendChild(row);
    });
  }

  function initAccountsPage() {
    const searchInput = document.getElementById("accountSearch");
    const statusFilter = document.getElementById("accountStatusFilter");
    const tbody = document.getElementById("accountsBody");

    function render() {
      const term = searchInput.value.trim().toLowerCase();
      const status = statusFilter.value;
      const filtered = DataService.getAccounts().filter(function (account) {
        const matchesTerm = !term || account.id.toLowerCase().includes(term) || account.holderName.toLowerCase().includes(term);
        const matchesStatus = status === "ALL" || account.status === status;
        return matchesTerm && matchesStatus;
      });

      tbody.innerHTML = "";
      filtered.forEach(function (account) {
        const row = document.createElement("tr");
        row.innerHTML =
          "<td>" + account.id + "</td>" +
          "<td>" + account.holderName + "</td>" +
          "<td>" + formatAmount(account.balance) + "</td>" +
          "<td><span class='badge badge-" + account.status.toLowerCase() + "'>" + account.status + "</span></td>" +
          "<td>" + formatDateOnly(account.createdDate) + "</td>" +
          "<td><a class='btn btn-link' href='account-details.html?id=" + account.id + "'>View</a></td>";
        tbody.appendChild(row);
      });
    }

    searchInput.addEventListener("input", render);
    statusFilter.addEventListener("change", render);
    render();
  }

  function initAccountDetailsPage() {
    const accountId = getQueryParam("id") || "ACC001";
    const account = DataService.getAccountById(accountId);
    if (!account) {
      showBanner("error", "Account not found.");
      return;
    }

    document.getElementById("accountId").textContent = account.id;
    document.getElementById("accountHolder").textContent = account.holderName;
    document.getElementById("accountBalance").textContent = formatAmount(account.balance);
    document.getElementById("accountStatus").innerHTML = "<span class='" + badgeClass(account.status) + "'>" + account.status + "</span>";
    document.getElementById("accountCreatedDate").textContent = formatDateOnly(account.createdDate);

    const history = DataService.getPayments().filter(function (payment) {
      return payment.fromAccountId === account.id || payment.toAccountId === account.id;
    });

    const tbody = document.getElementById("accountTransactionsBody");
    tbody.innerHTML = "";

    history.forEach(function (payment) {
      const isDebit = payment.fromAccountId === account.id;
      const otherAccount = isDebit ? payment.toAccountId : payment.fromAccountId;
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + payment.id + "</td>" +
        "<td>" + (isDebit ? "DEBIT" : "CREDIT") + "</td>" +
        "<td>" + otherAccount + "</td>" +
        "<td>" + formatAmount(payment.amount) + "</td>" +
        "<td>" + formatDateOnly(payment.createdAt) + "</td>" +
        "<td><span class='" + badgeClass(payment.status) + "'>" + payment.status + "</span></td>" +
        "<td><a class='btn btn-link' href='payment-details.html?id=" + payment.id + "'>View Payment</a></td>";
      tbody.appendChild(row);
    });
  }

  function initCreatePaymentPage() {
    const form = document.getElementById("createPaymentForm");
    if (!form) {
      return;
    }

    const fromSelect = document.getElementById("fromAccount");
    const toSelect = document.getElementById("toAccount");
    const amountInput = document.getElementById("amount");
    const balanceLabel = document.getElementById("availableBalance");

    populateAccountSelects([fromSelect, toSelect]);

    function currentFromBalance() {
      const selected = DataService.getAccountById(fromSelect.value);
      return selected ? selected.balance : 0;
    }

    fromSelect.addEventListener("change", function () {
      const balance = currentFromBalance();
      balanceLabel.textContent = fromSelect.value ? formatAmount(balance) : "-";
    });

    const modal = document.getElementById("confirmModal");
    const confirmButton = document.getElementById("confirmPaymentBtn");

    function openModal(summary) {
      document.getElementById("confirmFrom").textContent = summary.from;
      document.getElementById("confirmTo").textContent = summary.to;
      document.getElementById("confirmAmount").textContent = summary.amount;
      document.getElementById("confirmDescription").textContent = summary.description || "-";
      modal.classList.remove("hidden");
    }

    function closeModal() {
      modal.classList.add("hidden");
    }

    document.getElementById("closeConfirmModal").addEventListener("click", closeModal);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideBanner();
      Validation.clearFormErrors(form);

      const from = fromSelect.value;
      const to = toSelect.value;
      const amount = amountInput.value;
      const description = document.getElementById("description").value;
      let valid = true;

      if (!Validation.isRequired(from)) {
        Validation.showFieldError("fromAccount", "From Account is required.");
        valid = false;
      }
      if (!Validation.isRequired(to)) {
        Validation.showFieldError("toAccount", "To Account is required.");
        valid = false;
      }
      if (!Validation.isPositiveNumber(amount)) {
        Validation.showFieldError("amount", "Amount must be greater than zero.");
        valid = false;
      }
      if (Validation.isRequired(from) && Validation.isRequired(to) && !Validation.accountsDiffer(from, to)) {
        Validation.showFieldError("toAccount", "From and To accounts cannot be the same.");
        showBanner("warning", "This payment request has already been processed.");
        valid = false;
      }
      if (Validation.isPositiveNumber(amount) && !Validation.hasSufficientBalance(amount, currentFromBalance())) {
        Validation.showFieldError("amount", "Insufficient account balance.");
        showBanner("warning", "Insufficient account balance.");
        valid = false;
      }

      if (!valid) {
        return;
      }

      openModal({
        from: from,
        to: to,
        amount: formatAmount(amount),
        description: description
      });
    });

    confirmButton.addEventListener("click", function () {
      const paymentId = "PAY" + String(Math.floor(Math.random() * 9000) + 1000);
      const fail = Math.random() < 0.4;
      const result = {
        id: paymentId,
        fromAccountId: fromSelect.value,
        toAccountId: toSelect.value,
        amount: Number(amountInput.value),
        description: document.getElementById("description").value,
        status: fail ? "FAILED" : "COMPLETED",
        failureReason: fail ? "Simulated processing failure" : "",
        retryCount: fail ? 1 : 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      window.localStorage.setItem(storageKeys.paymentResult, JSON.stringify(result));
      closeModal();
      window.location.href = "payment-result.html?id=" + result.id;
    });
  }

  function initPaymentResultPage() {
    const fromStorage = window.localStorage.getItem(storageKeys.paymentResult);
    const result = fromStorage ? JSON.parse(fromStorage) : null;

    if (!result) {
      showBanner("warning", "No recent payment result found.");
      return;
    }

    document.getElementById("resultTitle").textContent = result.status === "COMPLETED" ? "Payment Successful" : "Payment Failed";
    document.getElementById("resultMessage").textContent = result.status === "COMPLETED" ? "Payment completed successfully." : "Payment processing failed.";
    document.getElementById("resultMessage").className = "alert " + (result.status === "COMPLETED" ? "alert-success" : "alert-error");

    document.getElementById("resPaymentId").textContent = result.id;
    document.getElementById("resFrom").textContent = result.fromAccountId;
    document.getElementById("resTo").textContent = result.toAccountId;
    document.getElementById("resAmount").textContent = formatAmount(result.amount);
    document.getElementById("resStatus").innerHTML = "<span class='" + badgeClass(result.status) + "'>" + result.status + "</span>";
    document.getElementById("resDate").textContent = formatDate(result.createdAt);
    document.getElementById("resRetryCount").textContent = String(result.retryCount || 0);

    const failureRow = document.getElementById("failureReasonRow");
    if (result.status === "FAILED") {
      failureRow.classList.remove("hidden");
      document.getElementById("resFailure").textContent = result.failureReason || "Unknown error";
      document.getElementById("failedActions").classList.remove("hidden");
      document.getElementById("successActions").classList.add("hidden");
    } else {
      failureRow.classList.add("hidden");
      document.getElementById("failedActions").classList.add("hidden");
      document.getElementById("successActions").classList.remove("hidden");
    }

    const viewLinks = document.querySelectorAll("[data-view-payment]");
    viewLinks.forEach(function (link) {
      link.setAttribute("href", "payment-details.html?id=" + result.id);
    });
  }

  function initPaymentsPage() {
    const form = document.getElementById("paymentsFilterForm");
    if (!form) {
      return;
    }

    const fromSelect = document.getElementById("filterFromAccount");
    const toSelect = document.getElementById("filterToAccount");
    const statusSelect = document.getElementById("filterStatus");
    populateAccountSelects([fromSelect, toSelect]);

    let currentSortBy = "createdAt";
    let currentSortDirection = "desc";

    function collectFilters() {
      return {
        paymentId: document.getElementById("filterPaymentId").value.trim(),
        fromAccount: fromSelect.value,
        toAccount: toSelect.value,
        status: statusSelect.value,
        fromDate: document.getElementById("filterFromDate").value,
        toDate: document.getElementById("filterToDate").value,
        minAmount: document.getElementById("filterMinAmount").value,
        maxAmount: document.getElementById("filterMaxAmount").value
      };
    }

    function render() {
      const filters = collectFilters();
      const filtered = PaymentUtils.filterPayments(filters, DataService.getPayments());
      const sorted = PaymentUtils.sortPayments(filtered, currentSortBy, currentSortDirection);
      renderPaymentRows(document.getElementById("paymentsBody"), sorted);
      attachPaymentTableActions();
    }

    function toggleSort(newSortBy) {
      if (currentSortBy === newSortBy) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortBy = newSortBy;
        currentSortDirection = "asc";
      }
      render();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    document.getElementById("clearPaymentFilters").addEventListener("click", function () {
      form.reset();
      render();
    });

    document.querySelectorAll("[data-sort-by]").forEach(function (th) {
      th.addEventListener("click", function () {
        toggleSort(th.getAttribute("data-sort-by"));
      });
    });

    render();
  }

  function attachPaymentTableActions() {
    document.querySelectorAll("button[data-retry]").forEach(function (button) {
      button.addEventListener("click", function () {
        showBanner("info", "Retry request submitted for " + button.getAttribute("data-retry") + " (mock). ");
      });
    });

    document.querySelectorAll("button[data-cancel]").forEach(function (button) {
      button.addEventListener("click", function () {
        showBanner("warning", "Payment has been cancelled.");
        button.setAttribute("disabled", "disabled");
      });
    });
  }

  function initFailedPaymentsPage() {
    const payments = DataService.getPayments().filter(function (payment) {
      return payment.status === "FAILED";
    });

    const tbody = document.getElementById("failedPaymentsBody");
    tbody.innerHTML = "";

    payments.forEach(function (payment) {
      const retryAllowed = PaymentUtils.isRetryAllowed(payment, MockData.maxRetryCount);
      const retryButton = retryAllowed
        ? "<button class='btn btn-secondary' data-retry='" + payment.id + "'>Retry</button>"
        : "<button class='btn btn-secondary' disabled>Retry</button><div class='field-error'>Maximum retries reached</div>";

      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + payment.id + "</td>" +
        "<td>" + payment.fromAccountId + "</td>" +
        "<td>" + payment.toAccountId + "</td>" +
        "<td>" + formatAmount(payment.amount) + "</td>" +
        "<td>" + (payment.failureReason || "-") + "</td>" +
        "<td>" + payment.retryCount + " / " + MockData.maxRetryCount + "</td>" +
        "<td>" + formatDate(payment.lastUpdated) + "</td>" +
        "<td><a class='btn btn-link' href='payment-details.html?id=" + payment.id + "'>View Details</a> " + retryButton + "</td>";

      tbody.appendChild(row);
    });

    attachPaymentTableActions();
  }

  function initPaymentDetailsPage() {
    const paymentId = getQueryParam("id");
    let payment = paymentId ? DataService.getPaymentById(paymentId) : null;

    if (!payment) {
      const fromStorage = window.localStorage.getItem(storageKeys.paymentResult);
      if (fromStorage) {
        payment = JSON.parse(fromStorage);
        payment.statusHistory = [
          { timestamp: payment.createdAt, previousStatus: "-", newStatus: "CREATED", message: "Payment created" },
          { timestamp: payment.createdAt, previousStatus: "CREATED", newStatus: "VALIDATED", message: "Validation successful" },
          {
            timestamp: payment.lastUpdated,
            previousStatus: "VALIDATED",
            newStatus: payment.status === "FAILED" ? "FAILED" : "COMPLETED",
            message: payment.status === "FAILED" ? "Simulated processing failure" : "Payment successful"
          }
        ];
      }
    }

    if (!payment) {
      showBanner("error", "Payment details not found.");
      return;
    }

    document.getElementById("pId").textContent = payment.id;
    document.getElementById("pFrom").textContent = payment.fromAccountId;
    document.getElementById("pTo").textContent = payment.toAccountId;
    document.getElementById("pAmount").textContent = formatAmount(payment.amount);
    document.getElementById("pDescription").textContent = payment.description || "-";
    document.getElementById("pStatus").innerHTML = "<span class='" + badgeClass(payment.status) + "'>" + payment.status + "</span>";
    document.getElementById("pCreated").textContent = formatDate(payment.createdAt);
    document.getElementById("pUpdated").textContent = formatDate(payment.lastUpdated);
    document.getElementById("pRetry").textContent = String(payment.retryCount || 0);
    document.getElementById("pFailure").textContent = payment.failureReason || "-";

    const lifecycleContainer = document.getElementById("lifecycleTimeline");
    lifecycleContainer.innerHTML = "";
    payment.statusHistory.forEach(function (entry) {
      const step = document.createElement("div");
      const dotClass = entry.newStatus === "FAILED" ? "failed" : "done";
      step.className = "timeline-step";
      step.innerHTML =
        "<div class='timeline-dot " + dotClass + "'></div>" +
        "<div><strong>" + entry.newStatus + "</strong><div class='stat-label'>" + entry.message + "</div></div>";
      lifecycleContainer.appendChild(step);
    });

    const statusBody = document.getElementById("statusHistoryBody");
    statusBody.innerHTML = "";
    payment.statusHistory.forEach(function (entry) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + formatDate(entry.timestamp) + "</td>" +
        "<td>" + entry.previousStatus + "</td>" +
        "<td>" + entry.newStatus + "</td>" +
        "<td>" + entry.message + "</td>";
      statusBody.appendChild(row);
    });

    const actions = document.getElementById("paymentDetailsActions");
    actions.innerHTML = "";

    if (PaymentUtils.isRetryAllowed(payment, MockData.maxRetryCount)) {
      const retryBtn = document.createElement("button");
      retryBtn.className = "btn btn-secondary";
      retryBtn.textContent = "Retry Payment";
      retryBtn.addEventListener("click", function () {
        showBanner("warning", "The account balance changed while this payment was being processed. Please refresh and try again.");
      });
      actions.appendChild(retryBtn);
    }

    if (PaymentUtils.isCancellable(payment)) {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-danger";
      cancelBtn.textContent = "Cancel Payment";
      cancelBtn.addEventListener("click", function () {
        showBanner("warning", "Payment has been cancelled.");
      });
      actions.appendChild(cancelBtn);
    }
  }

  function initAuditLogsPage() {
    const form = document.getElementById("auditFilterForm");
    if (!form) {
      return;
    }

    function render() {
      const user = document.getElementById("auditUser").value.trim().toLowerCase();
      const action = document.getElementById("auditAction").value.trim().toLowerCase();
      const paymentId = document.getElementById("auditPaymentId").value.trim().toLowerCase();
      const fromDate = document.getElementById("auditFromDate").value;
      const toDate = document.getElementById("auditToDate").value;

      const filtered = DataService.getAuditLogs().filter(function (log) {
        if (user && !log.user.toLowerCase().includes(user)) {
          return false;
        }
        if (action && !log.action.toLowerCase().includes(action)) {
          return false;
        }
        if (paymentId && !log.paymentId.toLowerCase().includes(paymentId)) {
          return false;
        }

        const logDate = new Date(log.timestamp);
        if (fromDate && logDate < new Date(fromDate + "T00:00:00")) {
          return false;
        }
        if (toDate && logDate > new Date(toDate + "T23:59:59")) {
          return false;
        }

        return true;
      });

      const tbody = document.getElementById("auditLogsBody");
      tbody.innerHTML = "";

      filtered.forEach(function (log) {
        const row = document.createElement("tr");
        row.innerHTML =
          "<td>" + log.id + "</td>" +
          "<td>" + formatDate(log.timestamp) + "</td>" +
          "<td>" + log.user + "</td>" +
          "<td>" + log.action + "</td>" +
          "<td>" + log.paymentId + "</td>" +
          "<td>" + log.details + "</td>";
        tbody.appendChild(row);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    document.getElementById("clearAuditFilters").addEventListener("click", function () {
      form.reset();
      render();
    });

    render();
  }

  function initPage() {
    setActiveNavigation();
    attachLogout();

    switch (pageName) {
      case "login":
        initLoginPage();
        break;
      case "dashboard":
        initDashboardPage();
        break;
      case "accounts":
        initAccountsPage();
        break;
      case "account-details":
        initAccountDetailsPage();
        break;
      case "create-payment":
        initCreatePaymentPage();
        break;
      case "payment-result":
        initPaymentResultPage();
        break;
      case "payments":
        initPaymentsPage();
        break;
      case "failed-payments":
        initFailedPaymentsPage();
        break;
      case "payment-details":
        initPaymentDetailsPage();
        break;
      case "audit-logs":
        initAuditLogsPage();
        break;
      default:
        break;
    }
  }

  document.addEventListener("DOMContentLoaded", initPage);
})();

