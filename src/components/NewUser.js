import LitJsSdk from "@lit-protocol/sdk-browser";
import mintAccessNFT from '.././mintAccessNft.json';
import {ethers} from 'ethers'
import {encryptUser} from './EncryptUser'

	const contractAddress = '0xAbaDf831858e31AcBc58A0B4d4997488d78f5FcF'

	const provider = new ethers.providers.Web3Provider(window.ethereum)
	const signer =  provider.getSigner();
	const contract = new ethers.Contract(
		contractAddress,
		mintAccessNFT.abi,
		signer
	)
	const contractWithSigner = contract.connect(signer)

	const accessControlConditions = [{
		chain: "goerli",
		method: "balanceOf",
		parameters: [
			':userAddress',
			//tokenId gets pushed here
		],
		contractAddress: contractAddress,
		returnValueTest: {
			value: '0',
			comparator: '>'
		},
		standardContractType: 'ERC721'
	}];

	// pass the ceramic user as argument to encrypt
	// ceramic user needs: bucket_id, encrypted string, and file list
	// const encryptUser = async (stringToEncrypt, accessControlConditions, db_user) => {
	// 	const client = await new LitJsSdk.LitNodeClient();
	// 	client.connect();
	// 	window.litNodeClient = client;
  //   if (!client.litNodeClient) {
  //     await client.connect()
  //   } 

  //   const chain = 'goerli'  
  //   const authSig = await JSON.parse(window.localStorage.getItem("lit-auth-signature"))
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
	// 	// keyToStore gets sent to postgres db
  //   const keyToStore = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
	// 	// encStringToStore gets uploaded to Ceramic
  //   const encStringToStore = await LitJsSdk.blobToBase64String(encryptedString)

	// 	const body = {
	// 		key: keyToStore,
	// 		address: db_user.address,
	// 		accessControlConditions: accessControlConditions[0]
	// 	};
	// 	const bodyString = JSON.stringify(body)
	// 	const api_url = '/update'
	// 	const response =  await fetch(api_url, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		body: bodyString
	// 	});	
	// 	const responseJSON = await response.json();
	// 	const responseString = JSON.stringify(responseJSON.rows[0])
	// 	window.sessionStorage.setItem('db_user', responseString)
	// 	console.log("RESPONSE FROM DB UPDATE:", responseJSON.rows[0])
		
	// 	return encStringToStore
  // }


export async function mint () {

	const db_user = await JSON.parse(window.sessionStorage.getItem('db_user'))
	console.log("DB USER AT BEGINNING OF NEW USER FLOW:", db_user)

	await contractWithSigner.mintToken();
	const bigNumTokenId = await contractWithSigner.getMyTokens();
	const tokenId = ethers.BigNumber.from(bigNumTokenId).toNumber()
	const tokenIdString = tokenId.toString();
	accessControlConditions[0].parameters.push(tokenIdString)
	console.log("DB USER IN MINT", db_user)
	db_user.nft_info = accessControlConditions
	db_user.files = {}

	console.log('DB USER AFTER CONTRACT CALL', db_user)
	const db_user_string = JSON.stringify(db_user)

	const encryptedString = await encryptUser(db_user_string, accessControlConditions, db_user)
	console.log('ENCRYPTION SUCCESSFUL')
	return encryptedString
}


  

  
  






