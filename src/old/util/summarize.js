/**
 * @param {NS} ns
 * @param {Server} server
 */
function filter(f, server) {
    switch(f) {
        case 'money':
            return server.moneyMax > 0
        case 'ram':
            return server.maxRam > 0
        case 'nuked':
            return server.hasAdminRights
        case 'weak':
            return server.hackDifficulty - server.minDifficulty < 3
        default:
            ns.tprint(`encountered unrecognized filter '${f}'. defaulting to true`)
            return true
    }
}

/**
 * @param {NS} ns
 * @param {Server} server
 */
export function generateLineData(ns, server, override = false, filters = ['money', 'nuked']) {
    const {
        hostname,
        moneyAvailable,
        moneyMax,
        hackDifficulty,
        minDifficulty,
        requiredHackingSkill,
        serverGrowth,
    } = server

    const myHackingLevel = ns.getHackingLevel()
    const currentHackChance = ns.hackAnalyzeChance(hostname)
    const currentGrowTime = ns.getGrowTime(hostname)

    let valid = myHackingLevel >= requiredHackingSkill
    valid = filters.reduce((acc, cur) => {
        return acc && filter(cur, server)
    }, valid)
    if(valid || override) {
        const data = {
            name: hostname.padEnd(20),
            available: ns.formatNumber(Math.floor(moneyAvailable), 1).padStart(6),
            max: ns.formatNumber(moneyMax, 1).padEnd(6),
            fullness: `(${Math.floor(moneyAvailable / moneyMax * 100)}% full)`.padEnd(11),
            growRate: `${Math.floor(currentGrowTime / 1000 / serverGrowth * 10) / 10}s/growth`,
            growRateLong: `(${serverGrowth} over ${Math.floor(currentGrowTime / 1000)}s)`,
            security: `${ns.formatNumber(hackDifficulty, 1)} / ${ns.formatNumber(minDifficulty, 0).padEnd(2)} (${ns.formatPercent(currentHackChance, 1).padStart(6)})`
        }
        data.money = `${data.available} / ${data.max}`.padEnd(14)
        const line = `${data.name} | ${data.money} ${data.fullness} | ${data.security} | ${data.growRate} ${data.growRateLong}\n`
        return { data, line }
    }
    return null
}