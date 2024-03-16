import {Mina,fetchEvents,UInt32,PrivateKey} from "o1js";
import {AdvertiseXTokenSales} from "./AdvertiseXTokenSales.js";

const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/berkeley/v1/graphql', // Use https://proxy.berkeley.minaexplorer.com/graphql or https://api.minascan.io/node/berkeley/v1/graphql
    archive: 'https://api.minascan.io/archive/berkeley/v1/graphql/', // Use https://api.minascan.io/archive/berkeley/v1/graphql/ or https://archive.berkeley.minaexplorer.com/
  });
  Mina.setActiveInstance(Network);

  const zkAppPublicKey = PrivateKey.fromBase58("EKEop2zppg1z4F2zzyVe1zo2vtysXoN66rsmqYJjKBsoxyr8ctN9") 
  const zkapp = new AdvertiseXTokenSales(zkAppPublicKey.toPublicKey());
  

// Fetch all events starting at block 560 and ending at block 600

// // Fetch all events for a given address
// const fetchedEvents = await fetchEvents({
//   publicKey: `$zkAppPublicKey.toPublicKey()`,
// });
async function main(){
const events = await zkapp.fetchEvents(UInt32.from(12000), UInt32.from(20000));
// console.log({events})
  events.forEach(cur=>{
    console.log(cur.event.data)
  })
  }
  
  main().then();
