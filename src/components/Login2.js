import React, {useState, useEffect, Fragment} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
//import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework"
import {mint}from "./NewUser"
//import { EthereumAuthProvider, SelfID } from '@self.id/web'
import {setDstorId, createSelfID} from './SetRecordInfo'

const Login = (props) => {
	const [encString, setEncString] = useState();
	//const [connection, connect, disconnect] = useViewerConnection();

	const handleClick = async (e) => {
	e.preventDefault();

	const data = await LitJsSdk.checkAndSignAuthMessage({chain: "ropsten",});	
	const accounts = await window.ethereum.request({
		method: 'eth_requestAccounts',
	})
	//await connect(new EthereumAuthProvider(window.ethereum, accounts[0]))
	const selfID = await createSelfID(accounts[0]);
	const sigToSend = JSON.stringify(data)
	const sendSig = async (sig) => {
		const api_url = '/connect_wallet'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: sig
		});	
		const body = await response.json()
		const body_string = JSON.stringify(body)
		console.log('BODY STRING;', body_string)
		window.sessionStorage.setItem('db_user', body_string);
		console.log("DBUSER FROM INITIAL LOGIN:", window.sessionStorage.getItem("db_user"))
		if (!body.encrypted_key){
			 const encryptedString = await mint();
			 window.sessionStorage.setItem('encrypted_string', encryptedString)
			 console.log("ENCRYPTED STRING IN SESS:", sessionStorage.getItem('encrypted_string'))
			 await setDstorId(selfID)
			}
		
		}
		await sendSig(sigToSend)
		await props.setAuthSig(data)
		
	} 

	return (
		<Fragment>
			<div>
				<form onSubmit={ handleClick }>
					<button type='submit'>Connect Wallet</button>
				</form>
			</div>
		</Fragment>
	)
}

export default Login;
