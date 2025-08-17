const LOG_PATH = '/logs/crawl.txt'
const ERRORS_PATH = '/errors/crawl.txt'

/** @param {import(".").NS } ns */
/** @param {NS} ns */
export async function main(ns) {
    await ns.write(LOG_PATH, '', 'w')
    const player = ns.getPlayer()
    class ServerNode {
        constructor(name, index, depth, parentNode = null, children = []) {
            this.name = name
            this.index = index
            this.depth = depth
            this.parentNode = parentNode
            this.children = children
        }
    
        /** 
         * @param {ServerNode[]} serverTree
         */
        getConnectionPath(serverTree) {
            let currentNode = this
            let path = []
            let pathC = []
            for(let i = 0; i < this.depth && currentNode.name !== 'home'; i += 1) {
                ns.tprint(currentNode)
                path.push(currentNode.name)
                pathC.push(currentNode)
                currentNode = serverTree[currentNode.parentNode.index]
            }
            return { simple: path, complex: pathC }
        }
        
        /** 
         * @param {ServerNode[]} serverTree
         */
        async connect(serverTree, compromised) {
            const { simple: path, complex: nodes } = this.getConnectionPath(serverTree)
            path.reverse()
            ns.tprint(path)
            const backdoored = []
            const promises = []
            for(const host of path) {
                try {
                    ns.singularity.connect(host)
                    const server = ns.getServer(host)
                    ns.print(host)
                    if(server.hasAdminRights && player.hacking >= server.requiredHackingSkill && !compromised.includes(host)) {
                        const op = ns.singularity.installBackdoor()
                        promises.push(op)
                        backdoored.push(host)
                        await op
                    }
                } catch (e) {
                    if(e.message == `connect: This singularity function requires Source-File 4-1 to run. A power up you obtain later in the game. It will be very obvious when and how you can obtain it.`) {
                        ns.tprint(`Pretending to connect to ${host}`)
                    } else {
                        ns.tprint(e)
                        ns.tprint(e.message)
                        ns.tprint(e.stack)
                    }
                }
            }
            await Promise.all(promises)
            return backdoored
        }
    }
    
    
    /** @param {NS} ns */
    async function mapServers(ns) {
        let servers = [
            new ServerNode('home', 0, 0)
        ]


        async function mapServersSubroutine(servers, currentNode) {
            await ns.sleep(0)
            let desc = {
                name: currentNode.name,
                index: currentNode.index,
                depth: currentNode.depth,
                ...currentNode.parentNode && { parent: currentNode.parentNode.name }
            }
            ns.write(ERRORS_PATH, JSON.stringify(desc, null, 2))
            ns.write(LOG_PATH, `Current Node: ${JSON.stringify(desc, null, 2)}`)
            let depth = currentNode.depth + 1
            let scanned = ns.scan(currentNode.name).filter(s => s !== desc.parent)

            async function reducer(_acc, s, i) {
                let acc = await _acc
                let server = ns.getServer(s)
                if(!server.purchasedByPlayer) {
                    let nextIdx = servers.length
                    let node = new ServerNode(s, nextIdx, depth, {name: currentNode.name, index: currentNode.index})
                    currentNode.children.push({name: node.name, index: node.index})
                    acc.push(node)
                    return mapServersSubroutine(acc, node)
                } else {
                    return acc
                }
            }
            return await scanned.reduce(reducer, servers)
        }

        let currentNode = servers[0]
        return await mapServersSubroutine(servers, currentNode)
        // let depth = currentNode.depth + 1
        // let scanned = ns.scan(currentNode.name)
        // for(let s of scanned) {
        //     let server = ns.getServer(s)
        //     if(!server.purchasedByPlayer) {
        //         let nextIdx = servers.length
        //         servers.push(new ServerNode(s, nextIdx, depth + 1, currentNode, currentNode.index))
        //     }
        // }
        // return servers
    }

    /** 
     * @param {NS} ns
     * @param {ServerNode[]} serverMap
     */
    async function backdoorAll(ns, serverMap) {
        const visited = []

        // /** 
        //  * @param {NS} ns
        //  * @param {ServerNode} serverNode
        //  */
        // async function backdoorSubroutine(ns, serverNode) {
        //     if(!visited.includes(serverNode.name)) visited.push(serverNode.name)
        //     await serverNode.connect()
        // }
        for(const node of serverMap) {

            // if(node.children.length === 0) {
                visited.push(...(await node.connect(serverMap, visited)))
            // }
						ns.singularity.connect('home')
            // ns.connect('home')
            
        }
    }

    const servers = await mapServers(ns)
    ns.write(LOG_PATH, `Server Map:\n${JSON.stringify(servers, null, 2)}\nFinished mapping at ${new Date().toLocaleTimeString()}`)
    return backdoorAll(ns, servers)


}