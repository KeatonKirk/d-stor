import React from 'react'
import styles, {layout} from '../style'
import { send, shield, star  } from "../assets";
import Button from './Button'

const features = [
  {
    id: "feature-1",
    icon: star,
    title: "User-Centric Data",
    content:
      "Ceramic Network securely stores your decryption keys on a decentralized network",
  },
  {
    id: "feature-2",
    icon: shield,
    title: "100% Secured",
    content:
      "Lit Protocol provides decentralized, client-side encryption. Your files never leave your machine unencrypted. ",
  },
  {
    id: "feature-3",
    icon: send,
    title: "IPFS",
    content:
      "Files are stored by levaraging cutting-edge storage network of IPFS and Filecoin.",
  },
];

const FeatureCard = ({icon, title, content, index}) => (
	<div className={`flex flex-row p-6 rounded-[20px] ${index !== features.length - 1 ? "mb-6" : "mb-0"} feature-card`}>
		<div className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}>
			<img src={icon} alt="icon" className="w-[50%] h-[50%] object-contain" />
		</div>
		<div className="flex-1 flex flex-col ml-3">
			<h4 className="font-poppins font-semibold text-white text-[18px] leading-[23px] mb-1"> {title}</h4>
			<p className="font-poppins font-normal text-dimWhite text-[16px] leading-[24px] mb-1"> {content}</p>
		</div>
	</div>
)

const Business = () => (
	<section id="features" className={layout.section}>
		<div className={layout.sectionInfo}>
			<h2 className={styles.heading2}>
				Secure, Private, Decentralized <br className="sm:block hidden"/>
			</h2>
			<p className={`${styles.paragraph} max-w-[470px] mt-5`}>dStor's fully decentralized Stack means YOU own your files, and your identity.</p>
			<Button styles="mt-10"/>
		</div>
		 
		 <div className={`${layout.sectionImg} flex-col`}>
			{features.map ((feature, index) => (
				<FeatureCard key={feature.id} {... feature} index={index} />
			))}

		 </div>
	</section>
	)


export default Business