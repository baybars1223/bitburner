import NS from '@ns';

/*
assuming any timing issues and inconsistencies can be resolved...
1 single process that oversees and queues weaken, grow, and hack operations for a given server
*use ns.hackingmultipliers /formulas api I think*
hmmm... 
    theres some timing fuckery I need to figure out. operation time is based on server security level
    but is calculated (and effective) when the hack operation starts
        so are you getting lucky/unlucky if security level changes afterwards or am I missing something??
        if i'm not missing something, the goal is to always be starting operations when security is 1.
            i think this is much easier said than done if I'm remembering the variance in operation times correctly
                well not necessarily. especially if weaken is the longest timed?
                you'll just be queuing operations in an order different from their desired completion order?
weaken:
(In theory this will happen once at start of loop, then the grow and hack will spawn from there)
    calculate threads required to weaken security to 1
    calculate time that weaken operation with x threads will take
    enqueue weaken operation
    record time weaken operation will finish
grow:
    calculate threads required to grow money to max (or some other amount)
    calculate time that grow operation with x threads will take
    calculate security increase grow operation with x threads will produce
    record time grow operation will finish
        calculate & enqueue weaken operation to finish immediately after grow operation
    enqueue grow operation
hack:
    calculate threads required to steal x% of server's money
    calculate time that hack operation with x threads will take
    calculate security increase hack operation with x threads will produce
    record time hack operation will finish
        calculate & enqueue weaken operation to finish immediately after hack operation
    enqueue hack operation


How far to take cluster/swarm & pub/sub paradigms?
    ideally, we would be able to swarm using all available computers
        in theory, including the ones with less power. however, those will be harder to utilize later on once we need more threads than they can provide.
            most useful in early game when there aren't enough funds to buy more servers   
    to do this we need a central record, at minimum. at which point, why not just have a single dispatcher?
    Option A: The dispatcher tracks the status of all clients and directly assign tasks
    Option B: The dispatcher publishes needed tasks and clients pick them up first come/first serve
        questions: i worry about concurrency and collisions. the way readPort seems to work might alleviate that issue though.
            if lines are removed when read, only 1 client can take the task
                problem: what if a client reads the task in but lacks the resources to complete it?
                could avoid this by having a open tasks database of sorts instead of using ports.
                    then we're back to having to use locks and such..

    Option A feels better at the moment
        Channels: (differentiated by args, or by separate ports entirely)
            Client Ports - Each client has their own port for receiving task assignments
            Subscribe - For managing subscribe requests
                is it worth sending confirmations? if we sent them to client port, its one more message to parse and process
            Unsubscribe - For manage unsubscribe requests
                see above
            Task Completion - For clients to submit completion of tasks
                this may not be necessary. depends on actual lag time between assignment dispatch and start of task
                    even though this is a simulation, i imagine there's going to be *some* lag.
                        any lag that's unpredictable is going to require reconciliation of the task queue for maximum efficiency
            Client Status - Resources available, maaaaybe when committed resources will be free
                since we already have complete control over resource usage, we can probably track this locally, given an accurate initial state or checking ourselves if necessary
                this would probably be a redundancy to protect against state drift etc
                    checking ourselves when needed is probably easier...
            I feel like I'm missing one -

The shape and workings of the task queue are still pretty amorphous in my head...
    Options:
        Script State - Easiest to work on. Not immediately accessible to other scripts, which may mean the overseer script has to be responsible for more things. Lost when script dies.
            I know part of you doesn't care about state loss on script death. But that means we can't do clean up (kill other processes) and that we're having a reassess the entire state.
                Do bitburner scripts allow for on exit logic? They don't 'die' by themselves that often I don't think.
                    Even if they don't, could create script to kill them rather than using terminal/ui commands. That script could trigger an onexit logics
        Text File - Accessible. Requires more parsing than other options. Potential concurrency issues if multiple processes are accessing it. Will stick around after scripts die
            Stick around... for better and worse
        Port - Would function as a FIFO queue. For better and worse. If we have to edit it at all, then this probably isn't a good option.
            Alternatively, spam the port with the entire queue in JSON format.
                Now I'm second guessing whether ports in this are fifo or lifo
                    It's FIFO
                So we'd want to read in the entire contents of the port each time. And toss all but the latest?
                    Feels a little gross

    I don't love the text file option. It has all the downsides of a database without any of the upsides.
    I think I'm leaning towards just managing the task queue in the script's state.
    
Task Queue shape:
    Each task is an object
        {expectedStartTime: 1, expectedEndTime: 50, threads: 10, operation: "hack"}
    * On second thought, maybe object with sequence as keys and array of task objects?
        hm :/
    Stored in FIFO array, so default manipulation is with shift + push
        i need to write some code to get a better idea of how the weaken operations will need to be inserted
    I'm wondering if an object with keys of expectedStartTime would be better?
    Can't decide which model will require more sorting operations and other logistical manipulations

Manager sends operation to client
Client spawns process at estimated start time
Client updates manager with actual completion time (should this happen every time or only when estimated != actual?)
    Manager updates queue if necessary

Manager should assign client a port from predefined & recorded range on subscribe
*/
