/** @param {NS} ns **/
export async function main(ns) {
	const [_size = null, hostname, dryrun = 1, _wantBuy = 0] = ns.args

	// const bitnodeMultipliers = ns.getBitNodeMultipliers()
	// ns.tprint(bitnodeMultipliers.PurchasedServerMaxRam)
	// ns.tprint(bitnodeMultipliers.PurchasedServerCost)
	// ns.tprint(bitnodeMultipliers.PurchasedServerLimit)

	const player = ns.getPlayer()
	const currentMoney = player.money

	let maxSize = Math.log(ns.getPurchasedServerMaxRam())/Math.log(2)
	let size

	if(_size === null) {
		let ram = 0
		size = 0
		for(let i = 0; i <= maxSize; i += 1) {
			ram = Math.pow(2, i)
			if(ns.getPurchasedServerCost(ram) <= currentMoney) {
				size = i;
			} else {
				i = maxSize + 1
			}
		}
		ram = Math.pow(2, size)
		ns.tprint(`Highest ram you can afford is ${ns.formatRam(ram, 3)} for ${ns.formatNumber(ns.getPurchasedServerCost(ram), 2, 1000, true)} (size ${size})`)
		
		return true
	}
	
	if(_size > maxSize) {
		ns.tprint(`${size} is invalid size for server. Defaulting to bitnode max of ${maxSize}`)
		size = maxSize
	} else {
		size = _size
	}

	const ram = Math.pow(2, size)
	
	const serverCost = ns.getPurchasedServerCost(ram)
	const serversAvailable = ns.getPurchasedServerLimit() - ns.getPurchasedServers().length

	const canBuy = Math.floor(currentMoney / serverCost)
	const wantBuy = _wantBuy || canBuy
	const willBuy = Math.min(wantBuy, canBuy, serversAvailable)
	
	if(serversAvailable < wantBuy) {
		ns.tprint(`Input of ${wantBuy} vs number available of ${serversAvailable}`)
	}
	if(dryrun) {
		const formattedRam = ns.formatRam(ram, 3)
		ns.tprint(`RAM: ${formattedRam}`)
		ns.tprint(`COST: ${ns.formatNumber(ns.getPurchasedServerCost(ram), 2, 1000, true)}`)
		if(wantBuy > 0) {
			ns.tprint(`COST x ${wantBuy}: ${ns.formatNumber(ns.getPurchasedServerCost(ram) * wantBuy, 2, 1000, true)}`)
			ns.tprint(`${dryrun ? "Could" : "Would"} buy ${willBuy} server for ${ns.formatNumber(willBuy * serverCost, 2, 1000, true)}`)
		} else {
			ns.tprint(`Cannot afford to buy server with RAM of ${formattedRam}`)
		}
	} else {
		if(willBuy < 1) {
			ns.tprint(`Cannot afford to buy server with RAM of ${formattedRam}`)
		} else {
			ns.tprint(`Buying ${willBuy} server${willBuy !== 1 ? "s" : ""} for ${ns.formatNumber(willBuy * serverCost, 2, 1000, true)}`)
			let files = [...ns.ls('home', 'util'), ...ns.ls('home', 'lists'), "clusterMKI.js", "money.js", "research.js"]
			for(let i = 0; i < willBuy; i += 1) {
				const host = ns.purchaseServer(hostname, ram)			
				ns.scp(files, host, 'home')
			}
		}
	}
}