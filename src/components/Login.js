import React, {Fragment, useState, useEffect} from 'react';
import LitJsSdk from "@lit-protocol/sdk-browser";
import {useViewerConnection, EthereumAuthProvider, useViewerRecord } from "@self.id/framework"
import styles from '../style'
import AppNavbar from '../style_components/AppNavbar'
import MintLoadingModal from '../style_components/MintLoadingModal'

const Login = ({setAuthSig}) => {
	const record =  useViewerRecord('basicProfile');
	const [connection, connect, disconnect] = useViewerConnection();
	const [accounts, setAccounts] = useState(null)
	const [sigsCollected, setSigsCollected] = useState(false)
	const [minting, setMinting] = useState(false)

	const ceramic_cookie_exists = document.cookie.includes('self.id')

	const connectWallet = async (sig) => {
		try {
		const response =  await fetch('/connect_wallet', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: sig
		});	
		const responseResult = await response.json()
		console.log('response from connectWallet:', responseResult)
		if (responseResult.error) {
			console.log('no user found')
			return null
		} else {
			console.log('found user')
			const body_string = JSON.stringify(responseResult)
			console.log('BODY STRING;', body_string)
			window.sessionStorage.setItem('db_user', body_string)
			return responseResult;
		}
		} catch (error) {
			console.log('something went wrong in wallet connect', error)
			throw error
		}
		}

		const litSignIn = async () => {
			return await LitJsSdk.checkAndSignAuthMessage({chain: "polygon",});
		}

		const newUser = async (litAuthSig) => {
			console.log('GOT TO NEW USER FLOW')
			const address = litAuthSig.address
			
				try {
				const response = await fetch('/new_user', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
						},
					body: JSON.stringify({address: address})
				})
				const db_user = await response.json()
				db_user.files = {}
				db_user.folders = []
				const db_user_string = JSON.stringify(db_user)
				window.sessionStorage.setItem('db_user', db_user_string)
				return {db_user}
				} catch (error) {
					console.log(error)
					throw error
				}
		}

		const ceramicSignIn = async (account) => {
			try {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			});
			console.log('accounts info in ceramic signin:', accounts[0], account)
			await connect(new EthereumAuthProvider(window.ethereum, accounts[0]));
		} catch (error) {
			console.log('error getting accounts:', error)
			throw error
		}
			
		}
	
	const handleClick = async (e) => {
		e.preventDefault();
		try {
			// Get required signatures, check if there's already a user in the db for this address
			
			const litAuthSig = await litSignIn();
			await ceramicSignIn(litAuthSig.address);
			const sigToSend = JSON.stringify(litAuthSig);
			const existingUser = await connectWallet(sigToSend);
			
			console.log('RECORD CONTENT after lit and ceramic sign:', record.content, connection)

				if (!existingUser){
					// New User Flow
					const {mint} = await import('./NewUser')
					const {encryptUser} = await import('./EncryptUser')

					// Nothing else should happen if minting fails, attempt mint first
					setMinting(true)
					const accessControlConditions = await mint();

					const {db_user} = await newUser(litAuthSig);
					db_user.nft_info = accessControlConditions;
					const db_user_string = JSON.stringify(db_user)

					const encStringToStore = await encryptUser(db_user_string, accessControlConditions, db_user)
					window.sessionStorage.setItem('encryptedString', encStringToStore)
					setSigsCollected(true)
				} else {
					// Existing User Flow
					await setAuthSig(litAuthSig)
				}
			} catch (error) {
			console.log('error in login', error)
			if (error.message === 'mint error'){
				window.alert('Error minting NFT. Please try again.')
				setMinting(false)
			} else {
				window.alert('Error signing in. Please try again.')
				setMinting(false)
			}
			} 
	}

	useEffect(() => {
		console.log('GOT TO USE EFFECT ON LOGIN')
		const updateRecord = async () => {
			const litAuthSig = localStorage.getItem('lit-auth-signature')
			const encryptedUserString = window.sessionStorage.getItem('encryptedString')

			if (ceramic_cookie_exists && record.content && !record.isMutating && encryptedUserString ){
				console.log("NEW USER CONDITION MET")
				await record.merge({dstor_id: encryptedUserString})
				window.sessionStorage.removeItem('encryptedString')
				await setAuthSig(litAuthSig)
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
              <AppNavbar handleClick={handleClick} />
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
