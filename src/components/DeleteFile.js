import React, {useState} from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { useViewerRecord } from "@self.id/framework";
import {encryptUser} from './EncryptUser';
import {LineWave} from 'react-loader-spinner';

function DeleteFile({deletingFile, setDeletingFile, currentFolderRef, file, bucket_id, user}) {
	//const [modalIsOpen, setModalIsOpen] = useState(false)
	const [processingDelete, setProcessingDelete] = useState(false)

	const record = useViewerRecord('basicProfile')

	const handleDelete = async () => {
		setProcessingDelete(true)
		console.log('delete clicked')
		const path = currentFolderRef.current + '/' + file;
		const accessControlConditions = user.nft_info
		const body = {
			path: path,
			bucket_id: bucket_id,
		}
		try {
			delete user.files[file]
			const stringToEncrypt = JSON.stringify(user)
			const encStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, user)
			
			const response = await axios({
				method: 'POST',
				url: '/new_folder',
				headers: {
					'Content-Type': 'application/json'
				},
				data: body,
			})
			console.log(response)
			await record.merge({dstor_id: encStringToStore})
			setProcessingDelete(false)
			setDeletingFile(false)
		} catch (error) {
			console.log('error deleting file:', error)
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
	const buttonStyle = {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
  };
	
	return (

		<Modal isOpen={deletingFile === file} style={customStyles} shouldFocusAfterRender={true}>
			
			{processingDelete ? (
				<>
				<h2>Deleting File...</h2>
				<LineWave color="#FF0000" size={100} />
				</>
			) : (
			<>
				<h2 style={{textAlign: 'center'}}>Are you sure you want to delete {file}?</h2>
				<button style={{width: '100%', margin: '10px'}} onClick={() => setDeletingFile(false)}>Cancel</button>
				<button style={buttonStyle} onClick={handleDelete}>Delete</button>
			</>
			)}
		</Modal>

	)
}

export default DeleteFile