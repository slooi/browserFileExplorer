import express from "express"
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"

const PORT = 7005
dotenv.config()
const app = express()

/* 
NOTES
- relativePath: this is used by the client to get resources. AbsolutePath is NOT used here as client should only be able to get resources relative to the DEFAULT_PATH
- absolutePath: this is used only for the server. It allows it to read directories. It's just DEFAULT_PATH + relativePath


RULES:
- paths coming in are stripped of their trailing "/" if they have any. Make sure to add "/" back in if need. (Stripping is default, instead of adding "/" as some paths are files not folders)
*/

const DEFAULT_PATH = process.env.DEFAULT_PATH || "/";
console.log("DEFAULT_PATH", DEFAULT_PATH)

app.use("/", (req, res, next) => {
	console.log("path hit:", decodeURIComponent(req.path))
	next()
})


app.get("/favicon.ico", (req, res) => { res.sendStatus(404) })

app.get("/api/:queryPath(*)", async (req, res) => {
	console.log("req.params.queryPath", req.params.queryPath)

	console.log("\n\t\t ### NEW REQUEST ###")
	const relativePath = decodeURIComponent(req.params.queryPath)
	const absolutePath = DEFAULT_PATH + relativePath.replace(/$\//, "")

	console.log("# relativePath:", relativePath, "\tabsolutePath:", absolutePath)
	try {
		console.log("$$$$$$$$$wai")
		const pathStats = await fs.stat(absolutePath)
		console.log(" %%%%%%%%%%%wai 2")
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

async function getDirItems(dirAbsolutePath: string) {
	const dirContent = await fs.readdir(dirAbsolutePath)

	const dirItemPromises = dirContent.map(async itemName => {
		const itemFullPath = dirAbsolutePath + "/" + itemName

		const stats = await fs.stat(itemFullPath)
		let type: "file" | "dir";
		if (stats.isFile()) {
			type = "file";
		} else if (stats.isDirectory()) {
			type = "dir";
		} else {
			throw new Error("MY ERROR: NOT A FILE OR DIR")
		}

		const publicPath = itemFullPath.replace(DEFAULT_PATH, "")
		// console.log("publicPath \t", publicPath, "\t", "DEFAULT_PATH\t", DEFAULT_PATH, "\n\nitemFullPath\t", itemFullPath, "itemName\t", itemName, "dirAbsolutePath", dirAbsolutePath)
		return { itemName, publicPath, type } as DirItem
	})
	return Promise.all(dirItemPromises)
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })