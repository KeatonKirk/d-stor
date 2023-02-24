import React, { useState, useEffect, useRef } from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import {encryptUser} from './EncryptUser';
import { useViewerRecord } from "@self.id/framework";
import axios from 'axios';
import Modal from 'react-modal';
import {InfinitySpin} from 'react-loader-spinner';

// take file input from user
// encrypt file with lit
// call server to proxy upload call to chainsafe api
// add file list to ceramic user files array

function Upload({bucket_id, user_obj, setUser, currentFolderRef, foldersRef, modalIsOpen, setModalIsOpen }) {
	const [file, setFile] = useState(null)
	const [uploading, setUploading] = useState(false)
	const [loading, setLoading] = useState(0)
	const [creatingNewFolder, setCreatingNewFolder] = useState(false)
	const inputRef = useRef(null)
	const newFolderRef = useRef(null)
	const record = useViewerRecord('basicProfile')
	
	console.log('UPLOAD COMPONENT RENDERED. USER:', user_obj, bucket_id, currentFolderRef.current)

	const encryptFile = async (file) => {
		const client = await new LitJsSdk.LitNodeClient();
		client.connect();
		window.litNodeClient = client;
    if (!client.litNodeClient) {
      await client.connect()
    } 
		console.log('FILE NAME FROM UPLOAD:', file.name)
		const currentFolder = currentFolderRef.current
		const user = user_obj
		const accessControlConditions = user.nft_info
    const chain = 'polygon'  

		console.log('UPLOAD COMPONENT RENDERED. USER:', user, bucket_id, currentFolderRef.current)

		const file_name = file.name
		console.log('FILES FROM Dstor USER:', user, user.files)
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

		console.log('DB USER AFTER UPLOAD:', user)


		const formData = new FormData()
		formData.append('file', encryptedFile)
		formData.append('bucket_id', bucket_id)
		formData.append('file_name', file.name)
		formData.append('folder', currentFolder)

		try {
			const response =  await axios({
			method: 'post',
			url: '/upload',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress: (event) => {
				//console.log('BROWSER PROGRESS TEST:', event)
				const percentageRaw = (event.progress * 100)
				const percentage = percentageRaw.toFixed(2)
				setLoading(percentage)
			}
		}, { timeout: -1});

		console.log('REPSONSE FROM UPLOAD:', response)
		const responseString = response.data

		//Below get's the filestream upload name from the response string, 
		//added to the array of objects which maps to the key which is the actual file name entered by user

		const upload_name = responseString.replace('uploads/', '')
		user.files[file_name].push(upload_name)
		user.files[file_name].push(currentFolder)
		const stringToEncrypt = JSON.stringify(user)
		const encStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, user)
		//inputRef.current.value = null
		setUploading(false)
		return encStringToStore
		} catch (error) {
			console.log('encrypt file threw error:', error.message)
			throw error
		}
	}

	const newFolder = async (e) => {
		e.preventDefault()
		const newFolderName = newFolderRef.current.value
		setCreatingNewFolder(true)
		console.log('new folder func called', newFolderRef.current)
		const user = user_obj
		const accessControlConditions = user.nft_info
		const getPath = async () => {
			if (currentFolderRef.current === '/') {
				return currentFolderRef.current + newFolderName
			} else {
				return currentFolderRef.current + '/' + newFolderName
			}
		} 

		const path = await getPath()
		console.log('data in new folder func', newFolderName, path, bucket_id)
		const body = {
			path: path,
			bucket_id: bucket_id
		}
		console.log('body in new folder func', body)
		try {
		const response = await axios({
			method: 'POST',
			url: '/new_folder',
			headers: {
				'Content-Type': 'application/json'
			},
			data: body,
		})
		console.log('new folder response:', response)

		user.folders.push(path)
		const stringToEncrypt = JSON.stringify(user)
		const encStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, user)
		await record.merge({dstor_id: encStringToStore})
		console.log('new folder response:', response)
		foldersRef.current.push(path)
		setCreatingNewFolder(false)
		setModalIsOpen(false)
		} catch (error) {
			console.log('error from new folder attempt:', error.message)
		}
	}

	const handleChange = async (e) => {
		setFile(e.target.files[0])
	}

	const handleSubmit = async (e) => {
		//enforce file size limit
		//encrypt file + update user object
		//send to server to upload via chainsafe
		if(file.size > 50000000){
			inputRef.current.value = null
			window.alert('Oops! File is too large. Please limit uploads to 50mb for now.')
			return
		}
		try {
		setUploading(true)
		const encStringToStore = await encryptFile(file)
		await record.merge({dstor_id: encStringToStore})
		window.alert('Upload Successful!')
		setFile(null)
		setLoading(0)
		} catch (error) {
			console.log('error from upload attempt:', error.message)
			setUploading(false)
			//inputRef.current.value = null
			window.alert('Oops! Something went wrong. Please try again.')
		}
	}
	const customStyles = {
		content: {
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
			maxWidth: '400px', // set max width of the modal
			maxHeight: '80vh', // set max height of the modal
		},
	};
	

	useEffect(() => {
		if (!record.isLoading && record.content && !record.isMutating && record.content.dstor_id && !uploading) {
			console.log("In upload useeffect")
			setUser(record.content.dstor_id)
		}
	
		return 
	},[record.isLoading, record.content, record, uploading, file])

	useEffect(() => {
		if (file) {
			handleSubmit()
		}
	}, [file])



	if (uploading) {
		return(
		<>
		<h2 className="font-poppins font-semibold xs:text-[35px] text-[10px] text-black xs:leading-[76.8px] leading-[66.8px] mt-10">Upload New File</h2>
		<div className="flex items-center">
			<input disabled={true} type="file" className=" text-sm text-slate-500
				file:mr-4 file:py-2 file:px-4
				file:rounded-full file:border-0
				file:text-sm file:font-semibold
				file:bg-sky-50 file:text-sky-500
			"/>
			<p className="align-text-bottom">Uploading...</p>
			<div className="text-black">
				<div className="pt-4">
					<div className="overflow-hidden h-2 mb-4 text-xs text-center flex rounded bg-sky-200 h-[16px] w-[200px]">
						<div style={{width: (loading * 2)}} className="shadow-none text-center whitespace-nowrap text-white justify-between bg-sky-500 h-[100px]"><p className="text-slate-800">{loading}% Completed</p></div>
					</div>
				</div>  
			</div>
		</div>
	</>

		)
	}
	return (
	<div className="mt-10">
		<p className="font-poppins font-semibold xs:text-[35px] text-black xs:leading-[76.8px] leading-[66.8px] w-full" style={{fontSize: '30px'}}>Upload New File</p>
		<input ref={inputRef} type="file" className=" text-sm text-slate-500
			file:mr-4 file:py-2 file:px-4
			file:rounded-full file:border-0
			file:text-sm file:font-semibold
			file:bg-sky-50 file:text-sky-500
			hover:file:bg-violet-100
		"
		title="Upload a file"
		onChange={handleChange}/>
		<div >
			<button className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700 mt-10" onClick={() => setModalIsOpen(true)}>Add Folder</button>
			<div>
				<Modal isOpen={modalIsOpen} style={customStyles}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '10px', marginBottom: '10px'}}>
						{creatingNewFolder ? (
							<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
								<p>Creating New Folder...</p>
								<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
								<InfinitySpin
									color="#00BFFF"
									height={100}
									width={150}
									timeout={3000} //3 secs
								/>
								</div>
							</div>
						) : (
							<>
							<form onSubmit={newFolder}>
								<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
									<label>New Folder Name:</label>
									<input ref={newFolderRef} style={{ border: '1px solid #ccc' }} type="text" />
									<button style={{ marginTop: '10px' }} className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700" type="submit">Submit</button>
								</div>
							</form>
						<div style={{marginTop: '20px'}}>
							<button className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-300" onClick={() => setModalIsOpen(false)}>Cancel</button>
						</div>
						</>
						)}


					</div>
				</Modal>
			</div>
		</div>
	</div>

	)
}

export default Upload