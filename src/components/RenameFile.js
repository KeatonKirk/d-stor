import React, {useState} from 'react';
import { useViewerRecord } from "@self.id/framework";
import { FcCheckmark, FcCancel } from "react-icons/fc";
import {encryptUser} from './EncryptUser';

function RenameFile({file, setEditingName, user, setShowOptions}) {

	const [newName, setNewName] = useState(file)

	const record = useViewerRecord('basicProfile')

	const handleRename = async () => {
		try {
		console.log('rename file attempt', file, user.files[file])
		
		const currentFileValues = user.files[file]
		console.log('FILE VALUES:', currentFileValues)
		user.files[newName] = currentFileValues
		delete user.files[file]
		console.log('FILES AFTER RENAME:', user.files)

		const stringToEncrypt = JSON.stringify(user)
		const accessControlConditions = user.nft_info

		const encStringToStore = await encryptUser(stringToEncrypt, accessControlConditions, user)
		console.log('ENCRYPTED STRING TO STORE:', encStringToStore)
		await record.merge({dstor_id: encStringToStore})
		setEditingName(null)
		setShowOptions(null)
		} catch (error) {
			console.log('error from rename file attempt:', error.message)
			window.alert('Error renaming file. Please try again.')
		}
	}

	const handleCancel = () => {
		setEditingName(null)
		setShowOptions(null)
	}


	return (
	<>
		<td className="hover:bg-white bg-white">
			<input type="text" style={{outline: '1px'}} value={newName} onChange={(e) => setNewName(e.target.value)} />
			</td>
			<td className="hover:bg-white bg-white">
			<button onClick={handleCancel}><FcCancel size ={30}/></button>
			<button onClick={handleRename}><FcCheckmark size={30}/></button>
		</td>
	</>
	)
}

export default RenameFile