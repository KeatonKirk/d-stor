import {useState, useRef} from 'react'
// This component should fetch list of files from Chainsafe and display them on screen
// will need to proxy the call through the server
const Files = (props) => {
	const [fileList, setFileList] = useState(false)
	const bucket_id_obj = {bucket_id: props.bucket_id}
	const bucket_id = JSON.stringify(bucket_id_obj)
	const files =  useRef([])
	
	const getFiles = async () => {
		console.log("BUCKET ID FROM PROPS IN FILE:", props.bucket_id)
		const api_url = '/get_files'
		const response =  await fetch(api_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: bucket_id
		});	
		const response_json = await response.json()
		for (let file of response_json){
			await files.current.push(file.name)
		}
		// const body_string = JSON.stringify(files)
		console.log("FILE LIST FROM GET FILES:", files)
		setFileList(true)
	}

	getFiles();

	if (files.current.length !== 0) {
		console.log('RENDERING FILES')
			return (
			<div>
				<h2>My Files:</h2>
					{files.current.map(file => (
						<p key={file}>{file}</p>
					))}
			</div>
		);
	} else {
		return('No files to view yet')
	}

		
	}

export default Files