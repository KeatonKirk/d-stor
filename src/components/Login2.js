import React, {useState, useEffect, Fragment} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import { useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"
import {mint}from "./NewUser"
//import { EthereumAuthProvider, SelfID } from '@self.id/web'
// import {setDstorId, createSelfID} from './SetRecordInfo'
// import Register from './Register'

const Login = (props) => {
	const [loggedIn, setLoggedIn] = useState(false)
	const [connection, connect, disconnect] = useViewerConnection();
	const record =  useViewerRecord('basicProfile');
	
	const ceramic_cookie_exists = document.cookie.includes('self.id')

	let db_response_body;
	let data = JSON.parse(window.localStorage.getItem("lit-auth-signature"))

	const sendSig = async (sig) => {
		const api_url = '/connect_wallet'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: sig
		});	
		db_response_body = await response.json()
		const body_string = JSON.stringify(db_response_body)
		console.log('BODY STRING;', body_string)
		window.sessionStorage.setItem('db_user', body_string);
		console.log("DBUSER FROM INITIAL LOGIN:", window.sessionStorage.getItem("db_user"))
		}


		const enterApp = async () => {
			data = await LitJsSdk.checkAndSignAuthMessage({chain: "goerli",});	
			console.log('DATA ADDRESS:', data.address)
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			await connect(new EthereumAuthProvider(window.ethereum, accounts[0]))
		}

		if (!data && !ceramic_cookie_exists){
			enterApp();
		}
	

	const handleClick = async (e) => {
	e.preventDefault();
	
	// data = await LitJsSdk.checkAndSignAuthMessage({chain: "goerli",});	
	// console.log('DATA ADDRESS:', data.address)
	// const accounts = await window.ethereum.request({
	// 	method: 'eth_requestAccounts',
	// })
	// await connect(new EthereumAuthProvider(window.ethereum, accounts[0]))
	// //const selfID = await createSelfID(accounts[0]);
	const sigToSend = JSON.stringify(data)

	await sendSig(sigToSend)

	if (!db_response_body.encrypted_key){
		console.log('NEW USER FLOW STARTED')
		const encryptedString = await mint();
		window.sessionStorage.setItem('encrypted_string', encryptedString)
		console.log("ENCRYPTED STRING IN SESS:", encryptedString)
		await record.merge({dstor_id: encryptedString})
	}
	props.setAuthSig(data)
	} 


		// if (!record.isLoading && record.isMutable && !record.isMutating && record.content) {
		// 	console.log('RECORD UPDATE FLOW')
		// 	setDstorId(record)
		// }


	// useEffect(() => {
	// 	if (connection.status === 'idle') {
  //     const reconnect = async () => {
  //       const authsig = JSON.parse(localStorage.getItem('lit-auth-signature'))
  //       await connect(new EthereumAuthProvider(window.ethereum, authsig.address))
  //     }
  //     reconnect();
  //   }

	// 	return 
	// })
	

	return (
		<Fragment>
			<div>
				<h1>Almost There!</h1>
				<p>dStor uses Self.ID to privately and securely store your information on a decentralized network. Please log in to retrieve your account.</p>
				<form onSubmit={ handleClick }>
					<button type='submit'>Log In</button>
				</form>
			</div>
		</Fragment>
	)
}

export default Login;
