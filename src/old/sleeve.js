/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
	let sleeveIdent = ns.args.length > 0 ? ns.args.shift() : 0
	let sleeve
	let currentTask = ''
	const combatStats = [
		'strength',
		'defense',
		'dexterity',
		'agility'
	]
	let goal = 10
	
	while(true) {
		sleeve = ns.sleeve.getSleeveStats(sleeveIdent)
		if(goal >= 60) {
			ns.sleeve.setToCommitCrime(sleeveIdent, 'Mug')
			break
		} else {
			let working = false
			for(let s of combatStats) {
				if(sleeve[s] < goal && !working) {
					if(currentTask !== `training-${s}`) {
						let ok = ns.sleeve.setToGymWorkout(sleeveIdent, 'powerhouse gym', s)
						if(ok) {
							currentTask = `training-${s}`
							ns.print(`Training ${s}`)
						}
						working = true
						break
					}
				}
			}
			if(!working) {
				goal += 10
				await ns.sleep(10)
			} else {
				await ns.sleep(1000)
			}
		}

	}

}