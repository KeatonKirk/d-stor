import { EthereumAuthProvider, SelfID } from '@self.id/web'

export async function createSelfID(account) {
  // The following assumes there is an injected `window.ethereum` provider
  //const addresses = await window.ethereum.request({ method: 'eth_requestAccounts' })

  return await SelfID.authenticate({
		authProvider: new EthereumAuthProvider(window.ethereum, account),
		ceramic: 'testnet-clay',
	})
}

export async function setDstorId(selfID) {
  // Use the SelfID instance created by the `createSelfID()` function
	const encryptedString = await window.sessionStorage.getItem('encrypted_string')
	console.log("ENC STRING FROM RECORD UPDATE:", encryptedString)
  await selfID.merge('basicProfile', { dstor_id: encryptedString })
	console.log('ATTEMTED CERAMIC UPDATE')
}