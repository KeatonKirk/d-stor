import LitJsSdk from "@lit-protocol/sdk-browser";
import mintAccessNFT from './mintAccessNft.json';
import {ethers} from 'ethers'

// This component will handle the new user flow including:
// - mint NFT, send to msg.sender and add to user object
// - encrypting user object received from server
// - adding encrypted string to Ceramic 'dstor_id'
// - sending encryptedkey back to server for storage and decryption


// this should push access control conditions and encryptedSymmetricKey to database

	const contractAddress = '0x1246b9E3ADF02108374cAb5a14Eb7D28686F66d9'
	
	let db_user = JSON.parse(window.sessionStorage.getItem('db_user'))
	
	console.log("DB USER AT BEGINNING OF NEW USER FLOW:", db_user)
	const provider = new ethers.providers.Web3Provider(window.ethereum)
	const signer =  provider.getSigner();
	const contract = new ethers.Contract(
		contractAddress,
		mintAccessNFT.abi,
		signer
	)
	const contractWithSigner = contract.connect(signer)

	const accessControlConditions = [{
		chain: "ropsten",
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
	}]

	// pass the ceramic user as argument to encrypt
	// ceramic user needs: bucket_id, encrypted string, and file list
	const encrypt = async (stringToEncrypt, accessControlConditions) => {
		const client = await new LitJsSdk.LitNodeClient();
		client.connect();
		window.litNodeClient = client;

    if (!client.litNodeClient) {
      await client.connect()
    } 

    const chain = 'ropsten'  
    // const user = await JSON.parse(sessionStorage.getItem('db_user'))
		// TO DO get authsig some other way, or pass it from parent
    const authSig = await JSON.parse(window.localStorage.getItem("lit-auth-signature"))
    // encrypting a string using access control conditions and authsig from existing app state
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(stringToEncrypt);
    // step below is necessary to get key used to decrypt.
    // In user retrieval use case, encrypted string would get uploaded to ceramic
    // encryptedSymmmetricKey would go to database
    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });
    const keyToStore = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
		// encStringToStore gets uploaded to Ceramic
    const encStringToStore = await LitJsSdk.blobToBase64String(encryptedString)
		// TO DO send key to database
		console.log('DB USER ADDRESS', db_user.address)
		const body = {
			key: keyToStore,
			address: db_user.address,
			accessControlConditions: accessControlConditions[0]
		};
		const bodyString = JSON.stringify(body)
		const api_url = '/update'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: bodyString
		});	
		console.log("RESPONSE FROM DB UPDATE:", response)
		// TO DO update Ceramic object, add encryptedstring to user_id
    // console.log("BLOB CONVERSION:", encStringToStore)
    // console.log("Enc Key:", keyToStore)
  }


export async function mint () {

	await contractWithSigner.mintToken();
	const bigNumTokenId = await contractWithSigner.getMyTokens();
	const tokenId = ethers.BigNumber.from(bigNumTokenId).toNumber()
	const tokenIdString = tokenId.toString();
	accessControlConditions[0].parameters.push(tokenIdString)
	console.log("DB USER IN MINT", db_user)
	db_user.nft_info = accessControlConditions

	console.log('DB USER AFTER CONTRACT CALL', db_user)
	const db_user_string = await JSON.stringify(db_user)

	await encrypt(db_user_string, accessControlConditions)

	// const _event = await contractWithSigner.queryFilter("NFTMinted")
	// console.log('TRANSFER EVENT:', _event)
	// const api_url = '/mint'
	// const response =  await fetch(api_url, {
	// 	method: 'GET',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// });	
	// 	const jsonResponse = await response.json();
	// 	const nftIdNum = ethers.BigNumber.from(jsonResponse).toNumber()
	// 	const nftIdString = nftIdNum.toString();
	


		//console.log("ACCESS CONTROL CONDITIONS", accessControlConditions)


		
		// try {
			
		// 	db_user.nft_info = accessControlConditions;
		// 	console.log("db_user after login:", db_user )
		// } catch (error) {
		// 	console.log(error)
		// }
}


  

  
  






