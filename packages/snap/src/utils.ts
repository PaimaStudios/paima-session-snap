import type { JsonSLIP10Node } from '@metamask/key-tree';
import { SLIP10Node } from '@metamask/key-tree';
import { GetEntropyParams } from './types';

type Address = string;

/** Overrides the base type of Record<string, Json> */
type SnapStorageState = {
  keys: Record<Address, JsonSLIP10Node>;
  // TODO: use this
  // TODO: can we somehow know to clear the session if the user closes their browser?
  sessions: Record<
    Address,
    string[] // origins permitted in the session
  >;
};

/**
 * Get an extended private key BIP-32 node, using the `snap_getBip32Entropy`
 * method.
 *
 * @param params - The parameters for calling the `snap_getBip32Entropy` method.
 * These are passed directly to the method, and are not validated beforehand.
 * @returns A {@link SLIP10Node} instance, which is a hierarchical deterministic
 * wallet node, generated using `@metamask/key-tree`. This instance contains the
 * private key, which can be used to sign messages.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getbip32entropy
 */
export const getPrivateNode = async (
  params: GetEntropyParams,
): Promise<SLIP10Node> => {
  // `snap_getBip32Entropy` returns a `JsonSLIP10Node` object, which can be
  // deserialized into a `SLIP10Node` instance by `@metamask/key-tree`.
  const json = await snap.request({
    method: 'snap_getBip32Entropy',
    params,
  });

  return SLIP10Node.fromJSON(json);
};

/**
 * Get the key for an address if it exists.
 *
 * @param currentAddress - The current address selected by the wallet.
 * @returns The root BIP-32 node as {@link SLIP10Node}.
 */
export async function getPrivateKey(
  currentAddress: string,
): Promise<undefined | SLIP10Node> {
  // Careful: in theory two snaps can call this function at the same time
  // It should be deterministic though, so it's fine
  const state = (await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  })) as null | SnapStorageState;

  if (state?.keys?.[currentAddress] != null) {
    return SLIP10Node.fromJSON(state.keys[currentAddress]);
  }
  return undefined;
}

/**
 * Set the key for an address.
 *
 * @param currentAddress - The current address selected by the wallet.
 * @param path - The path to use in case we need to derive a new key.
 * @returns The root BIP-32 node as {@link SLIP10Node}.
 */
export async function setPrivateKey(
  currentAddress: string,
  path: GetEntropyParams,
): Promise<SLIP10Node> {
  // Careful: in theory two snaps can call this function at the same time
  // It should be deterministic though, so it's fine
  const state = (await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  })) as null | SnapStorageState;
  const newState: SnapStorageState = {
    keys: state?.keys == null ? {} : state.keys,
  };
  const privateKey = await getPrivateNode(path);
  newState.keys[currentAddress] = privateKey.toJSON();
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState,
    },
  });

  return privateKey;
}
