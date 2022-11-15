import React, {useState, useEffect}  from 'react'
import {decryptFile} from './DecryptFile'
import { HiOutlineDownload } from 'react-icons/hi';
import {Blocks} from 'react-loader-spinner';

function Download(props) {
const [downloading, setDownloading] = useState(false)
const [file, setFile] = useState(true)

const file_list = props.files
const file_path = file_list[props.file_name][1]
const bucket_id = props.bucket_id.bucket_id

const handleClick = async () => {
	setDownloading(true)
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
	try {
		await fetch('/unlink_download', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});	
	} catch(error) {
		console.log(error)
	}
	setFile((prev) => !prev )
}

useEffect(() => {
	if (downloading && !file) {
		setDownloading(false)
		setFile((prev) => !prev )
	}

}, [downloading, file])


if (downloading) {
	return (
		<Blocks					
		color="#00BFFF"
		height={30}
		width={80}
		className="" />
	)
}
	return (
		<span className="ml-[20px] w-[100px]">
		<button className="" onClick={handleClick}><HiOutlineDownload size={30}/></button>
		</span>
	)
}

export default Download