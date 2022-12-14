import styles from '../style'
import Hero from '../style_components/Hero'
import Business from '../style_components/Business'
import Billing from '../style_components/Billing'
import Navbar from '../style_components/Navbar'
const Home = () => {

	
	const handleClick = async () =>{
		window.location.replace('/login')
	}

	return (
    <>
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </ div>
      </div>
    </div>

      <div className={`bg-primary ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>

      <div className={`bg-primary ${styles.paddingX} ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>

          <Business />
          <Billing />

        </ div>
      </div>
    </>

	)
}

export default Home