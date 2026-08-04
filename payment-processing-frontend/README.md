# Payment Processing Frontend

Static HTML/CSS/Vanilla JavaScript frontend prototype for an internal Payment Processing Management System.

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript

## Project Structure
- `login.html`, `dashboard.html`, `accounts.html`, `account-details.html`
- `create-payment.html`, `payments.html`, `failed-payments.html`
- `payment-details.html`, `payment-result.html`, `audit-logs.html`
- `css/styles.css`, `css/responsive.css`
- `js/mock-data.js`, `js/validation.js`, `js/payments.js`, `js/app.js`

## Run Locally
Open `index.html` in your browser, or open `login.html` directly.

## Spring Boot Integration Readiness
Current UI behavior reads data from `js/mock-data.js`. Replace data access in `js/app.js` with REST calls later:
- `GET /api/accounts`
- `GET /api/accounts/{id}`
- `GET /api/payments`
- `GET /api/payments/{id}`
- `POST /api/payments`
- `POST /api/payments/{id}/retry`
- `POST /api/payments/{id}/cancel`
- `GET /api/audit-logs`

