import React, {useEffect} from 'react';
import { useViewerRecord, useViewerConnection, EthereumAuthProvider } from '@self.id/framework';
import styles from '../style'
import Spinner from '../style_components/Spinner'
import { close, logo_white, menu } from '../assets'

export default function Record(props) {
	const record = useViewerRecord('basicProfile')
	const [connection, connect] = useViewerConnection();


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
	
	// TO DO replace div below with progress spinner
	return (

		<>
		<div className="bg-primary w-full overflow-hidden">
		<div className={`${styles.paddingX} ${styles.flexCenter}`}>
			<div className={`${styles.boxWidth}`}>

			<nav className="w-full flex py-3 justify-between items-center navbar">
				<a href="/">
					<img src={logo_white} alt="dstor" className=" ml-0 w-[85px] h-[75px]"/>
				</a>
				<div className="hidden sm:ml-6 sm:block">
						<div className="flex space-x-4">
							<button className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700" disabled={true} aria-current="page">Connecting..</button>
						</div>
					</div>
			</nav>
			
			</div>
		</div>
	</div>
	<Spinner />
	</>

	)
}
