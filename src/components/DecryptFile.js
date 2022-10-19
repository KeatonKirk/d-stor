import LitJsSdk from "@lit-protocol/sdk-browser";


export async function decryptFile (encryptedFile, encryptedSymmetricKey, fileName)  {
		const client = await new LitJsSdk.LitNodeClient();
		client.connect();
		window.litNodeClient = client;
    if (!client.litNodeClient) {
      await client.connect()
    } 
		console.log('ARGS IN DECRYPT FILE:', encryptedFile, encryptedSymmetricKey)
		const db_user = await JSON.parse(sessionStorage.getItem('db_user'))
		const accessControlConditions = [db_user.nft_info]
    const chain = 'goerli'  
    const authSig = await JSON.parse(window.localStorage.getItem("lit-auth-signature"))
		const symmetricKey = await window.litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    });
		console.log('SYMMKEY IN DECRYPT FILE:', symmetricKey)
		const decryptedFile =  await LitJsSdk.decryptFile({file: encryptedFile, symmetricKey})
		const uint8View = new Uint8Array(decryptedFile);
		console.log('DECRYPTED FILE FROM UPLOAD:', uint8View)
		await LitJsSdk.downloadFile({
			filename: fileName, 
			data: uint8View, 
			mimetype: 'application/octet-stream'
		})
		console.log(decryptedFile)

		return decryptedFile
  }