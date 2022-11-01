import React, {Fragment, useState, useEffect} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import {useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"


const Login = (props) => {
	const record =  useViewerRecord('basicProfile');
	const [connection, connect, disconnect] = useViewerConnection();
	const [responseBody, setResponseBody] = useState('')
	//const [state, setState] = useState(false)

	const ceramic_cookie_exists = document.cookie.includes('self.id')

	//let db_response_body;
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
		const db_response_body = await response.json()
		setResponseBody(db_response_body)
		const body_string = JSON.stringify(db_response_body)
		console.log('BODY STRING;', body_string)
		window.sessionStorage.setItem('db_user', body_string);
		console.log("DBUSER FROM INITIAL LOGIN:", window.sessionStorage.getItem("db_user"))
		}

		const litSignIn = async () => {
			data = await LitJsSdk.checkAndSignAuthMessage({chain: "goerli",});
		}

		const newUser = async () => {
			// below statement executes if it's  first time user login
			console.log('GOT TO NEW USER FLOW')
			if (!responseBody.encrypted_key){
				console.log('RECORD FROM NEW USER FUNC:', record.content)
				const {mint} = await import('./NewUser')
				const encryptedString = await mint();
				window.sessionStorage.setItem('encrypted_string', encryptedString)
				await record.merge({dstor_id: encryptedString})
			}
			props.setAuthSig(data)
		}

		const ceramicSignIn = async () => {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			await connect(new EthereumAuthProvider(window.ethereum, accounts[0]));

			// if (!db_response_body.encrypted_key) {
			// 	await callback();
			// }
		}
	
	const handleClick = async (e) => {
	e.preventDefault();

	await litSignIn();
	console.log('RECORD CONTENT after litSignIn:', record.content)
	const sigToSend = JSON.stringify(data);
	await sendSig(sigToSend);
	console.log('RECORD CONTENT after send sig:', record.content)
	await ceramicSignIn();
	console.log('RECORD CONTENT after ceramic sign:', record.content)
	//setState(true)
	} 

	
	// if (data && ceramic_cookie_exists && record.content && state ){
	// 	console.log("NEW USER CONDITION MET")
	// 	setState(false)
	// 	newUser();
	// }

	useEffect(() => {
		console.log('GOT TO USE EFFECT ON LOGIN')
		if (data && ceramic_cookie_exists && record.content && !record.isMutating ){
			console.log("NEW USER CONDITION MET")
			newUser();
		}
	})
	

	return (
		<Fragment>
			<div>
				<h1>Almost There!</h1>
				<p>dStor uses Self.ID to privately and securely store your information on a decentralized network.</p>
				<p>After registering with Ceramic Network, please login to retrieve your account.</p>
				<form onSubmit={ handleClick }>
					<button disabled={record.isLoading || record.isMutating} type='submit'>Log In</button>
				</form>
			</div>
		</Fragment>
	)
}

export default Login;
