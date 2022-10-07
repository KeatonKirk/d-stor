import React, {useState, useEffect, Fragment} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import { useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"
import {mint}from "./NewUser"
//import { EthereumAuthProvider, SelfID } from '@self.id/web'
//import {setDstorId, createSelfID} from './SetRecordInfo'

const Login = (props) => {
	const [encString, setEncString] = useState();
	const [connection, connect, disconnect] = useViewerConnection();
	const record =  useViewerRecord('basicProfile');

	let db_response_body;
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

	const handleClick = async (e) => {
	e.preventDefault();
	

	const data = await LitJsSdk.checkAndSignAuthMessage({chain: "goerli",});	
	const accounts = await window.ethereum.request({
		method: 'eth_requestAccounts',
	})
	await connect(new EthereumAuthProvider(window.ethereum, accounts[0]))
	//const selfID = await createSelfID(accounts[0]);
	const sigToSend = JSON.stringify(data)

	await sendSig(sigToSend)

	if (!db_response_body.encrypted_key){
		console.log('NEW USER FLOW STARTED')
		const encryptedString = await mint();
		window.sessionStorage.setItem('encrypted_string', encryptedString)
		console.log("ENCRYPTED STRING IN SESS:", encryptedString)
		try {
			await record.merge({dstor_id: encryptedString})
		} catch (error) {
			alert('Woops! Looks like there was an issue connecting to the Decentralized networks. Please refresh the page and try again :)')
		}
			
		
	}
	//const encString = window.sessionStorage.getItem('encrypted_string')
	
	await props.setAuthSig(data)
		
	} 

	return (
		<Fragment>
			<div>
				<h1>Welcome to dStor! Please connect your wallet to continue!</h1>
				<form onSubmit={ handleClick }>
					<button type='submit'>Connect Wallet</button>
				</form>
			</div>
		</Fragment>
	)
}

export default Login;
