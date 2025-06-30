function isValidIndianPhoneNumber(phoneNumber: string): boolean {
  const indianPhoneRegex = /^[6-9]\d{9}$/;
  return indianPhoneRegex.test(phoneNumber);
}

export default isValidIndianPhoneNumber;
