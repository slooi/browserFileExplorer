export const pathHelper = {
	/* Add path normalization (%2F=>/) as react-router doesn't interpret %2F and can't use abs path */
	setTrailingSlash: (path: string) => (path[path.length - 1] === "/") ? path.replace(/%2F/g, "/") : path.replace(/%2F/g, "/") + "/",
	setLeadingSlash: (path: string) => (path[0] === "/") ? path.replace(/%2F/g, "/") : "/" + path.replace(/%2F/g, "/"),
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