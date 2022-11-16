import { Progress } from "@material-tailwind/react";
 
export default function ProgressBar(props) {
	console.log('percentage in progress bar:', props.loading)
  return <Progress value={props.loading} label="Completed" color="blue" />;
}