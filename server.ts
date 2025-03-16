import express from "express"
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"

const PORT = 7005
dotenv.config()
const app = express()


const DEFAULT_PATH = process.env.DEFAULT_PATH || "/";
console.log("DEFAULT_PATH", DEFAULT_PATH)

// app.use("/public", express.static(DEFAULT_PATH))

app.use("/", (req, res, next) => {
	console.log("path hit:", decodeURIComponent(req.path))
	next()
})


app.get("/favicon.ico", (req, res) => { res.sendStatus(404) })

app.get("/*", async (req, res) => {
	const relativePath = decodeURIComponent(req.path)
	const absolutePath = relativePath === "/" ? DEFAULT_PATH : DEFAULT_PATH + relativePath

	console.log("absolutePath", absolutePath)
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

async function getDirItems(queryPath: string) {
	const dirContent = await fs.readdir(queryPath)

	const dirItemPromises = dirContent.map(async itemName => {
		const fullPath = queryPath + "/" + itemName

		const stats = await fs.stat(fullPath)
		let type: "file" | "dir";
		if (stats.isFile()) {
			type = "file";
		} else if (stats.isDirectory()) {
			type = "dir";
		} else {
			throw new Error("MY ERROR: NOT A FILE OR DIR")
		}

		const publicPath = fullPath.replace(DEFAULT_PATH, "")
		console.log("\n\nrelativePath\n", publicPath, "\n", fullPath)
		return { itemName, fullPath, publicPath, type } as DirItem
	})
	return Promise.all(dirItemPromises)
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })