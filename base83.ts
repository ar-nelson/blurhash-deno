const digits =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

export const decode83 = (str: string, start: number, end: number) => {
  let value = 0;
  while (start < end) {
    value *= 83;
    value += digits.indexOf(str[start++]);
  }
  return value;
};

export const encode83 = (n: number, length: number): string => {
  let result = "";
  for (let i = 1; i <= length; i++) {
    const digit = (Math.floor(n) / Math.pow(83, length - i)) % 83;
    result += digits.charAt(Math.floor(digit));
  }
  return result;
};
