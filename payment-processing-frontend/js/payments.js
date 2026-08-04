(function () {
  function filterPayments(filters, payments) {
    return payments.filter(function (payment) {
      if (filters.paymentId && !payment.id.toLowerCase().includes(filters.paymentId.toLowerCase())) {
        return false;
      }
      if (filters.fromAccount && payment.fromAccountId !== filters.fromAccount) {
        return false;
      }
      if (filters.toAccount && payment.toAccountId !== filters.toAccount) {
        return false;
      }
      if (filters.status && filters.status !== "ALL" && payment.status !== filters.status) {
        return false;
      }

      const paymentDate = new Date(payment.createdAt);
      if (filters.fromDate && paymentDate < new Date(filters.fromDate + "T00:00:00")) {
        return false;
      }
      if (filters.toDate && paymentDate > new Date(filters.toDate + "T23:59:59")) {
        return false;
      }
      if (filters.minAmount && payment.amount < Number(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && payment.amount > Number(filters.maxAmount)) {
        return false;
      }

      return true;
    });
  }

  function sortPayments(payments, sortBy, sortDirection) {
    const sorted = payments.slice();
    sorted.sort(function (left, right) {
      let leftValue = left[sortBy];
      let rightValue = right[sortBy];

      if (sortBy === "createdAt") {
        leftValue = new Date(left.createdAt).getTime();
        rightValue = new Date(right.createdAt).getTime();
      }

      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }

  function isRetryAllowed(payment, maxRetryCount) {
    return payment.status === "FAILED" && payment.retryCount < maxRetryCount;
  }

  function isCancellable(payment) {
    return payment.status === "CREATED" || payment.status === "VALIDATED";
  }

  window.PaymentUtils = {
    filterPayments,
    sortPayments,
    isRetryAllowed,
    isCancellable
  };
})();

