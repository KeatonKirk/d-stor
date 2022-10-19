import React from "react";
import {useState, useEffect, useRef} from 'react';
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework";
import LitJsSdk from "@lit-protocol/sdk-browser";
import Record from './Record'
import Files from './Files'
import Upload from './Upload'


const Storage = (props) => {
  const [connection, connect] = useViewerConnection();
  const [string, setString] = useState();
  const [user, setUser ] = useState(null);
  const bucket_id = useRef();
  const user_obj = useRef();
  const files = useRef();

  const client = new LitJsSdk.LitNodeClient();
  client.connect();
  window.litNodeClient = client;
  
  // Decrypting string using state var
  const decrypt = async (stringToDecrypt) => {
    console.log('ATTEMPTING DECRYPT IN STORAGE')
    if (!client.litNodeClient) {
      await client.connect()
    } 
    const db_user = await JSON.parse(sessionStorage.getItem('db_user'))
    console.log('GOT DB USER IN STORAGE:', db_user)
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

  if (user) {
    decrypt(user);
  } 
  if (string){
    const user_obj_json = JSON.parse(string)
    const bucket = user_obj_json.bucket_id
    
    bucket_id.current = bucket
    user_obj.current = user_obj_json
    files.current = user_obj_json.files
    // need to add logic here that makes file list accessible
  }
  // if (user_obj.current) {
    
  //   console.log('FILES FROM STORAGE COMP:', files )
  // }

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

  if (bucket_id.current){
    return (
      <div>
        <div>
          <Upload bucket_id={bucket_id.current} user_obj={user_obj.current}/>
          <br></br>
          <Files bucket_id={bucket_id.current} files={files.current}/>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div>
        <Record setUser={setUser}/>
      </div>
    </div>
  );
};

export default Storage;