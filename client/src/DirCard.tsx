import { useState } from "react";
import { DirItem } from "./types";
import { Link } from "react-router-dom";
import { pathHelper } from "./pathHelper";


export default function DirCard({ dir }: { dir: DirItem }) {
	const [mouseHover, setMouseHover] = useState(false)

	const createDirCard = (original: boolean = false) => (
		<div
			onMouseEnter={() => original && setMouseHover(true)}
			onMouseLeave={() => original && setMouseHover(false)}
		>
			<Link to={pathHelper.setLeadingSlash(encodeURIComponent(dir.publicPath).replace(/%2F/g, "/"))} onClick={() => console.log("CLICKED", dir.publicPath)}>
				{/* display:block on image remove small gapbelow it */}
				{dir.dirPreview && <img src={"/api/" + encodeURIComponent(dir.dirPreview)} style={{ display: "block", width: "100%" }} />}
				<p
					className='dir-title'
					title={dir.itemName} // Tooltip on hover
				>
					{dir.itemName}
				</p>
			</Link>
			{/* <a href={encodeURIComponent()}>
			</a> */}
		</div>
	)

	return ((
		<>
			{createDirCard(true)}
			{/* {mouseHover && createDirCard()} */}
		</>
	)
	)
} 