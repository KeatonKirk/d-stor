import { useViewerRecord } from "@self.id/framework"
import { forwardRef, useImperativeHandle } from "react";

const SetRecordInfo = forwardRef ((props, ref) => {
	const record = useViewerRecord('basicProfile')

	useImperativeHandle(ref, () => ({
		update (encString) {
			record.merge({dstor_id: props.encString });
			console.log("ATTEMPTED CERAMIC UPDATED")
			}
	}));
})

export default SetRecordInfo;