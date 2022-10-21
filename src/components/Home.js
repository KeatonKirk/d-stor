

const Home = () => {

	
	const handleClick = async () =>{
		window.location.replace('/login')
	}

	return (
		<div>
			<h1>Welcome to the Alpha release of dStor! </h1>
			<p>NOTE: First time users will need to register with Ceramic network and mint an access NFT. Please be paitent during the process! :)</p>
			<p>dStor is currently in development, please see github for full code and roadmap: https://github.com/KeatonKirk/d-stor</p>
			<button
				onClick={handleClick}>
					Enter App
			</button>
		</div>

	)
}

export default Home