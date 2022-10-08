import { EthereumAuthProvider, SelfID } from '@self.id/web'

export async function createSelfID(account) {
  // The following assumes there is an injected `window.ethereum` provider
  //const addresses = await window.ethereum.request({ method: 'eth_requestAccounts' })

  return await SelfID.authenticate({
		authProvider: new EthereumAuthProvider(window.ethereum, account),
		ceramic: 'testnet-clay',
	})
}

export async function setDstorId(record) {
  // Use record passed from login component
	const encryptedString = await window.sessionStorage.getItem('encrypted_string')
	console.log("ENC STRING FROM RECORD UPDATE:", encryptedString)
  await record.merge({ dstor_id: encryptedString })
	console.log('ATTEMTED CERAMIC UPDATE')
}