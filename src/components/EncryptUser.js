import LitJsSdk from "@lit-protocol/sdk-browser";


export async function encryptUser (stringToEncrypt, accessControlConditions, db_user)  {
	console.log('INSIDE ENCRYPT USER')
		const client = await new LitJsSdk.LitNodeClient();
		client.connect();
		window.litNodeClient = client;
    if (!client.litNodeClient) {
      await client.connect()
    } 

    const chain = 'polygon'  
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
		// keyToStore gets sent to postgres db
    const keyToStore = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
		// encStringToStore gets uploaded to Ceramic
    const encStringToStore = await LitJsSdk.blobToBase64String(encryptedString)

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
		const responseJSON = await response.json();
		const userString = JSON.stringify(responseJSON.rows[0])
		window.sessionStorage.setItem('db_user', userString)
		console.log("RESPONSE FROM DB UPDATE:", responseJSON.rows[0])
		
		return encStringToStore
  }