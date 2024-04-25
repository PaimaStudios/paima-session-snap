/* eslint-disable camelcase */

import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { providerErrors } from '@metamask/rpc-errors';
import { add0x, assert, hexToBytes } from '@metamask/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { getPrivateKey, setPrivateKey } from './utils';

/**
 * https://docs.metamask.io/wallet/how-to/sign-data/#use-personal_sign
 */
type PersonalSignParams = [
  /**
   * Message to sign
   * For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
   * Ex: `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
   */
  string,
  /**
   * Address to sign with
   * Ex: web3.eth.accounts[0]
   */
  string,
];

type SnapParams = {
  personal_sign: PersonalSignParams;
};

/**
 * TODO: this is the "gaming account" path with the account always set at 0
 * Ideally we would instead rederive the same key the user has for their current wallet
 * But Metamask Snap doesn't support this
 * We do this to avoid blocking for now
 */
const gamingAccountPath = ['m', "71657769'", "60'", "0'"];
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log(origin);
  console.log(request);
  switch (request.method) {
    case 'personal_sign': {
      const params = request.params as SnapParams;
      const [message, address] = params.personal_sign;
      // TODO: validate the format
      // rpcErrors.invalidParams({
      //     message:
      //     "Invalid format.",
      // }),
      let existingKey = await getPrivateKey(address);
      console.log('existingKey');
      console.log(existingKey);
      if (existingKey === undefined) {
        const approved = await snap.request({
          method: 'snap_dialog',
          params: {
            // type: 'prompt',
            // content: panel([
            //   heading('Session request'),
            //   text(
            //     `Please enter your spending password to enable auto-signing this session for ${origin}`,
            //   ),
            // ]),
            // placeholder: 'Spending password',
            type: 'confirmation', // DialogType.Confirmation,
            content: panel([
              heading('Signature request'),
              text(
                `Do you want to enable auto-signing for ${origin} for this session with the following public key?`,
              ),
              copyable(address),
            ]),
          },
        });
        console.log(`approved`);
        console.log(approved);
        if (approved === true) {
          existingKey = await setPrivateKey(address, {
            path: gamingAccountPath,
            curve: 'secp256k1',
          });
        } else {
          throw providerErrors.userRejectedRequest();
        }
      }

      const adjustedMessage = message.startsWith('0x')
        ? message
        : `0x${Buffer.from(message, 'utf8').toString('hex')}`;
      console.log(existingKey.privateKeyBytes);
      assert(existingKey.privateKeyBytes);
      const signature = secp256k1.sign(
        hexToBytes(adjustedMessage),
        existingKey.privateKeyBytes,
      );

      return add0x(signature.toDERHex());
    }
    default:
      throw new Error('Method not found.');
  }
};
