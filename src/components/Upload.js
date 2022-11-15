import React, { useState, useEffect, useRef } from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import {encryptUser} from './EncryptUser';
import { useViewerRecord } from "@self.id/framework";
import axios from 'axios';
import {ProgressBar} from 'react-loader-spinner';

// take file input from user
// encrypt file with lit
// call server to proxy upload call to chainsafe api
// add file list to ceramic user files array

function Upload(props) {
	const [file, setFile] = useState(null)
	const [uploading, setUploading] = useState(false)
	const inputRef = useRef(null)
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

		const api_url = '/upload'
		const response =  await axios({
			method: 'post',
			url: api_url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress: (event) => {
				console.log('BROWSER PROGRESS TEST:', event)
			}
			
		}, { timeout: -1});	

		console.log('REPSONSE FROM UPLOAD:', response)
		const responseString = response.data
		const upload_name = responseString.replace('uploads/', '')
		user.files[file_name].push(upload_name)

		const stringToEncrypt = JSON.stringify(user)

		const userStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, user)
		return userStringToStore
	}

	const handleChange = async (e) => {
		setFile(e.target.files[0])
	}

	const handleSubmit = async (e) => {
		//encrypt file + update user object
		//send to server to upload via chainsafe
		console.log('upload handle submit reached')
		setUploading(true)
		const userStringToStore = await encryptFile(file)
		await record.merge({dstor_id: userStringToStore})
		setFile(null)
	}

	useEffect(() => {
		if (!record.isLoading && record.content && !record.isMutating && record.content.dstor_id) {
			console.log("DSTOR ID FROM Upload:", record.content)
			props.setUser(record.content.dstor_id)
		}

		if (uploading && !file) {
			setUploading(false)
			inputRef.current.value = null
			window.alert('Upload Successful')
		}
	
		return 
	},[record.isLoading, props, record.content, record, uploading, file])
	
	if (uploading) {
		return(
		<>
		<h2 className="font-poppins font-semibold xs:text-[35px] text-[10px] text-black xs:leading-[76.8px] leading-[66.8px] mt-10">Upload New File</h2>

		<div className="flex items-center">
			<input ref={inputRef} disabled={true} type="file" className=" text-sm text-slate-500
				file:mr-4 file:py-2 file:px-4
				file:rounded-full file:border-0
				file:text-sm file:font-semibold
				file:bg-sky-50 file:text-sky-500
			"/>
			<p className="align-text-bottom">Uploading...</p>
			<div className="">
				<ProgressBar
					color="#00BFFF"
					height={50}
					width={100}
					className="align-bottom"
				/>   
			</div>

			
		</div>
	</>

		)
	}
	return (
	<div className="mt-10">
		<h2 className="font-poppins font-semibold xs:text-[35px] text-[10px] text-black xs:leading-[76.8px] leading-[66.8px] w-full">Upload New File</h2>
		<input ref={inputRef} type="file" className=" text-sm text-slate-500
			file:mr-4 file:py-2 file:px-4
			file:rounded-full file:border-0
			file:text-sm file:font-semibold
			file:bg-sky-50 file:text-sky-500
			hover:file:bg-violet-100
		"
		onChange={handleChange}/>
		<button disabled={!file} onClick={handleSubmit} className="w-[100px] rounded-full bg-sky-500">Upload</button>
	</div>

	)
}

export default Upload