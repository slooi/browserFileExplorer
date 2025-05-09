import express, { Response } from "express"
import { Dirent, Stats } from 'fs';
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"
import { pathHelper } from "./pathHelper"
import path from "path"
import { Logger } from "./Logger"
import { exec } from "child_process"

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
const DL_PATH = (() => {
	if (process.env.DL_PATH) return pathHelper.setTrailingSlash(process.env.DL_PATH).replace(/\\/g, "/")
	throw new Error("\t\t\t!!! YOU MUST SET A DL_PATH VARIABLE IN THE .ENV FILE !!!")
})()	// Make DEFAULT_PATH always end with a /


console.log("DEFAULT_PATH", DEFAULT_PATH)

app.use(express.json());
app.use("/", (req, res, next) => {
	console.log("path hit:\t", decodeURIComponent(req.path))
	next()
})

app.post("/api/dl/", (req, res) => {
	console.log("POST /api/dl hit")

	const { title } = req.body;
	const parsedTitle = decodeURIComponent(title)
	if (!title) {
		res.status(400).json({ success: false, message: "Title is required" });
		return
	}

	const command = `gallery-dl "${parsedTitle}"`;
	const cwd = DL_PATH; //!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#

	exec(command, { cwd }, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error.message}`);
			res.status(500).json({ success: false, message: error.message });
			return
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
		}
		console.log(`stdout: ${stdout}`);
		res.json({ success: true, stdout, stderr }).status(200);
	});
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

	const datedDirItems = await Promise.all(dirEntries.filter(entry => !entry.isSymbolicLink()).map(async (entry): Promise<DirItem & { time: Date | null }> => {
		const itemFullPath = dirAbsolutePath + entry.name
		const publicPath = itemFullPath.replace(DEFAULT_PATH, "")

		if (entry.isDirectory()) {
			return {
				itemName: entry.name,
				publicPath,
				type: "dir",
				dirPreview: await getDirPreview(itemFullPath),
				time: (await fs.stat(itemFullPath)).mtime
			}
		}
		if (entry.isFile()) {
			return {
				itemName: entry.name,
				publicPath,
				type: "file",
				dirPreview: null,
				time: null
			}
		}
		throw new Error("MY ERROR: Not a file or dir or symbolic link")
	}))

	const sortedDirItems = datedDirItems.sort((a, b) => {
		if (a.time === null && b.time === null) {
			return 0; // Keep original order if both times are null
		} else if (a.time === null) {
			return 1; // Move `a` after `b` (null times go last)
		} else if (b.time === null) {
			return -1; // Move `b` after `a` (null times go last)
		} else {
			return a.time.getTime() - b.time.getTime(); // Move later downloaded to end of list
		}
		// Order: files, folders([oldest,old,new,newest])
	});

	return sortedDirItems.map(({ time, ...item }) => item)
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