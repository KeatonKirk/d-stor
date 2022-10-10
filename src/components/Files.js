
// This component should fetch list of files from Chainsafe and display them on screen
// will need to proxy the call through the server
const Files = (props) => {

	const bucket_id_obj = {bucket_id: props.bucket_id}
	const bucket_id = JSON.stringify(bucket_id_obj)
	let response_json;
	let files = []
	const getFiles = async (bucket_id) => {
		console.log("BUCKET ID FROM PROPS IN FILE:", props.bucket_id)
		const api_url = '/get_files'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: bucket_id
		});	
		response_json = await response.json()
		const body_string = JSON.stringify(response_json)
		console.log("FILE LIST FROM GET FILES:", body_string)

		return response_json
		}
		getFiles(bucket_id);
		for (let file in response_json){
			files.push(file)
		}
		console.log('FILES LIST:', files)

		if (files.length === 0) {
			return (
			<div>
				<h1>My Files:</h1>
				<p>{files}</p>
			</div>
			)
		}

	return (
		<div>
			<h1>My Files:</h1>
			<p>Loading...</p>
		</div>
	)
}

export default Files