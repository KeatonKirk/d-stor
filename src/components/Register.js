import { useViewerRecord, useViewerConnection, EthereumAuthProvider } from '@self.id/framework';
const Register = () => {
	//const [loggedIn, setLoggedin] = useState(false)
	const record = useViewerRecord('basicProfile')
	const encryptedString = sessionStorage.getItem('encrypted_string')

	return (
		<button
			disabled={!record.isMutable || record.isMutating || !encryptedString}
			onClick={async () => {
				await record.merge({dstor_id: encryptedString });
				window.location.replace('/storage')
			}}>
		Register Account
		</button>
		)
	
}

export default Register;