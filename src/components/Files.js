import {useRef, useState, useEffect} from 'react'
import Download from './Download'
import folderIcon from '../assets/folder.png'
import { HiDotsVertical, HiTrash, HiPencil } from "react-icons/hi";
import RenameFile from './RenameFile'
import DeleteFile from './DeleteFile'


const Files = ({bucket_id, filesRef, foldersRef, currentFolderRef, modalIsOpen, searchResults, user}) => {

	const filesArrayRef =  useRef([])
	const files = filesRef.current
	const [currentFiles, setCurrentFiles] = useState(filesRef.current)
	const [currentFolders, setCurrentFolders] = useState(['/'])
	const [showOptions, setShowOptions] = useState(null)
	const [editingName, setEditingName] = useState(null)
	const [deletingFile, setDeletingFile] = useState(null)
	const [downloading, setDownloading] = useState(false)
	const user_files = Object.keys(filesRef.current)
	const prop_files = filesRef.current

	console.log('nav button array:', currentFolderRef.current, currentFolderRef.current === '/' ? 'Home' : currentFolderRef.current.split('/'))
	function getCurrentFolders () {
		const directDescendants = foldersRef.current.filter(folder => {
			// Check if the folder starts with the current folder path followed by a slash
			const grandChildren = folder.replace(currentFolderRef.current + '/', '');
			const isDirectDescendant = folder.startsWith(currentFolderRef.current + "/") && !grandChildren.slice(1).includes('/');
			// If the current folder is '/', only return folders that don't have additional slashes
			console.log('folder slice:', folder, folder.slice(1), folder.slice(1).includes('/'))
			const isRootDirectDescendant = currentFolderRef.current === '/' && !folder.slice(1).includes('/');
			return isDirectDescendant || isRootDirectDescendant;
		});
	
		return directDescendants;
	}

	const foldersArrayRef = useRef(getCurrentFolders())

	for (let file of user_files){
		if (!filesArrayRef.current.includes(file) && prop_files[file][2] === currentFolderRef.current) {
			filesArrayRef.current.push(file) 
		}
	}
	console.log('Files Ref passed from storage:', bucket_id, filesRef.current, currentFolderRef.current, user_files)
	console.log('modal open:', modalIsOpen)

		const handleFolderChange = async (folder) => {
			console.log('FOLDER CLICKED:', folder, filesRef.current)
			currentFolderRef.current = await folder
			foldersArrayRef.current = await getCurrentFolders()
			filesArrayRef.current = []
			console.log('FILES AFTER FOLDER CLICK:', filesRef.current)
			for (let file of user_files){
				console.log('current folder after folder click:', currentFolderRef.current)
				if (prop_files[file][2] === currentFolderRef.current) {
					filesArrayRef.current.push(file)
				}
			}
			setCurrentFiles(filesArrayRef.current)
			console.log('FILES AFTER FOLDER CLICK:', filesArrayRef.current)
		}

		const handleOptionsClick = (file) => {
			console.log('options clicked:', file)
			setShowOptions(file)
		}

		const handleEditNameClick = (file) => {
			console.log('edit name clicked:',file)
			setEditingName(file)
		}

		const handleDeleteClick = (file) => {
			console.log('delete clicked:', file)
			setDeletingFile(file)
			setShowOptions(null)
		}


		useEffect(() => {
			handleFolderChange(currentFolderRef.current)
			setCurrentFolders(currentFolderRef.current === '/' ? '/' : currentFolderRef.current.split('/'))
			console.log('current folders from useEffect:', currentFolderRef.current )
		}
		, [foldersRef.current, currentFolderRef.current, searchResults])


	if (filesArrayRef.length !== 0) {
		return (
		<>
			<div style={{display: 'flex', flexDirection: 'row', marginBottom: '20px'}}>
				<button className="hover:bg-gray-300 rounded-md" style={{fontWeight: 'bold', marginRight: '10px'}} onClick={() => handleFolderChange('/', user_files, prop_files)}>Home</button>
				{currentFolderRef.current.split('/').map((folder, index) => {
					const path = currentFolderRef.current.split('/').slice(0, index + 1).join('/');
					console.log('folder nav info:', currentFolderRef.current, currentFolderRef.current.split('/'), path, folder, index)
					if (path === '' || path === '/') {
						return (null)
					} else {
					return (
						<div key={index}>
							{'>'}
							<button className="hover:bg-gray-300 rounded-md" style={{fontWeight: 'bold',marginRight: '10px', marginLeft: '10px'}} onClick={() => handleFolderChange(path, user_files, prop_files)}> {folder} </button>
						</div>
					)
					}
				})}
			</div>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				{foldersArrayRef.current.map(folder => {
					const replaceValue = (currentFolderRef.current === '/' ? currentFolderRef.current : currentFolderRef.current + '/');
					const newName = folder.replace(replaceValue, '');
					console.log('folder rendering info:', folder, newName, currentFolderRef.current)
					return (
						<div key={folder} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
							<button onClick={() =>handleFolderChange(folder)}>
								<div style={{display: 'flex', alignItems: 'center'}}>
									<img src={folderIcon} alt="folder" style={{width: '20px', height: '20px', marginRight: '10px'}}/>
									<span style={{fontSize: '16px'}}>{newName}</span>
								</div>
							</button>
						</div>
					)}
				)}
			</div>

			<div className="mt-2 flex flex-col">
				<div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
					<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
						<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<span> Files</span>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<span> Options</span>
										</th>
									</tr>
								</thead>
								<tbody
									className="bg-white divide-y divide-gray-200"
								>
									{filesArrayRef.current.map(file => (
										<tr className="hover:bg-slate-400">
											{editingName === file ? (
												<RenameFile setShowOptions={setShowOptions} user={user} file={file} setEditingName={setEditingName} />
											) : (
												<>
										<td className="" key={file}>{file}</td>
										<td style={{display: 'flex', marginLeft: '30px'}}>
											<button onClick={() => handleOptionsClick(file)}><HiDotsVertical size={30}/></button>
											{showOptions === file && (
												<div className="absolute z-10">
													<div className="fixed inset-0" onClick={() => setShowOptions(null)} />
													<div className="origin-top-left absolute right-auto w-56 mt-2 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
														<div className="py-1" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
															<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
																<button style={{width: '100%'}} className="block hover:bg-gray-300 rounded-md" onClick={() => handleEditNameClick(file)}>Edit</button>
															</div>
															<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center'}}>
																<button style={{width: '100%'}}onClick={() => handleDeleteClick(file)}className="block hover:bg-gray-300 rounded-md">Delete</button>
															</div>
															<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center'}}>
																<Download setShowOptions={setShowOptions} bucket_id={bucket_id} file_name={file} files={prop_files} />
															</div>
														</div>
													</div>
												</div>
											)}
										</td> 
										</>
											)} 
											<td>
										{deletingFile === file && (
											<DeleteFile user={user} bucket_id={bucket_id} currentFolderRef={currentFolderRef} file={file} setDeletingFile={setDeletingFile} deletingFile={deletingFile} />
										)}
										</td>
								</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</>
		);
	} else {
		return('No files to view yet')
	}
	}

export default Files