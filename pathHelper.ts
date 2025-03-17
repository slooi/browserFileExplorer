export const pathHelper = {
	setTrailingSlash: (path: string) => (path[path.length - 1] === "/") ? path : path + "/",
	setLeadingSlash: (path: string) => (path[0] === "/") ? path : "/" + path,
	removeTrailingSlash: (path: string) => path.replace(/\/$/, ""),
	// absolutePath: (...paths: string[]) => {
	// 	let finalPath = "/"
	// 	for (let i = 0; i < paths.length; i++) {
	// 		const path = paths[0]
	// 		const firstChar = path[0]
	// 		if (firstChar === "/" || firstChar === "%2F") {

	// 		}
	// 	}
	// }
}