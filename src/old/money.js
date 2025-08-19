import { generateLineData } from '/old/util/summarize.js'
import { pErrorGenerator } from '/old/util/error.js'
let pError = null
const SERVER_LIST = '/old/lists/servers.txt'

/** @param {NS} ns **/
export async function main(ns) {
    pError = pErrorGenerator(ns)
    const logPath = ns.args.length > 1 ? ns.args[1] : 'money.txt'
    try {
        let lines = []
        let readout = '\n'
        const servers = JSON.parse(await ns.read(SERVER_LIST))
        for(const srv of servers) {
            try{
                const server = ns.getServer(srv)

                const l = generateLineData(ns, server, (ns.args.length > 1 && ns.args[1] === '-a'))
                if(l) {
                    const { line } = l
                    lines.push({line, max: server.moneyMax, available: server.moneyAvailable, fullness: server.moneyAvailable / server.moneyMax})
                }
            } catch (e) {
                pError(e)
            }
        }

        switch(ns.args[0] || 'm') {
            case 'm':
                lines.sort((a,b) => a.max - b.max)
                break
            case 'a':
                lines.sort((a,b) => a.available - b.available)
                break
            case 'f':
                lines.sort((a,b) => a.fullness - b.fullness)
                break
            default:
                lines.sort((a,b) => a.max - b.max)
                break
        }
        readout = lines.reduce((acc, {line}) => acc + line, readout)
        ns.tprint(readout)
        await ns.write(logPath, readout)
    } catch (e) {
        pError(e)
    }
}