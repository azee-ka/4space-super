// shared/src/utils/encryption.ts
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export class EncryptionService {
  static generateKeyPair(): { publicKey: string; secretKey: string } {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      secretKey: encodeBase64(keyPair.secretKey),
    };
  }

  static generateSpaceKey(): string {
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    return encodeBase64(key);
  }

  static encryptMessage(message: string, spaceKey: string): string {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageUint8 = encodeUTF8(message);
    const encrypted = nacl.secretbox(
      messageUint8,
      nonce,
      decodeBase64(spaceKey)
    );

    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    return encodeBase64(fullMessage);
  }

  static decryptMessage(encryptedMessage: string, spaceKey: string): string | null {
    try {
      const fullMessage = decodeBase64(encryptedMessage);
      const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength);
      const encrypted = fullMessage.slice(nacl.secretbox.nonceLength);

      const decrypted = nacl.secretbox.open(
        encrypted,
        nonce,
        decodeBase64(spaceKey)
      );

      if (!decrypted) return null;

      return decodeUTF8(new TextDecoder().decode(decrypted as Uint8Array));
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }
}