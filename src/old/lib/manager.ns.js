const DESCRIPTION_PATH = '/lib/server.txt'

function calcThreads(available, cost, percentage = 1) {
    const usable = available * percentage
    const threads = Math.floor(usable / cost)
    return {threads, cost: threads * cost}
}

/** @param {NS} ns **/
export async function main(ns) {
    try {
        let start = Date.now()
        let end
        for(let i = 0; i < 10000; i += 1) {
            const {
                Server,
                Cracked,
                MoneyAvailable,
                MaxMoney,
                SecurityLevel,
                MinSecurityLevel,
                ServerRam,
                ScriptRam,
                HackingLevel,
                RequiredHackingLevel,
                RequiredPorts,
                HackChance
            } = JSON.parse(await ns.read(ns.args[0] || DESCRIPTION_PATH))
            if (Cracked) {
							ns.tprint(ServerRam + "    " + ScriptRam)
                const {threads, cost} = calcThreads(ServerRam, ScriptRam, 1)
                let operation = ''
                if(SecurityLevel > MinSecurityLevel + 5 && (SecurityLevel > HackingLevel - 50 || HackChance < .9)) {
                    await ns.weaken(Server, { threads: 14000 })
                    operation = 'weaken'
                } else if(MoneyAvailable >= MaxMoney * .5) {
                    await ns.hack(Server, { threads: 14000 })
                    operation = 'hack'
                } else {
                    await ns.grow(Server, { threads: 14000 })
                    operation = 'grow'
                }
                end = Date.now()
                const duration = end - start
                await ns.write('/lib/outcomes.txt', ` Duration: ${duration}\n[${new Date(end).toLocaleString()}] Iteration:${i} Operation: ${operation}`, 'a')
            }
            await ns.sleep(Math.random() * 5000)
        }
    } catch (e) {
        ns.tprint(e)
        ns.tprint(e.message)
    }
}