import { useState } from "react";
import { DirItem } from "./types";


export default function DirCard({ dir }: { dir: DirItem }) {
	const [mouseHover, setMouseHover] = useState(false)

	const createDirCard = (original: boolean = false) => (
		<div
			onMouseEnter={() => original && setMouseHover(true)}
			onMouseLeave={() => original && setMouseHover(false)}
		>
			<a href={encodeURIComponent(dir.publicPath)}>
				{/* display:block on image remove small gapbelow it */}
				{dir.dirPreview && <img src={"/api/" + encodeURIComponent(dir.dirPreview)} style={{ display: "block", width: "100%" }} />}
				<p
					className='dir-title'
					title={dir.itemName} // Tooltip on hover
				>
					{dir.itemName}
				</p>
			</a>
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