import NS from '@ns';

/*
assuming any timing issues and inconsistencies can be resolved...
1 single process that oversees and queues weaken, grow, and hack operations for a given server
*use ns.hackingmultipliers I think*
hmmm... 
    theres some timing fuckery I need to figure out. operation time is based on server security level
    but is calculated (and effective) when the hack operation starts
        so are you getting lucky/unlucky if security level changes afterwards or am I missing something??
        if i'm not missing something, the goal is to always be starting operations when security is 1.
            i think this is much easier said than done if I'm remembering the variance in operation times correctly
                well not necessarily. especially if weaken is the longest timed?
                you'll just be queuing operations in an order different from their desired completion order?
weaken:
    calculate threads required to weaken security to 1
    calculate time that weaken operation with x threads will take
    enqueue weaken operation
    record time weaken operation will finish
grow:
    calculate threads required to grow money to max (or some other amount)
    calculate time that grow operation with x threads will take
    calculate security increase grow operation with x threads will take
    record time grow operation will finish
        calculate & enqueue weaken operation to finish immediately after grow operation
    enqueue grow operation
hack:
    
*/
