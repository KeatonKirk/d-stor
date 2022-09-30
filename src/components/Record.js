import React, {useEffect, useRef, useState} from 'react';
import { useViewerRecord } from '@self.id/framework';

export default function Record(props) {
	const record = useViewerRecord('basicProfile')
	const user_id = useRef()
	const [user, setUser] = useState(null);


	const text = record.isLoading
	? 'Loading...'
	: record.content
	? 'Welcome!'
	: 'No profile to load'

	const user_info = record.isLoading
	? 'Loading'
	: record.content
	? `User info is: ${record.content.user_id}`
	: 'no user id entered yet'


	useEffect(() => {
		if (!record.isLoading && record.content) {
			props.setUser(record.content.user_id)
			console.log('USER ID FROM RECORD EFFECT:', user)
		}
	
		return
	},[user, record.isLoading, props, record.content])
	
	
	return (
		<div>
		<p>{text}</p>
		</div>
	)
}
