import {
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Struct,
  UInt64,
  AccountUpdate,
  PrivateKey, 
  Poseidon, 
} from 'o1js';
import {AdvertiseXToken} from './AdvertiseXToken'; 
import {AdvertiseXNFT} from './AdvertiseXNFT';
import * as dotenv from "dotenv";
dotenv.config({});

/**
 * Struct Account
 */
class Account extends Struct({
  publicKey: PublicKey,
  points: UInt64,
}) {
}

/**
 * This is payment contract 
 */
export class AdvertiseXPayment extends SmartContract {
  @state(PublicKey) tokenPk = State<PublicKey>();
  @state(PublicKey) nftPk = State<PublicKey>();
  @state(PublicKey) owner = State<PublicKey>();
  nftName: string; 
    
  events = {
    paymentCreated: Account,
    withDraw: Account
  };
  
  @method initState(_tokenPk: PublicKey,_nftPk: PublicKey, _nftName: string) {
    this.tokenPk.set(_tokenPk);
    this.nftPk.set(_nftPk);
    this.owner.set(this.sender);
    this.nftName = _nftName;
  }

  init() {
    super.init();
  }

  onlyOwner() {
    this.owner.getAndAssertEquals().assertEquals(this.sender);
  }

  onlyNft() {
    this.nftPk.getAndAssertEquals().assertEquals(this.sender);
  }

  /**
   * Create payment with Mina native token
   * @param amount Amount to hire
   */
  @method createPayment(amount: UInt64) {
      // send Mina to this contract 
      let sender = AccountUpdate.createSigned(this.sender);
      sender.send({ to: this, amount });

      // send AdvertiseXNFT to user 
      const ownerConvert = this.owner.get().toFields();
      const _nft = new AdvertiseXNFT({ name: this.nftName, owner: Poseidon.hash(ownerConvert), address: this.nftPk.get() });
      let deployer = PrivateKey.fromBase58(`${process.env.OWNER_PRIVATE_KEY}`);
      const owner = Poseidon.hash(this.sender.toFields());
      _nft.mint({
        deployer,
        owner,
      });

      
    //emit event
    this.emitEvent('paymentCreated', new Account({
        publicKey: this.sender,
        points: amount,
      }));
  }

   /**
   * Create payment with AdvertiseXtoken 
   * @param amount Amount to hire
   */
  @method createPaymentWithCustomToken(amount: UInt64) {
    // send token AdvertiseXtoken to this contrct 
    const coinPk = this.tokenPk.get();
    const coin = new AdvertiseXToken(coinPk);
    coin.transfer(this.sender, this.address, amount);

    // send AdvertiseXNFT to user 
    const ownerConvert = this.owner.get().toFields()
    const _nft = new AdvertiseXNFT({ name: this.nftName, owner: Poseidon.hash(ownerConvert), address: this.nftPk.get() });
    let deployer = PrivateKey.fromBase58(`${process.env.OWNER_PRIVATE_KEY}`);
    const owner = Poseidon.hash(this.sender.toFields());
    _nft.mint({
      deployer,
      owner,
    });

   //emit event
   this.emitEvent('paymentCreated', new Account({
      publicKey: this.sender,
      points: amount,
    }));
}

   /**
   * Admin with draw Mina native token
   * @param amount Amount to withdraw
   */
  @method withDraw(amount: UInt64) {
    this.onlyOwner();

    this.send({ to: this.sender, amount });

    //emit event
    this.emitEvent('withDraw', new Account({
        publicKey: this.sender,
        points: amount,
      }));
  }

  /**
   * Admin with draw AdvertiseXToken
   * @param amount Amount to withdraw
   */
  @method withDrawCustomToken(amount: UInt64) {
    this.onlyOwner();

    const coinPk = this.tokenPk.get();
    const coin = new AdvertiseXToken(coinPk);
    coin.transfer(this.address, this.owner.get(), amount);
    
    //emit event
    this.emitEvent('withDraw', new Account({
        publicKey: this.sender,
        points: amount,
      }));
  }
}
