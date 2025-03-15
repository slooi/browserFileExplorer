import express from "express"
import fs from "fs/promises"
import path from "path"
import { DirItem } from "./client/src/types"
const PORT = 7005
const app = express()


const DEFAULT_PATH = path.resolve("C:/Users/Sam/Downloads/dl/gallery-dl/")

// app.use(express.static(DEFAULT_PATH))

app.use("/", (req, res, next) => {
	console.log("path hit:", req.path)
	next()
})

app.get("/", async (req, res) => {
	var queryPath = req.query.path ? req.query.path as string : DEFAULT_PATH;
	console.log("queryPath: ", queryPath)

	try {

		const queryPathStats = await fs.stat(queryPath)
		if (queryPathStats.isDirectory()) {
			// send dirItems
			const dirItems = await getDirItems(queryPath)
			console.log("SENDING", dirItems)
			res.json(dirItems)
		} else if (queryPathStats.isFile()) {
			// send file
			res.sendFile(queryPath)
		} else {
			throw new Error("MY ERROR: NOT A FILE OR DIR")
		}
	} catch (err) {
		console.warn("MY ERROR", err)
		res.status(400).json({ error: `${err}` })
	}
})

async function getDirItems(queryPath: string) {
	const dirContent = await fs.readdir(queryPath)

	const dirItemPromises = dirContent.map(async itemName => {
		const fullPath = path.join(queryPath, itemName)

		const stats = await fs.stat(fullPath)
		let type: "file" | "dir";
		if (stats.isFile()) {
			type = "file";
		} else if (stats.isDirectory()) {
			type = "dir";
		} else {
			throw new Error("MY ERROR: NOT A FILE OR DIR")
		}

		return { itemName, fullPath, type } as DirItem
	})
	return Promise.all(dirItemPromises)
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })