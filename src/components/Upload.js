import React, { useState } from 'react'
import LitJsSdk from "@lit-protocol/sdk-browser";
import {encryptUser} from './EncryptUser'
import { useViewerRecord } from "@self.id/framework"
import {decryptFile} from './DecryptFile'
// take file input from user
// encrypt file with lit
// call server to proxy upload call to chainsafe api
// add file list to ceramic user files array

function Upload(props) {
	const [file, setFile] = useState()
	const [upload, setUpload] = useState(false)
	const record = useViewerRecord('basicProfile')
	
	const encryptFile = async (file) => {
		const client = await new LitJsSdk.LitNodeClient();
		client.connect();
		window.litNodeClient = client;
    if (!client.litNodeClient) {
      await client.connect()
    } 
		console.log('FILE NAME FROM UPLOAD:', file.name)
		const user = props.user_obj
		const accessControlConditions = user.nft_info
    const chain = 'goerli'  

		const file_name = file.name
		console.log('FILES FROM DBUSER:', user, user.files)
    const authSig = await JSON.parse(window.localStorage.getItem("lit-auth-signature"))
    // encryptedFile gets sent to server to upload via chainsafe
		console.log('FILE FROM ENCRYPT FILE:', file)
    const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({file: file });
		// encryptedSymmetricKey and file name get added as key-value pair to db_user files object
    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });
		console.log('ENCRYPTED FILE!!!:', encryptedFile)
		const keyToStore = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")

		user.files[file_name] = [keyToStore];

		const user_string = JSON.stringify(user)
		window.sessionStorage.setItem('db_user', user_string)
		console.log('DB USER AFTER UPLOAD:', user)


		const formData = new FormData()
		formData.append('file', encryptedFile)
		formData.append('bucket_id', props.bucket_id)
		formData.append('file_name', file.name)

		const base64String = await LitJsSdk.blobToBase64String(encryptedFile)
		const uint8array = await LitJsSdk.uint8arrayFromString(base64String)

		console.log('FORM DATA:', formData)
		const body = {
			file: base64String,
			file_name: file.name,
			bucket_id: props.bucket_id
		}

		console.log(body)

		const api_url = '/upload'
		const response =  await fetch(api_url, {
			method: 'POST',
			body: formData
		});	
		const responseJSON = await response.json();

		
		console.log("RESPONSE FROM Upload:", responseJSON)
		const upload_name = responseJSON.replace('uploads/', '')
		console.log('UPLOAD NAME:', upload_name)
		user.files[file_name].push(upload_name)
		console.log('USER FILES WITH UPLOAD NAME:', user.files)

		const db_user_string = JSON.stringify(user)

		window.sessionStorage.setItem('db_user', db_user_string)

		const stringToEncrypt = window.sessionStorage.getItem('db_user')
		console.log('ACCESS CONTROL CONDITIONS:', accessControlConditions)

		const userStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, user)
		
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

	const handleSubmit =  async () => {

		//encrypt file + update user object
		//send to server to upload via chainsafe
		const userStringToStore = await encryptFile(file)
		console.log("USER STRING TO STORE AFTER ENCRYPT", userStringToStore)
		await record.merge({dstor_id: userStringToStore})
		console.log('RECORD AFTER ENCRYPT', record)
		window.location.reload()
	}
	
	return (
		<div>
			<h2>Upload New File</h2>

          <input id='input' type="file" onChange={handleChange}/>
          <button disabled={!file} onClick={handleSubmit}>Upload</button>
		</div>
	)
}

export default Upload