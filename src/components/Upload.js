import React, { useState } from 'react'
import LitJsSdk from "@lit-protocol/sdk-browser";
import {encryptUser} from './EncryptUser'
import { useViewerRecord } from "@self.id/framework"
// take file input from user
// encrypt file with lit
// call server to proxy upload call to chainsafe api
// add file list to ceramic user files array

// TO DO extract encrypt logic to separate component, dynamically import here

function Upload(props) {
	const [file, setFile] = useState()
	const record = useViewerRecord('basicProfile')
	
	const encryptFile = async (fileToEncrypt) => {
		const client = await new LitJsSdk.LitNodeClient();
		client.connect();
		window.litNodeClient = client;
    if (!client.litNodeClient) {
      await client.connect()
    } 
		const db_user = await JSON.parse(sessionStorage.getItem('db_user'))
		const accessControlConditions = [db_user.nft_info]
    const chain = 'goerli'  
    const authSig = await JSON.parse(window.localStorage.getItem("lit-auth-signature"))
    // encryptedFile gets sent to server to upload via chainsafe
		console.log('FILE FROM ENCRYPT FILE:', fileToEncrypt)
    const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile(fileToEncrypt);
		// encryptedSymmetricKey and file name get added as key-value pair to db_user files object
    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });

		db_user.files.fileToEncrypt.name = encryptedSymmetricKey;
		const user_string = JSON.stringify(db_user)
		window.sessionStorage.setItem('db_user', user_string)
		console.log('DB USER AFTER UPLOAD:', db_user)
		const fileToUpload = [encryptedFile]

		// TO DO finish upload logic for server proxy
		const body = {
			file: fileToUpload,
			path: '/',
			bucket_id: props.bucket_id
		}

		const body_string = JSON.stringify(body)
		const api_url = '/upload'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: body_string
		});	
		const responseJSON = await response.json();
		const responseString = JSON.stringify(responseJSON.rows[0])
		
		console.log("RESPONSE FROM DB UPDATE:", responseJSON.rows[0])

		const stringToEncrypt = window.sessionStorage.getItem('db_user')

		const userStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, db_user)

		// this should:
		// take the updated user object with new file in files object,
		// encrypt it, 
		// upload the new encrypted user key to the db
		// update the ceramic record dstor_id

		return userStringToStore
		
	}

	const handleChange = async (e) => {
		setFile(e.target.files[0])
	}

	const handleSubmit =  async (e) => {
		e.preventDefault()
		console.log('FILE FROM STATE IN UPLOAD:', file)
		//encrypt file + update user object
		//send to server to upload via chainsafe

		const encStringToStore = await encryptFile(file)
		await record.merge({dstor_id: encStringToStore})

		console.log(file)
	}
	return (
		<div>
			<h2>Upload New File</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleChange}/>
          <button disabled={!file} type="submit">Upload</button>
        </form>
		</div>
	)
}

export default Upload