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


/* 
ERROR TYPES:

ENOENT				File/folder doen't exist. You got your path wrong or path no longer exists			404	"File not found"
EPERM or EACCES		No permission to access		403	"Permission denied"
EINVAL				Invalid argument			400	"Invalid file request"
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
		NOTES:
		/api/  					->	queryPath === ""
		/api/pixiv 				->	queryPath === "pixiv"
		/api/pixiv/file.png		-> 	queryPath === "pixiv/file.png	"
	*/

	const queryPath = req.params.queryPath
	let absolutePath = path.join(DEFAULT_PATH, queryPath).replace(/\\/g, "/") // This path could be a file or a folder

	try {
		console.log("ayayaya")
		console.log("absolutePath", absolutePath)
		const pathStats = await fs.stat(absolutePath)

		console.log(" !@# ayayaya")
		if (pathStats.isDirectory()) {
			absolutePath = pathHelper.setTrailingSlash(absolutePath) //%2F could cause issues?
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
	} catch (err: unknown) {
		if (err instanceof Error) {
			let nodeErr = err as NodeJS.ErrnoException
			if (nodeErr.syscall === "stat" && nodeErr.code === "EPERM") {
				console.warn(err)
				res.status(500).json({ error: nodeErr })
				return
			}
			console.trace()
			console.log(" 		!!!!!!!!!!@@@@@@@@@@@@@@@@@@@@@@@@@@!!!!!!!!	")
		}
		res.status(400).json({ error: `${err}` })
		throw err
	}
})

async function getDirItems(dirAbsolutePath: string): Promise<DirItem[]> {
	let dirEntries = []
	try {
		dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true })
	} catch (err: unknown) {
		console.trace()
		console.warn("getDIRITEMS WARN")
		if (err instanceof Error) {
			console.log("err", (err as NodeJS.ErrnoException).code);
			console.log("err", (err as NodeJS.ErrnoException).syscall);
		}
		throw err
	}
	console.log("dirAbsolutePath", dirAbsolutePath)
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
	const a = await Promise.all(dirEntries.map(async entry => {
		const itemFullPath = dirAbsolutePath + entry.name
		let dirPreview: null | string = null
		try {
			let type: "file" | "dir";
			if (entry.isFile()) {
				type = "file";
			} else if (entry.isDirectory()) {
				type = "dir";
				dirPreview = await getDirPreview(itemFullPath)
			} else if (entry.isSymbolicLink()) {
				return null
			} else {
				throw new Error("MY ERROR: NOT A FILE OR DIR")
			}
			const publicPath = itemFullPath.replace(DEFAULT_PATH, "")
			return { itemName: entry.name, publicPath, type, dirPreview }
		} catch (err: unknown) {
			console.trace()
			console.warn("MY WARN (entry):", entry.isFile())
			console.warn("MY WARN (entry):", entry.isDirectory())
			console.warn("MY WARN (itemFullPath):", itemFullPath)
			console.log("Unexpected error", err);
			throw err
			// return null 
		}
	})).then(results => results.filter((v): v is NonNullable<typeof v> => v !== null)); // This 
	return a
}

async function getDirPreview(dirAbsolutePath: string) {
	let dirEntries = []
	try {
		dirEntries = await fs.readdir(dirAbsolutePath, { withFileTypes: true })
	} catch (err: unknown) {
		console.trace()
		if (err instanceof Error) {
			const nodeErr = err as NodeJS.ErrnoException
			if (nodeErr.code === "EPERM") {
				console.warn("I AM A WARNING:", err)
				console.log("err (getDirPreview)", (nodeErr).code);
				console.log("err (getDirPreview)", (nodeErr).syscall);
				return null
			}
		}
		throw err
	}
	for (let i = 0; i < dirEntries.length; i++) {

		const entry = dirEntries[i]
		// const publicPreviewPath = path.join(dirAbsolutePath, entry.name).replace(/\\/g, "/").replace(DEFAULT_PATH, "")
		// console.log("		!!!		", path.join(dirAbsolutePath, entry.name).replace(/\\/g, "/"))
		// console.log("		!!!	publicPreviewPath	", publicPreviewPath)
		if (entry.isFile()) {
			const publicPreviewPath = path.join(dirAbsolutePath, entry.name).replace(/\\/g, "/").replace(DEFAULT_PATH, "")
			// console.log("		!!!		", path.join(dirAbsolutePath, entry.name).replace(/\\/g, "/"))
			console.log("		!!!	publicPreviewPath	", publicPreviewPath)
			return publicPreviewPath
		}
	}
	return null
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })