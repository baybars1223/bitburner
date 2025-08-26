/** @param {NS} ns */
// TODO: This was bugged. Not sure what borked
export async function main(ns) {
	const companies = ["Bachman & Associates","Blade Industries","Clarke Incorporated","ECorp","Four Sigma","KuaiGong International","MegaCorp","NWO","OmniTek Incorporated"]
	const sleeves = []
	for(let i = 0; i < 7; i += 1) {
		sleeves.push(ns.sleeve.getSleeve(i))
	}
	
	let done = false
	while(!done) {
		sleeves.forEach((sleeve, idx) => {
			if(sleeve.shock === 0) {
				ns.sleeve.setToCompanyWork(idx, companies[idx])
			} else {
				ns.sleeve.setToShockRecovery(idx)
			}
		})

		done = sleeves.reduce((acc, sleeve) => {
			return acc && sleeve.shock === 0
		}, true)

		await ns.sleep(10000)
	}

}