import React, {Fragment} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import {useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"

const Login = (props) => {

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
	
	const sigToSend = JSON.stringify(data)

	await sendSig(sigToSend)

	if (!db_response_body.encrypted_key){
		const {mint} = await import('./NewUser')
		const encryptedString = await mint();
		window.sessionStorage.setItem('encrypted_string', encryptedString)
		await record.merge({dstor_id: encryptedString})
	 
	}
	props.setAuthSig(data)
	} 

	

	return (
		<Fragment>
			<div>
				<h1>Almost There!</h1>
				<p>dStor uses Self.ID to privately and securely store your information on a decentralized network. Please log in to retrieve your account.</p>
				<form onSubmit={ handleClick }>
					<button disabled={!data || !ceramic_cookie_exists} type='submit'>Log In</button>
				</form>
			</div>
		</Fragment>
	)
}

export default Login;
