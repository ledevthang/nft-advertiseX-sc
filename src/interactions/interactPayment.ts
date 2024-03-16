import { Mina, PrivateKey,UInt64} from "o1js"; 
import {AdvertiseXPayment} from "../AdvertiseXPayment.js";
import * as dotenv from "dotenv"; 
dotenv.config({});
// set Mina instance
const Network = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Network);

let senderKey = PrivateKey.fromBase58(`${process.env.OWNER_PRIVATE_KEY}`);
let senderAccount = senderKey.toPublicKey();

const zkAppPublicKey = PrivateKey.fromBase58("EKEop2zppg1z4F2zzyVe1zo2vtysXoN66rsmqYJjKBsoxyr8ctN9") 
const zkapp = new AdvertiseXPayment(zkAppPublicKey.toPublicKey());

async function createPayment(amount: number){
  await AdvertiseXPayment.compile()
  const tx = await Mina.transaction({sender: senderAccount, fee:100000000}, () => {
      zkapp.createPayment(UInt64.from(amount * 1e9))
    });
    await tx.prove();
    tx.sign([senderKey]);
    
    // send transaction
    const result = await tx.send();
    const wait = await result.safeWait();
    return wait;
}

async function withDraw(amount: number){
  await AdvertiseXPayment.compile()
  // create the transaction, add proofs and signatures
  const tx = await Mina.transaction({sender: senderAccount, fee:100000000}, () => {
      zkapp.withDraw(UInt64.from(amount * 1e9))
    });
    await tx.prove();
    tx.sign([senderKey]);
    
    // send transaction
    const result = await tx.send();
    const safeWait = await result.safeWait();
    return safeWait; 
}

export {
  createPayment, 
  withDraw
}