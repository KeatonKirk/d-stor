import {useRef} from 'react'
import Download from './Download'

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
			<div>
				<table className="table-auto ">
					<thead>
						<tr>
							<th className="border border-separate ">File</th>
							<th className="border border-separate ">Download</th>
						</tr>
					</thead>
					<tbody>
					
						{files.current.map(file => (

							<tr>
								<td className="border border-separate " key={file}>{file}</td>
								<td className="border border-separate "><Download bucket_id={bucket_id_obj} file_name={file} files={prop_files} /></td>
							</tr>

						))}
						
					</tbody>

					</table>
			</div>
		);
	} else {
		return('No files to view yet')
	}

		
	}

export default Files