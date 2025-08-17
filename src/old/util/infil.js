class InfiltrationSummary {
	/** @param {NS} ns
	@param {InfiltrationLocation} infil */
	constructor (ns, infil) {
		this.ns = ns
		this.ns.disableLog('ALL')
		const player = ns.getPlayer()
		
		const { location, reward, difficulty } = infil
		this.city = location.city
		this.name = location.name
		this.stages = location.infiltrationData.maxClearanceLevel
		this.baseSecurity = location.infiltrationData.startingSecurityLevel
		this.forRep = reward.tradeRep
		this.forCash = reward.sellCash
		this.anarchyRep = reward.SoARep
		this.perStage = {
			rep: this.forRep / this.stages,
			cash: this.forCash / this.stages,
			anarchy: this.anarchyRep / this.stages
		}
		this._difficulty = difficulty
		this.difficulty = Math.ceil(this._difficulty * 1/3 * 100)
		const hasInfilHarmonizer = ns.singularity.getOwnedAugmentations().includes("SoA - phyzical WKS harmonizer")
		this.damage = Math.round(this.baseSecurity * 3 * (hasInfilHarmonizer ? .5 : 1))
	}

	toString() {
		const lines = ['']
		lines.push(`Location:   ${this.name} (${this.city})`)
		lines.push(`Stages:     ${this.stages}`)
		lines.push(`Difficulty: ${this.difficulty} (${this.damage})`)
		lines.push(`Security:   ${this.baseSecurity}`)
		lines.push(`Trade Rep:  ${this.ns.formatNumber(this.forRep,1)} (${this.ns.formatNumber(this.perStage.rep,2)})`)
		lines.push(`SoA Rep:    ${this.ns.formatNumber(this.anarchyRep,1)} (${this.ns.formatNumber(this.perStage.anarchy,2)})`)
		lines.push(`Cash:       ${this.ns.formatNumber(this.forCash,1)} (${this.ns.formatNumber(this.perStage.cash,2)})`)
		return lines.join('\n')
	}
}


/** @param {NS} ns */
export async function main(ns) {
	const infiltrations = ns.infiltration.getPossibleLocations().map(({city, name}) => {
		return new InfiltrationSummary(ns, ns.infiltration.getInfiltration(name))
	})
	const player = ns.getPlayer()
	
	// /** @param {InfiltrationSummary} a */
	// /** @param {InfiltrationSummary} b */
	// infiltrations.sort((a,b) => {
	// 	if(b.difficulty === a.difficulty) {
	// 		if(b.stages === a.stages) {
	// 			return a.forRep - b.forRep
	// 		}
	// 		return b.stages - a.stages
	// 	}
	// 	return b.difficulty - a.difficulty
	// })

	/** @param {InfiltrationSummary} a */
	/** @param {InfiltrationSummary} b */
	infiltrations.sort((a,b) => {
		if(Math.min(a.damage, b.damage) < player.hp) {
			return b.damage - a.damage
		}
		// if(Math.max(a.stages, b.stages) >= 22 && Math.min(a.stages, b.stages) < 22) {
		// 	return b.stages - a.stages
		// }

		// if(a.stages !== b.stages || a.damage !== b.damage) {
		// 	if(a.stages > b.stages && a.stages > 25) return -1
		// 	if(a.damage > b.damage && a.damage >= player.hp) return -1
		// }

		if(a.perStage.rep === b.perStage.rep) {
			return b.stages - a.stages
		}
		return a.perStage.rep - b.perStage.rep
	})
	
	for(let infil of infiltrations) {
		// if(name == "Rho Construction"){
// 			ns.tprint(`
// ${JSON.stringify(infil,null,2)}
// `)
ns.tprint(infil.toString())
		// }
	}
}