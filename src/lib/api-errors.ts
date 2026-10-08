/** Map Nest/BudPay messages into copy a customer can act on. */
export function friendlyApiMessage(raw: string, status = 0): string {
  const message = raw.trim();
  if (
    /unauthorized access/i.test(message) ||
    /live payout api is refusing/i.test(message) ||
    /payment network refused/i.test(message)
  ) {
    return 'We couldn’t send this transfer. The payment network refused the payout — this is not your PIN. Please try again later.';
  }
  if (/^unauthorized$/i.test(message)) {
    return 'Your session expired. Sign in again.';
  }
  if (/invalid credentials/i.test(message)) {
    return 'That email, phone or password is not right.';
  }
  if (/invalid otp/i.test(message)) {
    return 'That code is not right. Request a new one if it expired.';
  }
  if (/invalid authenticator/i.test(message)) {
    return 'That authenticator code is not right. Try the next code from the app.';
  }
  if (/incorrect transaction pin|current pin is incorrect/i.test(message)) {
    return 'That PIN is not right. Use the 6-digit PIN you set at sign-up.';
  }
  if (/insufficient funds/i.test(message)) {
    return 'There isn’t enough money in this account.';
  }
  if (/merchant wallet/i.test(message)) {
    return 'We can’t complete transfers just now. Please try again shortly.';
  }
  if (/budpay is unreachable|payment network is unavailable/i.test(message)) {
    return 'The payment network is unavailable. Try again in a moment.';
  }
  if (/could not send the verification email/i.test(message)) {
    return 'We couldn’t send the verification email. Try again shortly.';
  }
  if (/request failed \(\d+\)/i.test(message)) {
    if (status >= 500) return 'Something went wrong on our side. Try again in a moment.';
    return 'That request didn’t go through. Try again.';
  }
  return message;
}
