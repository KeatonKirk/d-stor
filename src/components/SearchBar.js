import React, {useRef, useState, useEffect} from 'react';
import folderIcon from '../assets/folder.png';

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
		}
	}
		if (filesRef.current[fileResult]) {
			console.log('file clicked:', filesRef.current[fileResult])
			currentFolderRef.current = await filesRef.current[fileResult][2]
			setSearchResults(fileResult)
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
					results.push(file)
				}
			}
			for (let folder of foldersRef.current) {
					const foldersArray = folder.split('/')
					const lastFolder = foldersArray[foldersArray.length - 1]
				if (lastFolder.toLowerCase().includes(search)) {
					results.push(lastFolder)
				}
			}
			setResults(results)
		} 
	}, [isSearching, search, filesRef])

	return (
		<div>
			<input ref={searchRef} onChange={handleSearch} type="text" placeholder="Search" />
			{isSearching && (
			<div syle={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
				{results.map(result => (
					<div key={result} style={{display: 'flex', alignItems: 'center'}}>
						<button onClick={handleSearchClick}>{result}
							</button>
					</div>
				))}
			</div>
		)}
		</div>
	)
}

export default SearchBar