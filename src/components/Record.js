import React, {useEffect, useRef, useState} from 'react';
import { useViewerRecord, useViewerConnection, EthereumAuthProvider } from '@self.id/framework';

export default function Record(props) {
	const record = useViewerRecord('basicProfile')
	const [connection, connect, disconnect] = useViewerConnection();
	// const user_id = useRef()
	// const [user, setUser] = useState("");
	// const encryptedString = sessionStorage.getItem('encrypted_string')



	const text = record.isLoading
	? 'Loading...'
	: record.content
	? 'Welcome!'
	: 'unsuccessful'



	const user_info = record.isLoading
	? 'Loading'
	: record.content && !record.isMutating
	? record.content.dstor_id
	: 'no user id entered yet'

	//console.log("DSTOR ID FROM RECORD:", record.content.dstor_id)

	useEffect(() => {
		if (connection.status === 'idle') {
      const reconnect = async () => {
        const authsig = JSON.parse(localStorage.getItem('lit-auth-signature'))
        await connect(new EthereumAuthProvider(window.ethereum, authsig.address))
      }
      reconnect();
    }
		if (!record.isLoading && record.content && !record.isMutating) {
			console.log("DSTOR ID FROM RECOR:", record.content)
			props.setUser(record.content.dstor_id)
		}
	
		return
	},[record.isLoading, props, record.content, record, connect, connection.status])
	
	
	return (
		<div>
		<p>{user_info}</p>
		</div>
	)
}
