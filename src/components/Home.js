

const Home = () => {

	return (
		<div>
			<h1>Welcome to the Alpha release of dStor! </h1>
			<p>dStor is currently in development, please see github for full code and roadmap: https://github.com/KeatonKirk/d-stor</p>
			<button
				onClick={ () => {;
					window.location.replace('/login')
				}}>
					Enter App
			</button>
		</div>

	)
}

export default Home