import {
    State,
    state,
    UInt64,
    SmartContract,
    AccountUpdate,
    method,
    PublicKey,
    Permissions,
    DeployArgs,
    Field,
  } from 'o1js';
  
  /**
   * This contract implememt fungible token on Mina network
   */
  export class AdvertiseXToken extends SmartContract {
    @state(Field) symbol = State<Field>();
    @state(UInt64) decimals = State<UInt64>();
    @state(UInt64) maxSupply = State<UInt64>();
    @state(PublicKey) owner = State<PublicKey>();
    @state(UInt64) totalAmountInCirculation = State<UInt64>();
  
    deploy(args?: DeployArgs) {
      super.deploy(args);
  
      this.account.permissions.set({
        ...Permissions.default(),
        access: Permissions.proofOrSignature(),
      });
    }
  
    @method initialize(symbol: Field, decimals: UInt64, maxSupply: UInt64) {
      this.symbol.set(symbol);
      this.decimals.set(decimals);
      this.maxSupply.set(maxSupply);
      this.owner.set(this.sender);
    }
  
    onlyOwner() {
      this.owner.getAndAssertEquals().assertEquals(this.sender);
    }
    
    /**
     * Mint token to account receiver , only admin can mint 
     * @param receiverAddress Account recieve AdvertiseXToken
     * @param amount Amount mint 
     */
    @method mint(receiverAddress: PublicKey, amount: UInt64) {
      this.onlyOwner();
      const maxSupply = this.maxSupply.getAndAssertEquals();
      const circulatingSupply =
        this.totalAmountInCirculation.getAndAssertEquals();
  
      const newCirculatingSupply = circulatingSupply.add(amount);
  
      newCirculatingSupply.assertLessThanOrEqual(maxSupply);
  
      this.token.mint({
        address: receiverAddress,
        amount,
      });
  
      this.totalAmountInCirculation.set(newCirculatingSupply);
    }
    
     /**
     * Burn token to account receiver , only admin can burn 
     * @param burnerAddress Account burn AdvertiseXToken
     * @param amount Amount burn 
     */
    @method burn(burnerAddress: PublicKey, amount: UInt64) {
      this.onlyOwner();
      const maxSupply = this.maxSupply.getAndAssertEquals();
      const circulatingSupply =
        this.totalAmountInCirculation.getAndAssertEquals();
  
      const newCirculatingSupply = circulatingSupply.sub(amount);
      newCirculatingSupply.assertLessThanOrEqual(maxSupply);
      this.token.burn({
        address: burnerAddress,
        amount,
      });
  
      this.totalAmountInCirculation.set(newCirculatingSupply);
    }
    
    /**
     * Transfer token tfrom sender account to receiver account
     * @param senderAddress Sender account 
     * @param receiverAddress Receiver account
     * @param amount Amount transfer 
     */
    @method transfer(
      senderAddress: PublicKey,
      receiverAddress: PublicKey,
      amount: UInt64
    ) {
      this.token.send({ from: senderAddress, to: receiverAddress, amount });
    }
    
    /**
     * Get current balance
     * @param address Account to get balance
     */
    @method getBalance(address: PublicKey): UInt64 {
      let accountUpdate = AccountUpdate.create(address, this.token.id);
      let balance = accountUpdate.account.balance.get();
      return balance;
    }
  }
  