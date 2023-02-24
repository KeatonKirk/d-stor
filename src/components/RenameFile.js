import React, {useState} from 'react';
import { useViewerRecord } from "@self.id/framework";
import { FcCheckmark, FcCancel } from "react-icons/fc";
import {encryptUser} from './EncryptUser';
import {RotatingSquare} from 'react-loader-spinner';

function RenameFile({file, setEditingName, user, setShowOptions}) {

	const [newName, setNewName] = useState(file)
	const [processingRename, setProcessingRename] = useState(false)

	const record = useViewerRecord('basicProfile')

	const handleRename = async () => {
		setProcessingRename(true)
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
		console.log('got past record update:', record)
		setEditingName(null)
		setShowOptions(null)
		setProcessingRename(false)
		} catch (error) {
			console.log('error from rename file attempt:', error.message)
			window.alert('Error renaming file. Please try again.')
			setProcessingRename(false)
		}
	}

	const handleCancel = () => {
		setEditingName(null)
		setShowOptions(null)
	}


	return (
	<>
	{processingRename ? (
		<>
			<td className="hover:bg-white bg-white">
				{newName}
				</td>
				<td className="hover:bg-white bg-white">
					<RotatingSquare color="#00BFFF" height={30} width={100} />
			</td>
			</>
	) : (
		<>
		<td className="hover:bg-white bg-white">
			<input type="text" style={{ border: '1px solid #ccc' }} value={newName} onChange={(e) => setNewName(e.target.value)} />
			</td>
			<td className="hover:bg-white bg-white">
			<button onClick={handleRename}><FcCheckmark size={30}/></button>
			<button onClick={handleCancel}><FcCancel size ={30}/></button>
		</td>
		</>
	)}
	</>
	)
}

export default RenameFile