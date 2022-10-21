
import mintAccessNFT from '.././mintAccessNft.json';
import {ethers} from 'ethers'
import {encryptUser} from './EncryptUser'

	//const contractAddress = '0x2Ff2440158aDB25A393F6539dE868b0B5F112Be6'

	// const provider = new ethers.providers.Web3Provider(window.ethereum)
	// const signer =  provider.getSigner();
	// const contract = new ethers.Contract(
	// 	contractAddress,
	// 	mintAccessNFT.abi,
	// 	signer
	// )
	// console.log('SIGNER FROM NEW USER:', signer)
	// const contractWithSigner = contract.connect(signer)

	// const accessControlConditions = [{
	// 	chain: "goerli",
	// 	method: "balanceOf",
	// 	parameters: [
	// 		':userAddress',
	// 		//tokenId gets pushed here
	// 	],
	// 	contractAddress: contractAddress,
	// 	returnValueTest: {
	// 		value: '0',
	// 		comparator: '>'
	// 	},
	// 	standardContractType: 'ERC721'
	// }];

export async function mint () {
	const contractAddress = '0x2Ff2440158aDB25A393F6539dE868b0B5F112Be6'

	const provider = new ethers.providers.Web3Provider(window.ethereum)
	const signer =  provider.getSigner();
	const contract = new ethers.Contract(
		contractAddress,
		mintAccessNFT.abi,
		signer
	)
	console.log('SIGNER FROM NEW USER:', signer)
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

	const db_user = await JSON.parse(window.sessionStorage.getItem('db_user'))
	console.log("DB USER AT BEGINNING OF NEW USER FLOW:", db_user)

	const tx = await contractWithSigner.mintToken();
	await tx.wait()
	const bigNumTokenId = await contractWithSigner.getMyTokens();
	console.log('big num tokenid:', bigNumTokenId )
	const tokenId = ethers.BigNumber.from(bigNumTokenId).toNumber()
	console.log('INTEGER TOKEN ID:', tokenId)
	const tokenIdString = tokenId.toString();
	accessControlConditions[0].parameters.push(tokenIdString)
	db_user.nft_info = accessControlConditions
	db_user.files = {}
	
	console.log('DB USER AFTER CONTRACT CALL', db_user)
	const db_user_string = JSON.stringify(db_user)

	const encryptedString = await encryptUser(db_user_string, accessControlConditions, db_user)
	console.log('ENCRYPTION SUCCESSFUL')
	return encryptedString
}


  

  
  






