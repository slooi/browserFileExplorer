import fs from "fs"



export const Logger = {
	errorAndTrace: (...args: any[]) => {
		console.error("   !!! ERROR !!!")
		console.error(...args)
		console.trace()

		writeToLog("   !!! ERROR !!!\n" + args.join(" ") + "\n" + console.trace())
	},
	error: (...args: any[]) => {
		console.error("   !!! ERROR !!!")
		console.error(...args)

		writeToLog("   !!! ERROR !!!\n" + args.join(" ") + "\n")
	},
	warn: (...args: any[]) => {
		console.warn("   !!! WARNING !!!")
		console.warn(...args)

		writeToLog("   !!! WARNING !!!\n" + args.join(" ") + "\n")
	},
	log: (...args: any[]) => {
		console.log(...args)

		writeToLog(args.join(" ") + "/n")
	}
}

function writeToLog(logMessage: string) {
	fs.writeFile(".log.txt", logMessage, (err) => { if (err) throw err })
}