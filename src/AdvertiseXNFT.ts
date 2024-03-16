
import {MinaNFT} from 'minanft';
import {
    PublicKey,
    Field,
    UInt64,
  } from "o1js";

/**
 * This contract implement non-fungible token on Mina
 */
export class AdvertiseXNFT extends MinaNFT {
  name: string;
  creator: string;
  storage: string;
  owner: Field;
  escrow: Field;
  version: UInt64;
  isMinted: boolean;
  address: PublicKey;
  tokenId: Field | undefined;
  nameService: PublicKey | undefined;
  constructor(params: {
    name: string;
    address: PublicKey;
    creator?: string;
    storage?: string;
    owner?: Field;
    escrow?: Field;
    nameService?: PublicKey;
  }) {
    super({name: params.name, address: params.address});
  }
  
}
  