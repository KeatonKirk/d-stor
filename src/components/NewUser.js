import LitJsSdk from "@lit-protocol/sdk-browser";
import mintAccessNFT from './mintAccessNFT.json';
import {ethers} from 'ethers'

// DEBUGGIN the way this component is exported seems to be causing problems.
// need to investigate how to call mint and encrypt function from a module that is invoked
// by login

// This component will handle the new user flow including:
// - mint NFT, send to msg.sender and add to user object
// - encrypting user object received from server
// - adding encrypted string to Ceramic 'basic-profile'
// - sending encryptedkey back to server for storage and decryption

	const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
	
	const db_user = JSON.parse(window.sessionStorage.getItem('db_user'))
	console.log("DB USER AT BEGINNING OF NEW USER FLOW:", db_user)
	const provider = new ethers.providers.Web3Provider(window.ethereum)
	const signer =  provider.getSigner();
	const contract = new ethers.Contract(
		contractAddress,
		mintAccessNFT.abi,
		signer
	)
	const contractWithSigner = contract.connect(signer)
	//contract.on('NFTMinted', signer)


	// const client = await new LitJsSdk.LitNodeClient();
  // client.connect();
  // window.litNodeClient = client;

export async function mint () {

	const tx = await contractWithSigner.giveAccess();
	const receipt = await tx.wait()

	contract.on("NFTMinted", (NewItemId) => {
		console.log("LISTENING FOR EVENT:", NewItemId)
		// const id = NewItemId.toString();
		// accessControlConditions.parameters.push(id)
	})

	const accessControlConditions = {
		chain: "polygon",
		method: "balanceOf",
		parameters: [
			':userAddress',
			//tokenId needs to go here
		],
		contractAddress: contractAddress,
		returnValueTest: {
			value: '0',
			comparator: '>'
		},
		standardContractType: 'ERC721'
	}
		
		console.log("TOKEN ID FROM CONTRACT:", receipt)
		try {
			
			db_user.nft_info = accessControlConditions;
			console.log("db_user after login:", db_user )
		} catch (error) {
			console.log(error)
		}
}


  

  
  




	// const encrypt = async (stringToEncrypt) => {
  //   if (!client.litNodeClient) {
  //     await client.connect()
  //   } 
  //   const chain = 'ropsten'  
  //   const user = await JSON.parse(sessionStorage.getItem('db_user'))
  //   const accessControlConditions = []
  //   accessControlConditions.push(user.nft_info) 
	// 	// TO DO get authsig some other way, or pass it from parent
  //   const authSig = await props.authSig
  //   // encrypting a string using access control conditions and authsig from existing app state
  //   const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(stringToEncrypt);
  //   // step below is necessary to get key used to decrypt.
  //   // In user retrieval use case, encrypted string would get uploaded to ceramic
  //   // encryptedSymmmetricKey would go to database
  //   const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
  //     accessControlConditions,
  //     symmetricKey,
  //     authSig,
  //     chain,
  //   });
  //   const keyToStore = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
  //   const encStringToStore = await LitJsSdk.blobToBase64String(encryptedString)
	// 	// TO DO send key to database
	// 	// TO DO update Ceramic object, add encryptedstring to user_id
  //   console.log("BLOB CONVERSION:", encStringToStore)
  //   console.log("Enc Key:", keyToStore)
  // }

