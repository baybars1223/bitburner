const FALLBACK_ERROR_FILE = '/errors/fallback.txt'

export function pErrorGenerator(ns) {
	return (e, to, options) => pError(ns, e, to, options)
}

/** @param {NS} ns **/
export function pError(ns, e, to = 'terminal', options = {}) {
	const { msg = null } = options
	let operation = ns.tprint
	switch(to) {
		case 'terminal':
			operation = ns.tprint
			break
		case 'tail':
			operation = ns.print
			break
		default:
			operation = ns.tprint
			break
	}
	let text = `ERROR:\n${msg ? '  ' + msg + '\n': ''}`
	if(typeof e == 'string') {
		text += '  ' + e
	} else {
		text += '  ' + e.message + '\n'
		text += '  ' + e.stack
	}
	operation(text)
}

/** @param {NS} ns **/
export async function pfError(ns, e, path = '', options = {}) {
	const { mode = 'a', msg = null } = options
	if(filepath === '') {
		ns.tprint(`Tried to print to file, but was not provided with a path`)
	} else {
		let lines = `[${new Date().toTimeString}]:\n${msg ? msg + '\n' : ''}`
		if(typeof e == 'object') {
			lines += e.message + '\n'
			lines += e.stack
		} else {
			lines += e
		}
		lines += '\n'
		try {
			return ns.write(path, lines, mode)
		} catch (err) {
			return errorFile(ns, err, FALLBACK_ERROR_FILE, { msg: `Failed to write to file '${path}' the following error:\n${e}\n${e.message}\n${e.stack}`})
		}
	}
}