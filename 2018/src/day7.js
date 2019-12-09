export function day7a() {
  // Parse command list
  const commandList = input.split('\n').map(s => {
    const [_, dependsOn, key] = /Step (\w) must be finished before step (\w) can begin./.exec(s);
    return {key, dependsOn};
  });

  // Create available instructions
  const instructions = {};
  for (let i = 0; i < 26; i++) {
    const key = String.fromCharCode(65 + i);
    instructions[key] = {key, dependants: [], dependsOn: {}};
  }

  // Link instruction dependencies and dependants to be able to trigger the next instructions to
  // run when on instruction is complete.
  for (const command of commandList) {
    const {key, dependsOn} = command;
    const dependency = instructions[dependsOn];
    const instruction = instructions[key];
    instruction.dependsOn[dependsOn] = true;
    dependency.dependants.push(instruction);
  }

  // Create a queue of all instructions we can run now
  let queue = Object.values(instructions).filter(i => Object.values(i.dependsOn).length === 0);
  const executedInstructions = [];
  while (queue.length > 0) {
    // Get the item with the lowest charcode, A comes before B, etc...
    queue.sort((a, b) => a.key.charCodeAt(0) - b.key.charCodeAt(0));
    const instruction = queue.shift();
    executedInstructions.push(instruction);
    // Go through all instructions which are dependent on the current one and queue them if this was the
    // their last dependency
    for (const dependant of instruction.dependants) {
      delete dependant.dependsOn[instruction.key];
      const canRun = Object.values(dependant.dependsOn).length === 0;
      if (canRun) {
        queue.push(dependant);
      }
    }
  }
  const instructionOrder = executedInstructions.map(i => i.key).join("");
  return instructionOrder;
}

function max(...numbers) {
  let max = Number.NEGATIVE_INFINITY;
  for (let num of numbers) {
    if (num > max) max = num;
  }
  return max;
}

export function day7b() {
  // Parse command list
  const commandList = input.split('\n').map(s => {
    const [_, dependsOn, key] = /Step (\w) must be finished before step (\w) can begin./.exec(s);
    return {key, dependsOn};
  });

  // Create available instructions
  const instructions = {};
  for (let i = 0; i < 26; i++) {
    const key = String.fromCharCode(65 + i);
    instructions[key] = {key, duration: i + 1, dependants: [], dependsOn: {}};
  }

  // Link instruction dependencies and dependants to be able to trigger the next instructions to
  // run when on instruction is complete.
  for (const command of commandList) {
    const {key, dependsOn} = command;
    const dependency = instructions[dependsOn];
    const instruction = instructions[key];
    instruction.dependsOn[dependsOn] = true;
    dependency.dependants.push(instruction);
  }

  // Create our workers which are ready to start at once
  let workers = [];
  for (let i = 0; i < 5; i++) {
    workers.push({doneAt: 0});
  }
  // Create a queue of all instructions we can run now
  let queue = Object.values(instructions).filter(i => Object.values(i.dependsOn).length === 0).map(instruction => ({
    instruction,
    runAt: 0
  }));
  let now = 0;
  let nextWorker = workers[0];
  while (queue.length > 0) {
    // Get the item with the lowest charcode, A comes before B, etc...
    queue.sort((a, b) => a.instruction.key.charCodeAt(0) - b.instruction.key.charCodeAt(0));
    for (const item of queue) {
      const {instruction, runAt} = item;
      // Ensure that this item is ready to run
      if (runAt <= now) {
        // Put the worker to work for a certain time period
        const doneAt = now + 60 + instruction.duration;
        nextWorker.doneAt = doneAt;
        // Go through all instructions which are dependent on the current one and queue them if this was the
        // their last dependency
        for (const dependant of instruction.dependants) {
          delete dependant.dependsOn[instruction.key];
          const canRun = Object.values(dependant.dependsOn).length === 0;
          if (canRun) {
            queue.push({instruction: dependant, runAt: doneAt});
          }
        }

        // Remove the current item from the queue
        queue.splice(queue.indexOf(item), 1);
        break;
      }
    }

    // Get the worker which has been waiting shortest or has the shortest time
    // left to finish their current task
    nextWorker = workers.sort((a, b) => a.doneAt - b.doneAt)[0];
    // Get the item which can be run soonest
    const nextItem = queue.sort((a, b) => a.runAt - b.runAt)[0];
    if (nextItem) {
      // Both an item and a worker must be available for the next task to start
      now = max(nextItem.runAt, nextWorker.doneAt);
    }
  }

  // The slead is not finished until the last worker is finished. Wait for it.
  const finished = workers.map(w => w.doneAt);
  now = max(...finished);
  return now;

}

