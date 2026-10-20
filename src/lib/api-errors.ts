/** Map API messages into copy a customer can act on. */
export function friendlyApiMessage(raw: string, status = 0, path = ''): string {
  const message = raw.trim();
  const bills = /\/bills\//i.test(path);
  if (
    /unauthorized access/i.test(message) ||
    /live payout api is refusing/i.test(message) ||
    /payment network refused/i.test(message)
  ) {
    return networkRefusalCopy(path);
  }
  if (/rejected the payout hmac/i.test(message) || /invalid signature|intrusion detected/i.test(message)) {
    return bills
      ? 'The payment network rejected this bill payment. Try again in a moment.'
      : 'The payment network rejected this transfer. Try again in a moment.';
  }
  if (/^unauthorized$/i.test(message)) {
    return 'Your session expired. Sign in again.';
  }
  if (/invalid credentials/i.test(message)) {
    return 'That email, phone or password is not right.';
  }
  if (/email already registered/i.test(message)) {
    return 'This email already has an account. Log in instead.';
  }
  if (/phone already registered/i.test(message)) {
    return 'This phone number is already on a RoyalBlue account. Log in instead.';
  }
  if (/email verification expired/i.test(message)) {
    return 'Your email code expired. Enter a new one from your inbox to finish opening the account.';
  }
  if (
    status === 429 ||
    /too many requests|too many incorrect codes|wait a few minutes before requesting/i.test(message)
  ) {
    if (/incorrect codes/i.test(message)) {
      return 'Too many incorrect codes. Request a new one.';
    }
    if (/wait a few minutes/i.test(message)) {
      return 'Wait a few minutes before requesting another code.';
    }
    return 'Too many attempts. Wait a moment and try again.';
  }
  if (/invalid otp/i.test(message)) {
    if (/\/auth\/complete/i.test(path)) {
      return 'Your email code expired. Enter a new one from your inbox to finish opening the account.';
    }
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
  if (/bvn is already (linked|registered)/i.test(message)) {
    return 'This BVN is already linked to another RoyalBlue account. Sign in to that account to raise limits.';
  }
  if (/nin is already (linked|registered)/i.test(message)) {
    return 'This NIN is already linked to another RoyalBlue account. Sign in to that account to raise limits.';
  }
  if (/merchant wallet/i.test(message)) {
    return 'We can’t complete payments just now. Please try again shortly.';
  }
  if (/budpay is unreachable|payment network is unavailable/i.test(message)) {
    return 'The payment network is unavailable. Try again in a moment.';
  }
  if (/identity checks are unavailable/i.test(message) || /live selfie/i.test(message)) {
    return message;
  }
  if (/dojah|smile id|budpay/i.test(message)) {
    return status >= 500
      ? 'We couldn’t confirm your identity just now. Try again in a moment.'
      : 'We couldn’t confirm that identity number. Check the digits and try again.';
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

function networkRefusalCopy(path: string): string {
  if (/\/bills\/airtime/i.test(path)) {
    return 'We couldn’t buy this airtime. The payment network refused the request. Please try again later.';
  }
  if (/\/bills\/data/i.test(path)) {
    return 'We couldn’t buy this data. The payment network refused the request. Please try again later.';
  }
  if (/\/bills\/electricity/i.test(path)) {
    return 'We couldn’t complete this electricity payment. The payment network refused the request. Please try again later.';
  }
  if (/\/bills\/tv/i.test(path)) {
    return 'We couldn’t complete this TV payment. The payment network refused the request. Please try again later.';
  }
  if (/\/bills\//i.test(path)) {
    return 'We couldn’t complete this bill payment. The payment network refused the request. Please try again later.';
  }
  return 'We couldn’t send this transfer. The payment network refused the payout. Please try again later.';
}
