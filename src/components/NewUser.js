
import mintAccessNFT from '.././mintAccessNft.json';
import {ethers} from 'ethers'

export async function mint () {
	// Goerli contract Address:
	 //const contractAddress = '0x2Ff2440158aDB25A393F6539dE868b0B5F112Be6'

	// Polygon Contract Adress:
	const contractAddress ='0xe8D0B85EcfFA16430D23e5c0630D1781BDC1A2E1'

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
		chain: "polygon",
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

	try {
	const tx = await contractWithSigner.mintToken();
	await tx.wait()
	const bigNumTokenId = await contractWithSigner.getMyTokens();
	const tokenId = ethers.BigNumber.from(bigNumTokenId).toNumber()
	const tokenIdString = tokenId.toString();
	accessControlConditions[0].parameters.push(tokenIdString)

	return accessControlConditions
	} catch (error) {
		console.log(error)
		throw new Error('mint error')
	}
}


  

  
  