const input = `Step X must be finished before step C can begin.
Step C must be finished before step G can begin.
Step F must be finished before step G can begin.
Step U must be finished before step Y can begin.
Step O must be finished before step S can begin.
Step D must be finished before step N can begin.
Step M must be finished before step H can begin.
Step J must be finished before step Q can begin.
Step G must be finished before step R can begin.
Step I must be finished before step N can begin.
Step R must be finished before step K can begin.
Step A must be finished before step Z can begin.
Step Y must be finished before step L can begin.
Step H must be finished before step P can begin.
Step K must be finished before step S can begin.
Step Z must be finished before step P can begin.
Step T must be finished before step S can begin.
Step N must be finished before step P can begin.
Step E must be finished before step S can begin.
Step S must be finished before step W can begin.
Step W must be finished before step V can begin.
Step L must be finished before step V can begin.
Step P must be finished before step B can begin.
Step Q must be finished before step V can begin.
Step B must be finished before step V can begin.
Step P must be finished before step Q can begin.
Step S must be finished before step V can begin.
Step C must be finished before step Q can begin.
Step I must be finished before step H can begin.
Step A must be finished before step E can begin.
Step H must be finished before step Q can begin.
Step G must be finished before step V can begin.
Step N must be finished before step L can begin.
Step R must be finished before step Q can begin.
Step W must be finished before step L can begin.
Step X must be finished before step L can begin.
Step X must be finished before step J can begin.
Step W must be finished before step P can begin.
Step U must be finished before step B can begin.
Step P must be finished before step V can begin.
Step O must be finished before step P can begin.
Step W must be finished before step Q can begin.
Step S must be finished before step Q can begin.
Step U must be finished before step Z can begin.
Step Z must be finished before step T can begin.
Step M must be finished before step T can begin.
Step A must be finished before step P can begin.
Step Z must be finished before step B can begin.
Step N must be finished before step S can begin.
Step H must be finished before step N can begin.
Step J must be finished before step E can begin.
Step M must be finished before step J can begin.
Step R must be finished before step A can begin.
Step A must be finished before step Y can begin.
Step F must be finished before step V can begin.
Step L must be finished before step P can begin.
Step K must be finished before step L can begin.
Step F must be finished before step P can begin.
Step G must be finished before step L can begin.
Step I must be finished before step Q can begin.
Step C must be finished before step L can begin.
Step I must be finished before step Y can begin.
Step G must be finished before step B can begin.
Step H must be finished before step L can begin.
Step X must be finished before step U can begin.
Step I must be finished before step K can begin.
Step R must be finished before step N can begin.
Step I must be finished before step L can begin.
Step M must be finished before step I can begin.
Step K must be finished before step V can begin.
Step G must be finished before step E can begin.
Step F must be finished before step B can begin.
Step O must be finished before step Y can begin.
Step Y must be finished before step Q can begin.
Step F must be finished before step K can begin.
Step N must be finished before step W can begin.
Step O must be finished before step R can begin.
Step N must be finished before step E can begin.
Step M must be finished before step V can begin.
Step H must be finished before step T can begin.
Step Y must be finished before step T can begin.
Step F must be finished before step J can begin.
Step F must be finished before step O can begin.
Step W must be finished before step B can begin.
Step T must be finished before step E can begin.
Step T must be finished before step P can begin.
Step F must be finished before step M can begin.
Step U must be finished before step I can begin.
Step H must be finished before step S can begin.
Step S must be finished before step P can begin.
Step T must be finished before step W can begin.
Step A must be finished before step N can begin.
Step O must be finished before step N can begin.
Step L must be finished before step B can begin.
Step U must be finished before step K can begin.
Step Z must be finished before step W can begin.
Step X must be finished before step D can begin.
Step Z must be finished before step L can begin.
Step I must be finished before step T can begin.
Step O must be finished before step W can begin.
Step I must be finished before step B can begin.`;
