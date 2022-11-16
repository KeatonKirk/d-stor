import React, {Fragment, useState, useEffect} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import {useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"
import styles from '../style'
import AppNavbar from '../style_components/AppNavbar'
import MintLoadingModal from '../style_components/MintLoadingModal'

const Login = (props) => {
	const record =  useViewerRecord('basicProfile');
	const [connection, connect, disconnect] = useViewerConnection();
	const [responseBody, setResponseBody] = useState('')
	const [minting, setMinting] = useState(false)

	const ceramic_cookie_exists = document.cookie.includes('self.id')

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
				setMinting(true)
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
	} 

	useEffect(() => {
		console.log('GOT TO USE EFFECT ON LOGIN')
		if (data && ceramic_cookie_exists && record.content && !record.isMutating && responseBody && !minting ){
			console.log("NEW USER CONDITION MET")
			newUser();
		}

	})
	

	if (minting){
		return(
			<MintLoadingModal />
		)
	}

	return (
		<Fragment>
		<div>
			<div className="bg-primary w-full overflow-hidden">
          <div className={`${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <AppNavbar handleClick={handleClick} />
            </ div>
        </div>
    </div>
		<div className="mt-10">
		<h2 className="font-poppins font-semibold xs:text-[35px] text-[10px] text-black xs:leading-[76.8px] leading-[66.8px] w-full">Upload New File</h2>
		<input disabled ={true} type="file" className=" text-sm text-slate-500
			file:mr-4 file:py-2 file:px-4
			file:rounded-full file:border-0
			file:text-sm file:font-semibold
			file:bg-sky-50 file:text-sky-500
			hover:file:bg-violet-100
		"/>
		<button disabled={true} className="w-[100px] rounded-full bg-sky-500">Upload</button>
	</div>
		<br/>
		<h2 className='font-poppins font-semibold text-[30px]'>Please Connect Wallet to access account</h2>

	</div>
		</Fragment>
	)
}

export default Login;
