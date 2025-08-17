/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
	let count = ns.sleeve.getNumSleeves()
	let sleeve
	let currentTasks = ['', '', '', '', '', '']
	const combatStats = [
		'strength',
		'defense',
		'dexterity',
		'agility'
	]
	let goal = 10
	while(true) {
		for(let i = 0; i < count; i += 1) {
			sleeve = ns.sleeve.getSleeveStats(i)
			if(goal >= 250) {
				ns.sleeve.setToCommitCrime(i, 'Deal Drugs')
				currentTasks[i] = 'crime-Deal Drugs'
			} else {
				let working = false
				for(let s of combatStats) {
					if(sleeve[s] < goal && !working) {
						if(currentTasks[i] !== `training-${s}`) {
							let ok = ns.sleeve.setToGymWorkout(i, 'powerhouse gym', s)
							if(ok) {
								currentTasks[i] = `training-${s}`
								ns.print(`Training ${s}`)
							}
							working = true
						}
					}
				}
				if(!working) {
					goal += 10
					await ns.sleep(10)
				} 
			}
		}
		let done = currentTasks.reduce((acc, cur) => {
			return acc && cur === 'crime-Homicide'
		}, true)
		if(done) {
			break
		}
		await ns.sleep(30000)
	}

}