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
				<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '250px'}}>
				<h2>Deleting File...</h2>
				<LineWave color="#FF0000" size={200} />
				</div>
			) : (
			<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
				<h2 style={{textAlign: 'center'}}>Are you sure you want to delete {file}?</h2>
				<button className="hover:bg-gray-300 rounded-md" style={{ margin: '10px', padding: '8px'}} onClick={() => setDeletingFile(false)}>Cancel</button>
				<button className="bg-red-600 hover:bg-red-800" style={buttonStyle} onClick={handleDelete}>Delete</button>
			</div>
			)}
		</Modal>

	)
}

export default DeleteFile