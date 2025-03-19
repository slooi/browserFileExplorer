import express, { Response } from "express"
import { Dirent, Stats } from 'fs';
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"
import { pathHelper } from "./pathHelper"
import path from "path"
import { Logger } from "./Logger"

const PORT = 7005
dotenv.config()
const app = express()


/* 
NOTES
- Express automatically decodes :queryPath  Because of this, do NOT use decodeURIComponent. It will cause ERRORS
- /api/ MUST be sent. Not /api%2F   Because of this, the publicPath we send to the client must NOT have a "/" in the beginning as the client will call fetch("/api/"+encodeURIComponent(publicPath)). The "/api/" must be sent as express :queryPath is only equals to the right hand side of "/api/"
*/


/* 
ERROR TYPES:

ENOENT				File/folder doen't exist. You got your path wrong or path no longer exists			404	"File not found"
EPERM or EACCES
EINVAL
EPERM
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
		CLIENT PATH VS QUERYPATH ON SERVER:
		/api/  					->	queryPath === ""
		/api/pixiv 				->	queryPath === "pixiv"
		/api/pixiv/file.png		-> 	queryPath === "pixiv/file.png"
	*/
	const queryPath = req.params.queryPath
	// queryPath:  /pixiv/mignon	=>		absolutePath: C:/Users/Name/Downloads/dl/gallery-dl/pixiv/mignon
	let absolutePath = path.join(DEFAULT_PATH, queryPath).replace(/\\/g, "/") // This path could be a file or a folder
	console.log("absolutePath", absolutePath)

	// Get stats
	let pathStats: Stats;
	try {
		pathStats = await fs.stat(absolutePath)
	} catch (err) {
		return handleError(err, res)
	}

	// Handle request
	if (pathStats.isDirectory()) {
		// Handle request for a DIR
		absolutePath = pathHelper.setTrailingSlash(absolutePath) // %2F could cause issues?
		const dirItems = await getDirItems(absolutePath)

		res.json(dirItems)
	} else if (pathStats.isFile()) {
		// If path user is requesting for is a FILE
		res.sendFile(absolutePath)
	} else {
		throw new Error("MY ERROR: NOT A FILE OR DIR")
	}
})

async function getDirItems(dirAbsolutePath: string): Promise<DirItem[]> {
	let dirEntries: Dirent[] = []
	try { dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true }) } catch (err: unknown) { handleError(err) }

	const maxNameLength = Math.max(...dirEntries.map(entry => entry.name.length));
	dirEntries.forEach(entry => {
		console.log(
			entry.name.padEnd(maxNameLength + 2),
			(entry.isFile() ? "file" :
				entry.isDirectory() ? "dir" :
					entry.isSymbolicLink() ? "symbolicLink" : "!!!!!!!!!!!"
			).padEnd(15)
		);
	});

	return await Promise.all(dirEntries.filter(entry => !entry.isSymbolicLink()).map(async (entry): Promise<DirItem> => {
		const itemFullPath = dirAbsolutePath + entry.name
		const publicPath = itemFullPath.replace(DEFAULT_PATH, "")

		if (entry.isDirectory()) {
			return {
				itemName: entry.name,
				publicPath,
				type: "dir",
				dirPreview: await getDirPreview(itemFullPath)
			}
		}
		if (entry.isFile()) {
			return {
				itemName: entry.name,
				publicPath,
				type: "file",
				dirPreview: null
			}
		}
		throw new Error("MY ERROR: Not a file or dir or symbolic link")
	}))
}

async function getDirPreview(dirAbsolutePath: string) {
	let dirEntries: Dirent[] = []
	try {
		dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true })
	} catch (err) {
		handleError(err)
	}
	for (let i = 0; i < dirEntries.length; i++) {
		const entry = dirEntries[i]
		if (entry.isFile()) {
			const publicPreviewPath = path.join(dirAbsolutePath, entry.name).replace(/\\/g, "/").replace(DEFAULT_PATH, "")
			return publicPreviewPath
		}
	}
	return null
}

function handleError(err: unknown, res?: Response) {
	if ((err as NodeJS.ErrnoException).code === "EPERM") {
		if (res) {
			Logger.warn(err)
			res.status(403).json({ error: err })
			return
		}
	}

	Logger.errorAndTrace(err)
	throw err
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })