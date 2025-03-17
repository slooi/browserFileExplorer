import express from "express"
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"
import { pathHelper } from "./pathHelper"
import path from "path"

const PORT = 7005
dotenv.config()
const app = express()


/* 
NOTES
- Express automatically decodes :queryPath  Because of this, do NOT use decodeURIComponent. It will cause ERRORS
- /api/ MUST be sent. Not /api%2F   Because of this, the publicPath we send to the client must NOT have a "/" in the beginning as the client will call fetch("/api/"+encodeURIComponent(publicPath)). The "/api/" must be sent as express :queryPath is only equals to the right hand side of "/api/"
*/

const DEFAULT_PATH = (() => {
	if (process.env.DEFAULT_PATH) return pathHelper.setTrailingSlash(process.env.DEFAULT_PATH).replace(/\\/g, "/")
	throw new Error("\t\t\t!!! YOU MUST SET A DEFAULT_PATH VARIABLE IN THE .ENV FILE !!!")
})()	// Make DEFAULT_PATH always end with a /



console.log("DEFAULT_PATH", DEFAULT_PATH)

app.use("/", (req, res, next) => {
	console.log("path hit:\t", decodeURIComponent(req.path))
	next()
})

app.get("/favicon.ico", (req, res) => { res.sendStatus(404) })

app.get("/api/:queryPath(*)", async (req, res) => {
	/* 
		- The leading "/" is NOT included in the queryPath
		NOTES:
		/api/  					->	queryPath === ""
		/api/pixiv 				->	queryPath === "pixiv"
		/api/pixiv/file.png		-> 	queryPath === "pixiv/file.png	"
	*/

	const queryPath = req.params.queryPath
	// make sure absolutePath has no "/" at the end. This path could be a file or a folder
	const absolutePath = path.join(DEFAULT_PATH, queryPath).replace(/\\/g, "/").replace(/\/$/, "")

	try {
		const pathStats = await fs.stat(absolutePath)
		if (pathStats.isDirectory()) {
			// If path user is requesting for is a DIRECTORY
			const dirItems = await getDirItems(absolutePath)
			// console.log("SENDING DIRECTORY ITEMS:\n", dirItems)
			res.json(dirItems)
		} else if (pathStats.isFile()) {
			// If path user is requesting for is a FILE
			res.sendFile(absolutePath)
		} else {
			throw new Error("MY ERROR: NOT A FILE OR DIR")
		}
	} catch (err) {
		res.status(400).json({ error: `${err}` })
		throw err
	}
})

async function getDirItems(dirAbsolutePath: string): Promise<DirItem[]> {
	const dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true })

	return Promise.all(dirEntries.map(async entry => {
		const itemFullPath = dirAbsolutePath + "/" + entry.name
		let dirPreview: null | string = null
		try {
			let type: "file" | "dir";
			if (entry.isFile()) {
				type = "file";
			} else if (entry.isDirectory()) {
				type = "dir";
				dirPreview = await getDirPreview(itemFullPath)
			} else {
				throw new Error("MY ERROR: NOT A FILE OR DIR")
			}
			const publicPath = itemFullPath.replace(DEFAULT_PATH, "")
			return { itemName: entry.name, publicPath, type, dirPreview }
		} catch (err) {
			console.warn(itemFullPath)
			throw new Error("MY ERROR" + `${err}`)
			// return null 
		}
	}))//.then(results => results.filter(Boolean))
}

async function getDirPreview(dirAbsolutePath: string) {
	const dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true })
	for (let i = 0; i < dirEntries.length; i++) {

		// const publicPreviewPath = path.join(dirAbsolutePath, dirEntries[0].name).replace(/\\/g, "/").replace(DEFAULT_PATH, "")
		// console.log("		!!!		", path.join(dirAbsolutePath, dirEntries[0].name).replace(/\\/g, "/"))
		// console.log("		!!!	publicPreviewPath	", publicPreviewPath)
		if (dirEntries[0].isFile()) {
			const publicPreviewPath = path.join(dirAbsolutePath, dirEntries[0].name).replace(/\\/g, "/").replace(DEFAULT_PATH, "")
			// console.log("		!!!		", path.join(dirAbsolutePath, dirEntries[0].name).replace(/\\/g, "/"))
			console.log("		!!!	publicPreviewPath	", publicPreviewPath)
			return publicPreviewPath
		}
	}
	return null
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })