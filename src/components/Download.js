import React from 'react'

function Download(props) {

const handleClick = async () => {
	console.log('click handler')
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