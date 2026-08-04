(function () {
  function isRequired(value) {
	return value !== null && value !== undefined && String(value).trim() !== "";
  }

  function isPositiveNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0;
  }

  function accountsDiffer(fromAccountId, toAccountId) {
	return fromAccountId !== toAccountId;
  }

  function hasSufficientBalance(amount, balance) {
	return Number(amount) <= Number(balance);
  }

  function showFieldError(fieldId, message) {
	const container = document.querySelector("[data-error-for='" + fieldId + "']");
	if (!container) {
	  return;
	}

	container.textContent = message || "";
  }

  function clearFormErrors(formElement) {
	const messages = formElement.querySelectorAll(".field-error");
	messages.forEach(function (node) {
	  node.textContent = "";
	});
  }

  window.Validation = {
	isRequired,
	isPositiveNumber,
	accountsDiffer,
	hasSufficientBalance,
	showFieldError,
	clearFormErrors
  };
})();

