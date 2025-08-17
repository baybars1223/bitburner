class InfiltrationSummary {
	/** @param {NS} ns
	@param {InfiltrationLocation} infil */
	constructor (ns, infil) {
		this.ns = ns
		this.ns.disableLog('ALL')
		
	}
}

const _crimes = [
	"Shoplift",
	"Rob Store",
	"Mug",
	"Larceny",
	"Deal Drugs",
	"Bond Forgery",
	"Traffick Arms",
	"Homicide",
	"Grand Theft Auto",
	"Kidnap",
	"Assassination",
	"Heist"
]

const CONSTANTS = {
	MaxSkillLevel: 975,
	IntelligenceCrimeWeight: 0.025
}

function calculateIntelligenceBonus(intelligence, weight = 1) {
  return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}

  const successRate = (crime, p, bitNodeMultipliers) => {
    let chance =
      crime.hacking_success_weight * p.skills.hacking +
      crime.strength_success_weight * p.skills.strength +
      crime.defense_success_weight * p.skills.defense +
      crime.dexterity_success_weight * p.skills.dexterity +
      crime.agility_success_weight * p.skills.agility +
      crime.charisma_success_weight * p.skills.charisma +
      CONSTANTS.IntelligenceCrimeWeight * p.skills.intelligence;
    chance /= CONSTANTS.MaxSkillLevel;
    chance /= crime.difficulty;
    chance *= p.mults.crime_success;
    chance *= bitNodeMultipliers.CrimeSuccessRate
    chance *= calculateIntelligenceBonus(p.skills.intelligence, 1);

    return Math.min(chance, 1);
  }


/** @param {NS} ns */
export async function main(ns) {

	// let output = _crimes.map((c) => {
	// 	return `${c}: ${ns.singularity.getCrimeChance(c)}`
	// }).join('\n')
	// ns.tprint(output)
	let bitNodeMultipliers = ns.getBitNodeMultipliers()
	let sleeve = ns.sleeve.getSleeve(0)
	let crimes = _crimes.map(c => {
		let crime = ns.singularity.getCrimeStats(c)
		ns.tprint(successRate(crime, sleeve, bitNodeMultipliers))
		return crime
	})
	// ns.tprint(JSON.stringify(crimes, null, 2))
	ns.tprint("\n" + crimes.map((x) => {
		let type = x.type + ":"
		let moneyPerSec = ns.formatNumber(x.money/(x.time/1000),2) + "/s"
		return `${type.padEnd(20," ")} ${moneyPerSec.padEnd(12, " ")} ${(ns.formatPercent(successRate(x, sleeve, bitNodeMultipliers),1)).padStart(7," ")} [${x.time/1000}]`
		// return `${type.padEnd(20," ")} ${moneyPerSec.padEnd(12, " ")} ${(ns.formatPercent(ns.singularity.getCrimeChance(x.type),1)).padStart(7," ")}`
	}).join('\n'))

	
	let count = ns.sleeve.getNumSleeves()
	for(let i = 0; i < count; i += 1) {
			sleeve = ns.sleeve.getSleeve(i)
			// ns.sleeve.setToCommitCrime(i, 'Deal Drugs')
			// ns.sleeve.setToCommitCrime(i, 'Homicide')
			// ns.sleeve.travel(i, "Volhaven")
			// ns.sleeve.travel(i, "Sector-12")
			ns.sleeve.setToUniversityCourse(i,"ZB Institute of Technology", "Algorithms")
			// ns.sleeve.setToGymWorkout(i,"Powerhouse Gym", "Strength")
	}
	// ns.tprint(JSON.stringify(_crimes.map(c => ns.singularity.getCrimeStats(c)),null,2))
	// ns.singularity.getCrimeStats()
	// ns.singularity.getCrimeChance()
	// ns.tprint(ns.singularity.getOwnedAugmentations())
	// ns.tprint(ns.singularity.getAugmentationsFromFaction('Sector-12'))
	// ns.tprint(ns.singularity.getAugmentationsFromFaction('Aevum'))
	// ns.tprint(ns.singularity.getAugmentationsFromFaction('Volhaven'))
	// ns.tprint(ns.singularity.getAugmentationsFromFaction('Chongqing'))
	// ns.tprint(ns.singularity.getAugmentationsFromFaction('New Tokyo'))
}