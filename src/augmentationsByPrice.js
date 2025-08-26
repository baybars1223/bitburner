import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns) {
	const [repFilter = true] = ns.args
	const omitFactions = ns.args.slice(1)
	const factions = Object.values(ns.enums.FactionName)
	const currentFactions = factions.filter((faction) => ns.singularity.getFactionRep(faction) > 0 && omitFactions.indexOf(faction) === -1)

	const augmentations = {}
	for (let faction of currentFactions) {
		let offered = ns.singularity.getAugmentationsFromFaction(faction)
		for (let aug of offered) {
			if(!augmentations[aug]) {
				augmentations[aug] = { factions: [faction] }
			} else {
				augmentations[aug].factions.push(faction)
			}
		}
	}
	// ns.tprint(Object.keys(augmentations).length)

	const installed = ns.singularity.getOwnedAugmentations(true)
	for (let aug of installed) {
		if(augmentations[aug]) {
			delete augmentations[aug]
		}
	}
	// ns.tprint(Object.keys(augmentations).length)
	// ns.tprint(augmentations)
	
	for (let aug of Object.keys(augmentations)) {
		augmentations[aug].price = ns.singularity.getAugmentationPrice(aug)
		augmentations[aug].rep = ns.singularity.getAugmentationRepReq(aug)
	}

	let sortedByPrice = Object.entries(augmentations).sort(([aName, {price: aPrice}], [bName, {price: bPrice}]) =>
	{
		// ns.tprint(aPrice - bPrice)
		return aPrice - bPrice
	})
	// TODO: need to check for rep
	let money = ns.getPlayer().money
	let output = '\n'
	for(let [name, {factions, price, rep}] of sortedByPrice) {
		let enoughRep = repFilter ? factions.reduce((acc, cur) => {return acc || ns.singularity.getFactionRep(cur) >= rep}, false) : true
		if(price <= money && enoughRep) {
			let n = (name.slice(0,15) + ':')
			output+=`${n.padEnd(16,' ')} ${ns.formatNumber(price,2).padStart(7)} | ${ns.formatNumber(rep,1).padStart(7)} - [${factions.join(', ')}]\n`
		}
	}
	ns.tprint(output)
}