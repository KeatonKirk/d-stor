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
	const [ceramicAuth, setCeramicAuth] = useState(false)
	const [minting, setMinting] = useState(false)

	const ceramic_cookie_exists = document.cookie.includes('self.id')

	let data = JSON.parse(window.localStorage.getItem("lit-auth-signature"))

	const connectWallet = async (sig) => {
		try {
		const api_url = '/connect_wallet'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: sig
		});	
		const responseResult = await response.json()
		console.log('response from connectWallet:', responseResult)
		if (!responseResult.error) {
			console.log('found user')
			//setResponseBody(db_response_body)
			const body_string = JSON.stringify(responseResult)
			console.log('BODY STRING;', body_string)
			window.sessionStorage.setItem('db_user', body_string)
			return responseResult
		} else {
			console.log('no user found')
			return null
		}
		} catch (error) {
			console.log('something went wrong in wallet connect', error)
			throw error
		}

		// window.sessionStorage.setItem('db_user', body_string);
		// console.log("DBUSER FROM INITIAL LOGIN:", window.sessionStorage.getItem("db_user"))
		}

		const litSignIn = async () => {
			data = await LitJsSdk.checkAndSignAuthMessage({chain: "goerli",});
		}

		const newUser = async () => {
			// below statement executes if it's  first time user login
			console.log('GOT TO NEW USER FLOW')
			const address = data.address
			
				try {
				console.log('RECORD FROM NEW USER FUNC:', record.content)
				
				const {mint} = await import('./NewUser')
				const {encryptUser} = await import('./EncryptUser')
				setMinting(true)

				const accessControlConditions = await mint();
				
				const response = await fetch('/new_user', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
						},
					body: JSON.stringify({address: address})
				})
				const db_user = await response.json()
				//console.log('user from new user servercall:', await response.json())
				db_user.nft_info = accessControlConditions
				db_user.files = {}
				const db_user_string = JSON.stringify(db_user)
				
				const {encStringToStore, responseString} = await encryptUser(db_user_string, accessControlConditions, db_user)
				//window.sessionStorage.setItem('encrypted_string', encryptedString)
				return {encStringToStore, responseString}
				//await record.merge({dstor_id: encryptedString})
				} catch (error) {
					console.log(error)
					//window.sessionStorage.removeItem('db_user')
					//setResponseBody('')
					setMinting(false)
					window.alert('Error minting NFT. Please try again.')
					throw new Error('mint error')
				}
			
			//props.setAuthSig(data)
		}

		const ceramicSignIn = async () => {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			await connect(new EthereumAuthProvider(window.ethereum, accounts[0]));
			await setCeramicAuth(true)
		}
	
	const handleClick = async (e) => {
	e.preventDefault();
	let encryptedString = ''
	let userToStore = ''
	try {
		await litSignIn();
		console.log('RECORD CONTENT after litSignIn:', record.content, data)
		const sigToSend = JSON.stringify(data);
		const userExists = await connectWallet(sigToSend);
		await ceramicSignIn();
		console.log('RECORD CONTENT after lit and ceramic sign:', record.content, connection, ceramicAuth)

		if (!userExists){
			const {encStringToStore, responseString} = await newUser();
			encryptedString = encStringToStore;
			userToStore = responseString;
			console.log('encryptedString:', encStringToStore)
		} 
			if (encryptedString){
				console.log('connection status in record merge:', connection)
				window.sessionStorage.setItem('encryptedString', encryptedString)
			}
			window.sessionStorage.setItem('db_user', userToStore)
		} catch (error) {
		console.log('error in login', error)
		if (!error.message === 'mint error'){
			window.alert('Error signing in. Please try again.')
			setMinting(false)
		}
		} 
	}

	useEffect(() => {
		console.log('GOT TO USE EFFECT ON LOGIN')
		const updateRecord = async () => {
		if (data && ceramic_cookie_exists && record.content && !record.isMutating && responseBody && !minting ){
			console.log("NEW USER CONDITION MET")
			const encryptedString = window.sessionStorage.getItem('encryptedString')
			await record.merge({dstor_id: encryptedString})
			await props.setAuthSig(data)
		}
	}
	updateRecord()
	})
	

	if (minting){
		return(
			<MintLoadingModal />
		)
	}

	return (
		<Fragment>
		<div >
			<div className="bg-primary w-full overflow-hidden">
          <div className={`${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <AppNavbar record={record} ceramicAuth={ceramicAuth} setCeramicAuth={setCeramicAuth} setAuthSig={props.setAuthSig} setMinting={setMinting}handleClick={handleClick} />
            </ div>
        </div>
    </div>
		<div className={`flex-1 ${styles.flexStart} flex-col sm:px-16`} >
		<h2 className="font-poppins font-semibold xs:text-[35px] text-[10px] text-black xs:leading-[76.8px] leading-[66.8px] w-full">Upload New File</h2>
		<input disabled ={true} type="file" className=" text-sm text-slate-500
			file:mr-4 file:py-2 file:px-4
			file:rounded-full file:border-0
			file:text-sm file:font-semibold
			file:bg-sky-50 file:text-sky-500
			hover:file:bg-violet-100
		"/>
		<button disabled={true} className="w-[100px] rounded-full bg-sky-500">Upload</button>
	
		<br/>
		<h2 className='font-poppins font-semibold text-[30px]'>Please Connect Wallet to access account</h2>
		</div>
	</div>
		</Fragment>
	)
}

export default Login;
