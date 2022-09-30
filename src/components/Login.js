import React, {useState, useEffect, Fragment} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework"
import {mint}from "./NewUser"

const Login = (props) => {
	const [sig, setSig] = useState(null)
	const [connection, connect, disconnect] = useViewerConnection()

	const handleClick = async (e) => {
	e.preventDefault();

	const data = await LitJsSdk.checkAndSignAuthMessage({chain: "ropsten",});	
	const accounts = await window.ethereum.request({
		method: 'eth_requestAccounts',
	})
	await connect(new EthereumAuthProvider(window.ethereum, accounts[0]))
	setSig(data)
	console.log('CLICK HANDLER SUCCESSFUL')
	} 


	useEffect(() => {
		console.log("	LOGIN EFFECT CALLED")
		if (sig) {
			props.onSubmit(sig)
			const sigToSend = JSON.stringify(sig)
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
				await window.sessionStorage.setItem('db_user', body_string);
				if (!body.encrypted_key){
					await mint();
				}
				
			}
			sendSig(sigToSend)
			//window.location.href = "/storage"
			console.log("CONNECT ATTEMPTED:", window.sessionStorage.getItem('db_user'));		
		}	
	}, [sig, props])
			

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
