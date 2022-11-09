import React from 'react'
import styles from '../style'
import {arrowUp} from '../assets'

const GetStarted = () =>  (
		<div className={`${styles.flexCenter} w-[150px] rounded-full bg-blue-gradient p-[2px] cursor-pointer mt-5`}>
			<div className={`${styles.flexCenter} bg-primary w-[100%] h-[100%] rounded-full`}>
			<a href="https://medium.com/@keatondkirkpatrick/ccc537185eb5">
				<div className={`${styles.flexStart} flex-row`}>
					<p className="font-poppins font-medium text-[18px] leading-[23px] ml-2 mr-2">
						<span className="text-gradient">Learn</span>
					</p>
					<p className="font-poppins font-medium text-[18px] leading-[23px] mr-2">
						<span className="text-gradient">
							More
						</span>
					</p>
				</div>
			</a>
			</div>
		</div>
	)


export default GetStarted