import React, {useState} from 'react'
import { close, logo_white, menu } from '../assets'



function AppNavbar(props) {
	const [ toggle, setToggle] = useState(false)
	
	const navButton = (window.location.pathname === '/login' ? props.handleClick : props.handleDisconnect)
	const navText = (window.location.pathname === '/login' ? 'Connect Wallet' : 'Disconnect')

	const navLinks = [
		{
			id: "Enter App",
			title: "Enter App",
		},
		{
			id: "Connect Wallet",
			title: "Connect Wallet"
		}
	];


	return (
		<nav className="w-full flex py-3 justify-between items-center navbar">
			<a href="/">
				<img src={logo_white} alt="dstor" className=" ml-0 w-[85px] h-[75px]"/>
			</a>
			

			<div className="hidden sm:ml-6 sm:block">
          <div className="flex space-x-4">
            <button className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700" onClick={navButton} aria-current="page">{navText}</button>
          </div>
        </div>

			<div className="sm:hidden flex flex-1 justify-end items-center">
					<img 
					src={toggle? close : menu} 
					alt="Menu" 
					className="w-[28px] h-[28px] object-contain"
					onClick={() => setToggle((prev) => !prev)}
					/>
					<div
					className={`${toggle? 'flex' : 'hidden'} p-6 bg-black-gradient absolute top-20 right-0 mx-4 min-w-[140px] rounded-xl sidebar`}
					>
					<ul className="list-none flex-col justify-end items-center flex-1">
					{navLinks.map((nav, index) => (
						<li
						key={nav.id}
						className={`font-poppins font-normal cursor-pointer text-[16px] text-white ${index === navLinks.length -1 ? `mr-0` : `mb-4`} mr-10`}>
							<a href={`#${nav.id}`}>
								{nav.title}
							</a>
						</li>
						))}
					</ul>
					</div>
			</div>
		</nav>
	)
}

export default AppNavbar