import {useRef} from 'react'
import Download from './Download'
import styles from '../style'
const Files = (props) => {
	const bucket_id_obj = {bucket_id: props.bucket_id}

	const files =  useRef([])
	const user_files = Object.keys(props.files)
	const prop_files = props.files
	console.log('USER FILES object FROM FILES COMP:', props.files)

		for (let file of user_files){
			if (!files.current.includes(file)) {
				files.current.push(file) 
			}
			

		}
		console.log('FILES LIST:', files.current)

	if (files.length !== 0) {
		console.log('RENDERING FILES')

			return (
				<>
				<h2 className='font-poppins font-semibold text-[30px]'>My files:</h2>
				<div className="w-[30%]">
					<ul className="">
							{files.current.map(file => (
								<>
									<li className="hover:list-disc hover:bg-slate-200 " key={file}>{file}  <Download bucket_id={bucket_id_obj} file_name={file} files={prop_files} /></li>
								</>
							))}
					</ul>
				</div>
			</>

		);
	} else {
		return('No files to view yet')
	}

		
	}

export default Files