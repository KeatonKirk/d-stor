import React from 'react'
import styles from '../style'
import { discount, cloud_2} from '../assets'
import GetStarted from './GetStarted'

const Hero = () => (
	<section id="home" className={` flex md:flex-row flex-col ${styles.paddingY}`}>
		<div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
			<div className="flex flex-row justify-between items-center w-full">
				<h1 className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100px] leading-[75px]">
					Cloud Storage that works for <br className="sm:block hidden"/> {" "}
					<span className="text-gradient"> Everyone</span>{" "}
				</h1>

			</div>
			<p className={`${styles.paragraph} max-w-[470px] mt-5`}>Own your Data. Own your identity. Fully decentralized and encrypted cloud storage. </p>
			<div className="ss:flex hidden mr-4 md:mr-4 mr-0">
				<GetStarted />
			</div>
		</div>
		<div className={`flex-1 flex ${styles.flexCenter} md:my-0 my-10 relative`}>
			<img src={cloud_2} alt="cloud" className="w-[100%] h-[100%] relative z-[5] mr-10 object-contain"/>
			<div className="absolute z-[0] w-[40%] h-[40%] top-0 pink__gradient" />
			<div className="absolute z-[1] w-[80%] h-[80%] rounded-full bottom-40 white" />
			<div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
		</div>

		<div className={`ss:hidden ${styles.flexCenter}`}>
			<GetStarted />
		</div>
	</section>
	)


export default Hero