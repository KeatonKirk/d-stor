import React, {useRef, useState, useEffect} from 'react';
import folderIcon from '../assets/folder.png';
import { AiFillFileText } from "react-icons/ai";

function SearchBar({filesRef, foldersRef, currentFolderRef, setSearchResults}) {
	const [search, setSearch] = useState('')
	const [results, setResults] = useState([])
	const [isSearching, setIsSearching] = useState(false)
	const [imageIcon, setImageIcon] = useState(<img style={{width: '15px', height: '15px', marginRight: '10px'}} src={folderIcon} alt="folder" />)

	const searchRef = useRef()

	const handleSearch = (e) => {
		console.log(e.target.value)
		setSearch(e.target.value.toLowerCase())
	}

	const handleSearchClick = async (e) => {
		//e.preventDefault()
		const fileResult = e.target.innerText
		const folderResult = '/' + e.target.innerText
		console.log('search clicked', search, folderResult)
		for (let folder of foldersRef.current) {
		if (folder.includes(fileResult)) {
			currentFolderRef.current = await folder
			setSearchResults(fileResult)
			setImageIcon(<img style={{width: '15px', height: '15px', marginRight: '10px'}} src={folderIcon} alt="folder" />)
		}
	}
		if (filesRef.current[fileResult]) {
			console.log('file clicked:', filesRef.current[fileResult])
			currentFolderRef.current = await filesRef.current[fileResult][2]
			setSearchResults(fileResult)
			setImageIcon(<AiFillFileText size={20}/>)
		}
		console.log('current folder after click in search:', currentFolderRef.current)
		setSearch('')
		searchRef.current.value = ''
	}

	useEffect(() => {
		if (search.length > 0) {
			setIsSearching(true)
		} else {
			setIsSearching(false)
			setResults([])
		}
	}, [search])

	useEffect(() => {
		const results = []
		console.log('searching...', search, results, isSearching)
		
		if (isSearching) {
			
			for (let file of Object.keys(filesRef.current)) {
				if (file.toLowerCase().includes(search)) {
					const icon = <AiFillFileText style={{marginRight: '5px'}} size={20} />
					results.push({item: file, icon: icon})
				}
			}
			for (let folder of foldersRef.current) {
					const foldersArray = folder.split('/')
					const lastFolder = foldersArray[foldersArray.length - 1]
				if (lastFolder.toLowerCase().includes(search)) {
					const icon = <img style={{width: '15px', height: '15px', marginRight: '10px'}} src={folderIcon} alt="folder" />
					results.push({item: lastFolder, icon: icon})
				}
			}
			setResults(results)
		} 
	}, [isSearching, search, filesRef])

	return (
		<div>
			<p className="font-poppins font-semibold xs:text-[35px] text-black xs:leading-[76.8px] leading-[66.8px] w-full" style={{fontSize: '30px'}}>Search</p>
			<input style={{ border: '1px solid #ccc' }} ref={searchRef} onChange={handleSearch} type="text" placeholder="Search" />
			{isSearching && (
			<div syle={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
				{results.map(result => (
					<div key={result.item} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
						
							<button className="hover:bg-gray-300 rounded-md" onClick={handleSearchClick}>
								<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
									{result.icon}
									{result.item}
								</div>
							</button>
						
					</div>
				))}
			</div>
		)}
		</div>
	)
}

export default SearchBar