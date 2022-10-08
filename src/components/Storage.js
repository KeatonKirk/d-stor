import React from "react";
import {useState, useEffect, useRef} from 'react';
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework";
import LitJsSdk from "@lit-protocol/sdk-browser";
import Record from './Record'
import Files from './Files'


const Chainsafe = (props) => {
  const [connection, connect] = useViewerConnection();
  // const [encString, setEncString] = useState();
  // const [encKey, setEncKey] = useState();
  const [string, setString] = useState();
  const [user, setUser ] = useState(null);
  const bucket_id = useRef("");

  const client = new LitJsSdk.LitNodeClient();
  client.connect();
  window.litNodeClient = client;


  // const encrypt = async (stringToEncrypt) => {
  //   if (!client.litNodeClient) {
  //     await client.connect()
  //   } 
  //   const chain = 'ropsten'  
  //   const user = await JSON.parse(sessionStorage.getItem('db_user'))
  //   const accessControlConditions = []
  //   accessControlConditions.push(user.nft_info) 
  //   const authSig = await props.authSig
  //   // encrypting a string using access control conditions and authsig from existing app state
  //   const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(stringToEncrypt);
  //   // step below is necessary to get key used to decrypt.
  //   // In user retrieval use case, encrypted string would get uploaded to ceramic
  //   // encryptedSymmmetricKey would go to database
  //   const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
  //     accessControlConditions,
  //     symmetricKey,
  //     authSig,
  //     chain,
  //   });
  //   const keyToStore = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
  //   const encStringToStore = await LitJsSdk.blobToBase64String(encryptedString)
  //   console.log("BLOB CONVERSION:", encStringToStore)
  //   setEncString(encStringToStore)
  //   setEncKey(keyToStore)
  //   console.log("Enc Key:", keyToStore)
  // }
  
  // Decrypting string using state var
  const decrypt = async (stringToDecrypt) => {
    console.log('ATTEMPTING DECRYPT IN STORAGE')
    if (!client.litNodeClient) {
      await client.connect()
    } 
    const db_user = await JSON.parse(sessionStorage.getItem('db_user'))
    console.log('GOT DB USER IN STORAGE:', db_user)
    // TO DO get accessControlConditions from db_user
    const accessControlConditions = [db_user.nft_info]
    const authSig = await props.authSig
    // convert base64 string to blob
    const encryptedString = LitJsSdk.base64StringToBlob(stringToDecrypt)
    const chain = 'ropsten'
    const encryptedSymmetricKey = db_user.encrypted_key
    console.log('GOT ENCRYPTED SYMKEY:', encryptedSymmetricKey)
    const symmetricKey = await window.litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    });
    console.log("GOT SYMMKEY:", symmetricKey)
    try {
    const decryptedString = await LitJsSdk.decryptString(
      encryptedString,
      symmetricKey
    );
    setString(decryptedString)
    return 
    } catch (error) {
      console.log(error)
    }
  }

  // Set any value in ceramic user object
  // const SetViewerName = () => {
  //   const record = useViewerRecord('basicProfile')
  //   return (
  //     <button
  //       disabled={!record.isMutable || record.isMutating || !encString}
  //       onClick={async () => {
  //         await record.merge({user_id: encString });
          
  //       }}>
  //     Update Profile
  //     </button>
  //   )
  // }

  if (user) {
    decrypt(user);
  } 
  if (string){
    const user_obj = JSON.parse(string)
    const bucket = user_obj.bucket_id
    bucket_id.current = bucket
  }

  // debugging console logs
  console.log('DRUM ROLL!!!!! DECRYPTED STRING IS:', string)

  useEffect(() => {
    // make sure there is a connection to ceramic, if not, reconnect using address from stored authSig
    if (connection.status === 'idle') {
      const reconnect = async () => {
        const authsig = JSON.parse(localStorage.getItem('lit-auth-signature'))
        await connect(new EthereumAuthProvider(window.ethereum, authsig.address))
      }
      reconnect();
    }
    return
  },[connect, connection.status, user])

  return (
    <div>
      <div>
        <Record setUser={setUser}/>
        <Files bucket_id={bucket_id.current}/>
        {/* <p>{bucket_id.current ? `Your Bucket ID is: ${bucket_id.current}` : ''}</p> */}
      </div>
    </div>
  );
};

export default Chainsafe;