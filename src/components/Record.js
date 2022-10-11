import React, {useEffect} from 'react';
import { useViewerRecord, useViewerConnection, EthereumAuthProvider } from '@self.id/framework';

export default function Record(props) {
	const record = useViewerRecord('basicProfile')
	const [connection, connect] = useViewerConnection();

	const user_info = record.isLoading
	? 'Loading'
	: record.content.dstor_id 
	? 'My Files:'
	: 'Woops! Looks like there was an error connecting, please refresh and connect your wallet again :)'


	useEffect(() => {
		if (connection.status === 'idle') {
      const reconnect = async () => {
        const authsig = JSON.parse(localStorage.getItem('lit-auth-signature'))
        await connect(new EthereumAuthProvider(window.ethereum, authsig.address))
      }
      reconnect();
    }
		if (!record.isLoading && record.content && !record.isMutating && record.content.dstor_id) {
			console.log("DSTOR ID FROM RECORD:", record.content)
			props.setUser(record.content.dstor_id)
		}
	
		return
	},[record.isLoading, props, record.content, record, connect, connection.status])
	
	
	return (
		<div>loading, please wait</div>
	)
}
