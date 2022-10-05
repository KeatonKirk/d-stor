import React, {useEffect, useRef, useState} from 'react';
import { useViewerRecord } from '@self.id/framework';

export default function Record(props) {
	const record = useViewerRecord('basicProfile')
	const user_id = useRef()
	const [user, setUser] = useState("");
	const encryptedString = sessionStorage.getItem('encrypted_string')

	const updateRecord = async () => {
		if (!record.isMutating && record.isMutable && encryptedString){
			await record.merge({name: encryptedString })
			console.log('MADE IT TO UPDATE RECORD:', record.content.name)
			user_id.current =record.content.name
		} 
		
	}

	updateRecord();

	const text = record.isLoading
	? 'Loading...'
	: record.content.name
	? updateRecord()
	: 'unsuccessful'



	// const user_info = record.isLoading
	// ? 'Loading'
	// : record.content
	// ? record.content.dstor_id
	// : 'no user id entered yet'


	// useEffect(() => {
	// 	if (!record.isLoading && record.content.dstor_id) {
	// 		console.log("DSTOR ID FROM RECOR:", record.content.dstor_id )
	// 		props.setUser(record.content.dstor_id)
	// 	}
	
	// 	return
	// },[record.isLoading, props, record.content, encryptedString, record])
	
	
	return (
		<div>
		<p>test</p>
		</div>
	)
}
