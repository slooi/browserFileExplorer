import express from "express"
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"
import { pathHelper } from "./pathHelper"

const PORT = 7005
dotenv.config()
const app = express()


/* 
NOTES
- Express automatically decodes :queryPath  Because of this, do NOT use decodeURIComponent. It will cause ERRORS
- /api/ MUST be sent. Not /api%2F   Because of this, publicPath must NOT have a "/" in the beginning

RULES:
- paths coming in are stripped of their trailing "/" if they have any. Make sure to add "/" back in if need. (Stripping is default, instead of adding "/" as some paths are files not folders)

*/

const DEFAULT_PATH = (() => {
	if (process.env.DEFAULT_PATH) return pathHelper.setTrailingSlash(process.env.DEFAULT_PATH).replace(/\\/g, "/")
	throw new Error("\t\t\t!!! YOU MUST SET A DEFAULT_PATH VARIABLE IN THE .ENV FILE !!!")
})()



console.log("DEFAULT_PATH", DEFAULT_PATH)

app.use("/", (req, res, next) => {
	console.log("path hit:\t", decodeURIComponent(req.path))
	next()
})

import path from "path"
app.get("/favicon.ico", (req, res) => { res.sendStatus(404) })

app.get("/api/:queryPath(*)", async (req, res) => {
	/* 
		- The leading "/" is NOT included in the queryPath
		NOTES:
		/api/  			->	queryPath === ""
		/api/pixiv 		->	queryPath === "pixiv"
	*/

	const queryPath = req.params.queryPath
	const absolutePath = path.join(DEFAULT_PATH, queryPath).replace(/\\/g, "/").replace(/\/$/, "")

	try {
		const pathStats = await fs.stat(absolutePath)
		if (pathStats.isDirectory()) {
			// If path user is requesting for is a DIRECTORY
			const dirItems = await getDirItems(absolutePath)
			console.log("SENDING DIRECTORY ITEMS:\n", dirItems)
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

async function getDirItems(dirAbsolutePath: string) {
	const dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true })

	return Promise.all(dirEntries.map(async entry => {
		const itemFullPath = dirAbsolutePath + "/" + entry.name
		try {
			let type: "file" | "dir";
			if (entry.isFile()) {
				type = "file";
			} else if (entry.isDirectory()) {
				type = "dir";
			} else {
				throw new Error("MY ERROR: NOT A FILE OR DIR")
			}
			const publicPath = itemFullPath.replace(DEFAULT_PATH, "")
			return { itemName: entry.name, publicPath, type } as DirItem
		} catch (err) {
			console.warn(itemFullPath)
			throw new Error("MY ERROR" + `${err}`)
			// return null 
		}
	}))//.then(results => results.filter(Boolean))
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })