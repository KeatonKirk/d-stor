import React, {useState} from 'react'
import { close, logo_white, menu } from '../assets'
import {useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"
import LitJsSdk from "@lit-protocol/sdk-browser";


function AppNavbar(props) {
	const [ toggle, setToggle] = useState(false)
	const [connection, connect, disconnect] = useViewerConnection();
	//const [ceramicAuth, setCeramicAuth] = useState(false)
	//const record =  useViewerRecord('basicProfile');

	
	const navText = (window.location.pathname === '/login' ? 'Connect Wallet' : 'Disconnect')


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
				//console.log('RECORD FROM NEW USER FUNC:', props.record.content)
				
				const {mint} = await import('../components/NewUser')
				const {encryptUser} = await import('../components/EncryptUser')
				props.setMinting(true)

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
					props.setMinting(false)
					window.alert('Error minting NFT. Please try again.')
					throw new Error('mint error')
				}
			
			//props.setAuthSig(data)
		}

		const ceramicSignIn = async () => {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			const selfid = await connect(new EthereumAuthProvider(window.ethereum, accounts[0]))
			// ...
			// get session to serialize and store 
			const session = selfid.client.session //or connection.selfID.client.session
			session.serialize()
			// await props.setCeramicAuth(true)
		}
	
	const handleClick = async (e) => {
	e.preventDefault();
	let encryptedString = ''
	let userToStore = ''
	try {
		await litSignIn();
		//console.log('RECORD CONTENT after litSignIn:', props.record.content, data)
		const sigToSend = JSON.stringify(data);
		const userExists = await connectWallet(sigToSend);
		await ceramicSignIn();
		//console.log('RECORD CONTENT after lit and ceramic sign:', props.record.content, connection, props.ceramicAuth)

		if (!userExists){
			const {encStringToStore, responseString} = await newUser();
			encryptedString = encStringToStore;
			userToStore = responseString;
			console.log('encryptedString:', encStringToStore)
		} 
			if (encryptedString){
				await props.setCeramicAuth(true)
				console.log('connection status in record merge:', connection)
				await props.record.merge({dstor_id: encryptedString})
			}
			window.sessionStorage.setItem('db_user', userToStore)
			await props.setAuthSig(data)
		} catch (error) {
		console.log('error in login', error)
		if (!error.message === 'mint error'){
			window.alert('Error signing in. Please try again.')
			props.setMinting(false)
		}
		} 
	}
	const navButton = (window.location.pathname === '/login' ? props.handleClick : props.handleDisconnect)

	return (
		<nav className="w-full flex py-3 justify-between items-center navbar">
			<a href="/">
				<img src={logo_white} alt="dstor" className=" ml-0 w-[85px] h-[75px]"/>
			</a>
			

			<div className="hidden sm:ml-6 sm:block">
          <div className="flex space-x-4">
            <button className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700" onClick={navButton} aria-current="page">{navText}</button>
          </div>
      </div>

			<div className="sm:hidden flex flex-1 justify-end items-center">
					<img 
					src={toggle? close : menu} 
					alt="Menu" 
					className="w-[28px] h-[28px] object-contain"
					onClick={() => setToggle((prev) => !prev)}
					/>
					<div
					className={`${toggle? 'flex' : 'hidden'} p-6 bg-black-gradient absolute top-20 right-0 mx-4 min-w-[140px] rounded-xl sidebar`}
					>
					<div className="hidden sm:ml-6 sm:block">
							<div className="flex space-x-4">
								<button className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700" onClick={navButton} aria-current="page">{navText}</button>
							</div>
					</div>
					</div>
			</div>
		</nav>
	)
}

export default AppNavbar