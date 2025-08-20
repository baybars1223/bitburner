import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns) {
    let [target, clients = ["home"], portRange = [30000, 39999]] = ns.args
    const initialTargetState = ns.getServer(target)
    let nextAvailablePort = portRange[0]
    const mainPort = nextAvailablePort
    nextAvailablePort += 1
    // TODO: create functions for managing this state
    let ports = {[mainPort]: ['main', 'home']}
    // TODO: create getter/setter for this
    // TODO: create a class for these
    // ex:  [SEQUENCE] : [{ operation: "hack", expectedEndTime: 50, expectedStartTime: 1, duration: 49, threads: 10 }]
    const operations = {}
    // A sequence is a grouping of operations that includes a hack & grow op and their associated weaken ops
    // Will probably only see use if updating the operations queue is frequent and/or messy
    let plannedSequence, currentSequence = 0
    
    tempGenerateClients(ns, mainPort, clients)
}

// really need to figure out a cleaner way of doing this without going full typescript
// or just go full typescript
/** @param {NS} ns */
function generateClients () {
    //loop through clients
        // check total ram
        // check available ram
        // request next port 
        // assign port
        // spawn client with args [managerPort, client.port] (and hostname I guess? could save .05 ram on the client lol)
            // update available ram
}

/** 
 * Temporary implementation that was supposed to save me dev time in the short term
 * Probably didn't even do that
 * @param {NS} ns 
 * @param {number} managerPort
 * @param {string[]} clients */
function tempGenerateClients (ns, managerPort, clients) {
    const maxRam = ns.getServerMaxRam('home')
    const usedRam = ns.getServerUsedRam('home')
    let client = { hostname: 'home', maxRam, usedRam, availableRam: maxRam - usedRam, port: nextAvailablePort }
    nextAvailablePort += 1
    ports[client.port] = ['client', client.hostname]
    // TODO: need to put check here to see if script exists on client server
    // ...or just copy it over every time
    // actually that's probably just better. make sure they're running most up to date version
    ns.exec('client.js', client.hostname, 1, [managerPort, client.port])
    let scriptRam = ns.getScriptRam('client.js', client.hostname)
    // TODO: ugh I already want a client class
    client.usedRam += scriptRam
    client.availableRam += scriptRam
    clients[0] = client

    return clients
}

/**
 * @param {NS} ns
 */
function ramToThreads (availableRam, operation) {
    let availableRam = availableRam
    let scriptCost = ns.getScriptRam(operation + '.js')
    let threads = Math.round(availableRam/scriptCost)
    let totalCost = threads * scriptCost
    return { threads, scriptCost, totalCost }
}

/** @param {NS} ns */
function calculateWeaken (server) {
    /*calculate threads*/
    /*calculate length*/
}

/** @param {NS} ns */
function calculateGrow (server) {
    /*calculate threads*/
    /*calculate length*/
    /*calculate sec increase*/
}

/** @param {NS} ns */
function calculateHack (server) {
    /*calculate threads*/
    /*calculate length*/
    /*calculate sec increase*/
}

/** @param {NS} ns */
function enqueueOperations (server) {
    plannedSequence += 1
    // calculateWeaken if expected security != 1
    // enqueue weaken

    // calculateGrow if expected money != max
    // enqueue weaken to complete after grow
    // enqueue grow

    // calculateHack
    // enqueue weaken to complete after hack
    // enqueue hack
}

/** @param {NS} ns */
function updateOperationsQueue () {
    // read in completionTime reports from port
    // update queue object
}

/** @param {NS} ns */
function assignOperations () {
    // gather threads for currentSequence + 1
    // if clients don't have enough threads - exit
    // weaken can be split without difficulty, others less so
    // else:
    currentSequence += 1

    
}