
// This component should fetch list of files from Chainsafe and display them on screen
// will need to proxy the call through the server
const Files = (props) => {

	const getFiles = async (sig) => {
		const api_url = '/get_files'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: sig
		});	
		const response_json = await response.json()
		const body_string = JSON.stringify(response_json)
		console.log('BODY STRING;', body_string)
		window.sessionStorage.setItem('db_user', body_string);
		console.log("DBUSER FROM INITIAL LOGIN:", window.sessionStorage.getItem("db_user"))
		}
	return (
		<div>
			<p>{props.bucket_id}</p>
		</div>
	)
}

export default Files