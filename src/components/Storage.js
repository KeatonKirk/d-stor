import React from "react";
import {useState, useEffect, useRef} from 'react';
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework";
import LitJsSdk from "@lit-protocol/sdk-browser";
import Record from './Record'
import Files from './Files'
import Upload from './Upload'
import styles from '../style'
import AppNavbar from '../style_components/AppNavbar'
//import Sidebar from './Sidebar'


const Storage = (props) => {
  const [connection, connect, disconnect] = useViewerConnection();
  const [string, setString] = useState();
  const [user, setUser ] = useState(null);
  //const [uploading, setUploading] = useState(false)
  const bucket_id = useRef();
  const user_obj = useRef();
  const files = useRef();

  console.log('STORAGE COMPONENT RENDERED. USER:', user)
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
    const chain = 'polygon'
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
      console.log('attempted final string decrypt', encryptedString, symmetricKey)
    const decryptedString = await LitJsSdk.decryptString(
      encryptedString,
      symmetricKey
    );
    console.log('SUCCESSFULLY DECRYPTED USER STRING:', JSON.parse(decryptedString))
    setString(decryptedString)
     
    } catch (error) {
      console.log(error)
    }
  }

  const handleDisconnect = async () => {
    disconnect();
    window.localStorage.removeItem("lit-auth-signature")
    window.location.assign('/login')
  }

  if (user) {
    decrypt(user);
  } 
  if (string){
    const user_obj_json = JSON.parse(string)
    const bucket = user_obj_json.bucket_id
    console.log('Dstor user OBJECT IN STORAGE:', user_obj_json)
    bucket_id.current = bucket
    user_obj.current = user_obj_json
    files.current = user_obj_json.files
  }


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
  },[connect, connection.status])

  if (bucket_id.current){
    return (
      <div>

        <div className="bg-primary w-full overflow-hidden">
          <div className={`${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <AppNavbar handleDisconnect={handleDisconnect} />
            </div>
          </div>
        </div>

          <div className={`flex-1 ${styles.flexStart} flex-col sm:px-16`}>
          <div className="flex flex-col justify-between items-left w-full">
            <Upload bucket_id={bucket_id.current} user_obj={user_obj.current} setUser={setUser}/>
            <br></br>
            <Files bucket_id={bucket_id.current} files={files.current}/>
          </div>
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