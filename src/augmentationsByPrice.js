/** @param {NS} ns */
export async function main(ns) {
	const factions = Object.values(ns.enums.FactionName)
	const filtered = factions.filter((faction) => ns.singularity.getFactionRep(faction) > 0)

	const augmentations = {}
	for (let faction of filtered) {
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
	}

	let output = Object.entries(augmentations).sort(([aName, {price: aPrice}], [bName, {price: bPrice}]) =>
	{
		// ns.tprint(aPrice - bPrice)
		return aPrice - bPrice
	})
	
	// TODO: need to check for rep
	let money = ns.getPlayer().money
	for(let [name, {factions, price}] of output) {
		if( price <= money) {
			ns.tprint(`${name}: ${ns.formatNumber(price,2)} - [${factions.join(', ')}]`)
		}
	}
}