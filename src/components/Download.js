import React from 'react'

function Download(props) {

const file_list = props.files
const file_path = file_list[props.file_name]
const bucket_id = props.bucket_id

const handleClick = async () => {
	console.log('click handler')
	const body = {
		bucket_id: bucket_id,
		file_path: file_path
	}
	const body_string = JSON.stringify(body)
	const api_url = '/download'
	const response = await fetch(api_url, {
		method: 'POST',
		body: body_string
	})
	// send chainsafe download to server
	// get and decrypt file
}
	return (
		<>
		<button onClick={handleClick}>Download</button>
		</>
	)
}

export default Download