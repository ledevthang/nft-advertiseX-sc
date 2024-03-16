import {Mina,UInt32,PrivateKey} from "o1js";
import {AdvertiseXPayment} from "../AdvertiseXPayment.js";

const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/berkeley/v1/graphql', 
    archive: 'https://api.minascan.io/archive/berkeley/v1/graphql/', 
  });
  Mina.setActiveInstance(Network);

  const zkAppPublicKey = PrivateKey.fromBase58("EKEop2zppg1z4F2zzyVe1zo2vtysXoN66rsmqYJjKBsoxyr8ctN9") 
  const zkapp = new AdvertiseXPayment(zkAppPublicKey.toPublicKey());

export async function fetchEvents(){
  const events = await zkapp.fetchEvents(UInt32.from(12000), UInt32.from(20000));
  return events; 
}
  
