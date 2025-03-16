import express from "express"
import fs from "fs/promises"
import { DirItem } from "./client/src/types"
import dotenv from "dotenv"

const PORT = 7005
dotenv.config()
const app = express()


const DEFAULT_PATH = process.env.DEFAULT_PATH || "/";
console.log("DEFAULT_PATH", DEFAULT_PATH)

app.use("/public", express.static(DEFAULT_PATH))

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
			// res.sendFile(queryPath)
			throw new Error("MY UNEXPECTED: THIS SHOULDN'T BE HAPPENING")
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


		const publicPath = "/public" + fullPath.replace(DEFAULT_PATH, "")
		console.log("\n\nrelativePath\n", publicPath, "\n", fullPath)
		return { itemName, fullPath, publicPath, type } as DirItem
	})
	return Promise.all(dirItemPromises)
}

app.listen(PORT, () => { console.log("LISTENING ON PORT " + PORT) })