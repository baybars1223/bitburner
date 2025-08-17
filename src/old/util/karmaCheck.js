/** @param {NS} ns */
export async function main(ns) {
	const karma = Math.floor(ns.heart.break())
	const gangRequirement = -54000
	const karmaNeededForGang = gangRequirement - karma
	ns.tprint(`Karma:     ${karma}`)
	const homicide = ns.singularity.getCrimeStats("Homicide")
	if(karmaNeededForGang > gangRequirement) ns.tprint(`Remaining: ${karmaNeededForGang} (${Math.abs(karmaNeededForGang) / homicide.karma} homicides)`)
}