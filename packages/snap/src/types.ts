/**
 * The parameters for calling the `signMessage` JSON-RPC method.
 *
 * Note: For simplicity, these are not validated by the snap. In production, you
 * should validate that the request object matches this type before using it.
 */
export type GetEntropyParams = {
  /**
   * The BIP-32 path to the account.
   */
  path: string[];

  /**
   * The curve used to derive the account.
   */
  curve: 'secp256k1' | 'ed25519';
};
