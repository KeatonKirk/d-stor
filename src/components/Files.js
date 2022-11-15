import {useRef} from 'react'
import Download from './Download'
import styles, {layout} from '../style'
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
		return (
		<>
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
										<span> Download</span>
									</th>
								</tr>
							</thead>
							<tbody
								className="bg-white divide-y divide-gray-200"
							>
								{files.current.map(file => (
									<tr className="hover:bg-slate-400">
									<td className="" key={file}>{file}</td>
									<td><Download bucket_id={bucket_id_obj} file_name={file} files={prop_files} /> </td>  
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