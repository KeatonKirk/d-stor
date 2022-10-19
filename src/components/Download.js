import React from 'react'
import {decryptFile} from './DecryptFile'

function Download(props) {

const file_list = props.files
const file_path = file_list[props.file_name][1]
const bucket_id = props.bucket_id.bucket_id

const handleClick = async () => {
	console.log('click handler')
	console.log('PROPS IN DOWNLOAD FROM FILES COMP',file_list, file_path, bucket_id.bucket_id )
	const body = {
		bucket_id: bucket_id,
		file_path: file_path,
		file_name: props.file_name
	}
	
	const body_string = JSON.stringify(body)
	console.log('body in download request:', body_string)
	const api_url = '/download'
	const response = await fetch(api_url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: body_string
	})
	// send chainsafe download to server
	// get and decrypt file
	const encryptedFile = await response.blob()
	const encryptedSymmetricKey = file_list[props.file_name][0]
	try {
		const decryptedFile = await decryptFile(encryptedFile, encryptedSymmetricKey, props.file_name)
		console.log('DECRYPTED FILE ATTEMPT:', decryptedFile)
	}catch (err){
		console.log(err)
	}

}
	return (
		<>
		<button onClick={handleClick}>Download</button>
		</>
	)
}

export default Download