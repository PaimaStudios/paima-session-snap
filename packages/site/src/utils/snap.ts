import toast from 'react-hot-toast';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as [string];
  const selectedAddress = accounts[0];
  try {
    // use a random string every time just to demo
    // prefix the string with "A" because starting with 0x by coincidence could break things
    // TODO: change this to a random concise encoding in the future
    const randomString = `A${(Math.random() + 1).toString(36).substring(7)}`;
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapOrigin,
        request: {
          method: 'personal_sign',
          params: {
            personal_sign: [randomString, selectedAddress],
          },
        },
      },
    });
    // substring start at index 1 to remove the leading quote mark "
    toast.success(`Signed: ${JSON.stringify(result).substring(1, 20)}...`);
  } catch (e) {
    toast.error(JSON.stringify(e));
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
