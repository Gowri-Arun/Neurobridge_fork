import CryptoJS from "crypto-js";

export interface EncryptionAdapter {
  encrypt: (plainText: string) => string;
  decrypt: (cipherText: string) => string;
}

export const createAesAdapter = (secretKey: string): EncryptionAdapter => ({
  encrypt: (plainText: string) => CryptoJS.AES.encrypt(plainText, secretKey).toString(),
  decrypt: (cipherText: string) => CryptoJS.AES.decrypt(cipherText, secretKey).toString(CryptoJS.enc.Utf8),
});

export const encryptRecord = <T>(adapter: EncryptionAdapter, payload: T): string =>
  adapter.encrypt(JSON.stringify(payload));

export const decryptRecord = <T>(adapter: EncryptionAdapter, encryptedPayload: string): T =>
  JSON.parse(adapter.decrypt(encryptedPayload)) as T;
