const LOG_FILE = 'temp.txt'

/** @param {NS} ns **/
function crawl(ns, start = '10.7.7.3', hosts = []) {
    let tmp = hosts
    if(!tmp.includes(start)) {
        // ns.tprint(start)
        tmp.push(start)
        const scans = ns.scan(start, true)
        for(const s of scans) {
            tmp = crawl(ns, s, tmp)
        }
        return tmp
    }
    return tmp
}


/** @param {NS} ns **/
async function ls(ns, hosts) {
    let readout = ''
    for(const host of hosts) {
        const files = ns.ls(host, '.cct')
        if(files.length > 0) {
            readout += `${host} - ${JSON.stringify(files)}\n`
        }
    }
    return readout
}
/** @param {NS} ns **/
export async function main(ns) {
    const hosts = crawl(ns)
    const readout = await ls(ns, hosts)
    ns.tprintf(readout)
    return readout
}