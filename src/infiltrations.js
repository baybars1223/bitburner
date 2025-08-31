/** @param {NS} ns */
export async function main(ns) {
	const locations = ns.infiltration.getPossibleLocations()
	const infiltrations = []
	for (let {city: city, name: infil} of locations) {
		infiltrations.push(ns.infiltration.getInfiltration(infil))
	}
	infiltrations.sort(({reward: rewardA, maxClearanceLevel: maxA}, {reward: rewardB, maxClearanceLevel: maxB}) => {
		return rewardA.tradeRep/maxA - rewardB.tradeRep/maxB
	})

    let str = '\n'
	for(let {location, reward, maxClearanceLevel} of infiltrations) {
        str += location.name.padEnd(25) + ' | '
		str += `${maxClearanceLevel}`.padEnd(2) + ' | '
		str += location.city.padEnd(9) + ' | '
		str += ns.formatNumber(reward.tradeRep / maxClearanceLevel,1).padEnd(5) + ' | '
		str += `Rep: ${ns.formatNumber(reward.tradeRep,1).padStart(6)} - SoA: ${ns.formatNumber(reward.SoARep,1).padStart(6)} - ${('$' + ns.formatNumber(reward.sellCash,1)).padStart(7)}`
        str += '\n'
	}
    ns.tprint(str)
	// ns.tprint(infiltrations)
}