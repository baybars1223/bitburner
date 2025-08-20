import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns) {
    const [target, clients = ["home"], portRange = [30000, 39999]] = ns.args
    const initialTargetState = ns.getServer(target)
    // TODO: create a class for these
    // ex:   { sequence: 0, operation: "hack", expectedEndTime: 50, expectedStartTime: 1, duration: 49, threads: 10 }
    const operations = {}
    // A sequence is a grouping of operations that includes a hack & grow op and their associated weaken ops
    // Will probably only see use if updating the operations queue is frequent and/or messy
    let plannedSequence, currentSequence = 0
    
}

function calculateWeaken (server) {
    /*calculate threads*/
    /*calculate length*/
}

function calculateGrow (server) {
    /*calculate threads*/
    /*calculate length*/
    /*calculate sec increase*/
}

function calculateHack (server) {
    /*calculate threads*/
    /*calculate length*/
    /*calculate sec increase*/
}

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

function updateOperationsQueue () {
    // read in completionTime reports from port
    // update queue object
}

function assignOperations () {
    // 
}