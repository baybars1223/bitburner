/** @param {NS} ns **/
function nFormatWithPadding(ns, num, format, paddings) {
	const str = ns.nFormat(num, format)
	const parts = str.split(' ')
	if(parts.length !== paddings.length) {
		ns.tprint(`WARN Match & paddings length mismatch while formatting '${str}'`)
		ns.tprint(`WARN Match: ${JSON.stringify(parts)}`)
		return str
	}
	const paddedParts = []
	try {
		for(let i = 0; i < paddings.length; i += 1) {
			const padding = paddings[i]
			if(padding > 0) {
				paddedParts.push(parts[i].padEnd(padding))
			} else {
				paddedParts.push(parts[i].padStart(padding * -1))
			}
		}
	} catch {}
	return paddedParts.join(' ')
}

/** @param {NS} ns **/
export async function main(ns) {
	const f = (num, format, paddings) => nFormatWithPadding(ns, num, format, paddings)
	const myServers = ns.scan('home').map(h => ns.getServer(h)).filter(s => s.purchasedByPlayer)
	let printMax = false
	let printUsed = false
	let printAvail = false
	let printAll = false
	if(ns.args.length > 0) {
		ns.tprint(ns.args)
		const [ sorting, showAll = 0, ...args] = ns.args
		ns.tprint("sorting:")
		ns.tprint(sorting)
		ns.tprint("showAll:")
		ns.tprint(showAll)
		const [ sortType = 'm', order = 'd' ] = sorting.split('')
		ns.tprint("sortType:")
		ns.tprint(sortType)
		ns.tprint("order:")
		ns.tprint(order)
		switch(sortType) {
			case 'm':
				printMax = true
				myServers.sort((a, b)=> b.maxRam - a.maxRam)
				break
			case 'u':
				printUsed = true
				myServers.sort((a, b)=> b.ramUsed - a.ramUsed)
				break
			case 'a':
				printAvail = true
				myServers.sort((a, b)=> (b.maxRam - b.ramUsed) - (a.maxRam - a.ramUsed))
				break
		}
		if(order && order == 'a') {
			myServers.reverse()
		}
		printAll = !!showAll
	}

	printMax = printAll || printMax
	printUsed = printAll || printUsed
	printAvail = printAll || printAvail
	ns.tprint(myServers.map(o => o.hostname))
	let logMsg = '\nServer Report:\n'
	let headers = `|  Ident  |${printMax ? '  Total  |' : ''}${printUsed ? '      Using      |' : ''}${printAvail ? '      Avail      |' : ''}\n`
	let separator = `|---------|${printMax ? '---------|' : ''}${printUsed ? '-----------------|' : ''}${printAvail ? '-----------------|' : ''}\n`
	logMsg += separator
	logMsg += headers
	logMsg += separator
	for(const s of myServers) {
		const m = s.maxRam
		const u = s.ramUsed
		const up = u / m * 100
		const a = s.maxRam - s.ramUsed
		const ap = a / m * 100
		logMsg += `| ${s.hostname}`.padEnd(10)
		logMsg += printMax ? `| ${f(m * 1e9, '0 b', [-3, 2])} `.padEnd(10) : ''
		logMsg += printUsed ? `| ${f(u * 1e9, '0.0 b', [-5, 2])} ${`(${ns.nFormat(up, '0')}%)`.padStart(6)}`.padEnd(18) : ''
		logMsg += printAvail ? `| ${f(a * 1e9, '0.0 b', [-5, 2])} ${`(${ns.nFormat(ap, '0')}%)`.padStart(6)}`.padEnd(16) + ' ' : ''
		logMsg += '|\n'

	}
	logMsg += separator
	ns.tprint(logMsg)
}