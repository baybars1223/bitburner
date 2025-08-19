/** @param {NS} ns **/
import { describeHost } from '/old/util/server.ns'

export async function main(ns) {
    try {
        const servers = JSON.parse(await ns.read('/old/util/servers.txt'))
        ns.tprint(servers)
        for(const hostname of servers) {
            const server = describeHost(ns, hostname)
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
            } = server
            const readout = 
`
Server: ${Server}
Cracked: ${Cracked}
MoneyAvailable: ${MoneyAvailable}
MaxMoney: ${MaxMoney}
SecurityLevel: ${SecurityLevel}
MinSecurityLevel: ${MinSecurityLevel}
ServerRam: ${ServerRam}
ScriptRam: ${ScriptRam}
HackingLevel: ${HackingLevel}
RequiredHackingLevel: ${RequiredHackingLevel}
RequiredPorts: ${RequiredPorts}
HackChance: ${HackChance}\n\n
`
            ns.tprint(readout)
            await ns.write(ns.args[0], readout)
        }
    } catch (e) {
        ns.tprint(e.message)
    }
}