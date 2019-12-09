export function day16a() {
  const instructionOutput = input.split('\n');
  const {instructions} = parseInstructions(instructionOutput);

  const vm = new VM();
  let equalResults = 0;
  for (const {setup, args, result} of instructions) {
    let validOpcodes = 0;
    for (let opcode = 0; opcode < 16; opcode++) {
      vm.setRegisters(...setup);
      vm.execute(opcode, ...args);
      if (vm.checkRegisters(...result)) validOpcodes++;
    }
    if (validOpcodes >= 3) equalResults++;
  }

  return equalResults;
}

export function day16b() {
  const instructionOutput = input.split('\n');
  const {instructions, rowOffset} = parseInstructions(instructionOutput);
  const {program} = parseProgram(instructionOutput, rowOffset);
  const calculator = new OpTableCalculator();
  const optable = calculator.calculate(instructions);

  const vm = new VM();
  vm.setOptable(optable);
  for (const {opcode, args} of program) {
    vm.execute(opcode, ...args);
  }

  return vm.registers[0];
}

class OpTableCalculator {
  constructor() {
    this.opcodeTable = {};
    this.foundOpcodes = {};
    this.foundOps = {};
  }

  tryRegisterOpcode(opcode) {
    const ops = this.opcodeTable[opcode];
    if (ops.size === 1) {
      const op = [...ops][0];
      this.foundOpcodes[opcode] = op;
      this.foundOps[op] = opcode;

      for (let opcode = 0; opcode < 16; opcode++) {
        const ops = this.opcodeTable[opcode];
        if (!ops) continue;

        ops.delete(op);
        this.tryRegisterOpcode(opcode);
      }
    }
  }

  calculate(instructions) {
    const opcodeTable = this.opcodeTable;
    const vm = new VM();
    for (const {setup, opcode, args, result} of instructions) {
      const validOps = new Set();
      for (let opcode = 0; opcode < 16; opcode++) {
        vm.setRegisters(...setup);
        vm.execute(opcode, ...args);
        if (vm.checkRegisters(...result)) {
          const op = vm.getOp(opcode);
          validOps.add(op);
        }
      }
      const ops = opcodeTable[opcode];
      if (!ops) opcodeTable[opcode] = validOps;
      else opcodeTable[opcode] = intersection(ops, validOps);
    }

    for (let i = 0; i < 15; i++) {
      this.tryRegisterOpcode(i);
    }

    return this.foundOpcodes;
  }

}

function intersection(a, b) {
  return new Set([...a].filter(x => b.has(x)));
}

function parseProgram(rows, offset = 0) {
  const program = [];
  let i;
  for (i = offset; i < rows.length; i++) {
    const row = rows[i];
    if (row === "") continue;

    const instruction = /(\d+) (\d+) (\d+) (\d)/.exec(row);
    if (!instruction) break;

    const opcode = Number(instruction[1]);
    const args = instruction.slice(2, 5).map(Number);
    program.push({opcode, args});
  }
  return {program, rowOffset: i};
}

function parseInstructions(rows, offset = 0) {
  const instructions = [];
  let i;
  for (i = offset; i < rows.length; i += 4) {
    const before = /Before: \[(\d+), (\d+), (\d+), (\d)]/.exec(rows[i]);
    const instruction = /(\d+) (\d+) (\d+) (\d)/.exec(rows[i + 1]);
    const after = /After:  \[(\d+), (\d+), (\d+), (\d)]/.exec(rows[i + 2]);
    if (!before || !instruction || !after) break;

    const setup = before.slice(1, 5).map(Number);
    const opcode = Number(instruction[1]);
    const args = instruction.slice(2, 5).map(Number);
    const result = after.slice(1, 5).map(Number);
    instructions.push({setup, opcode, args, result});
  }
  return {instructions, rowOffset: i};
}

class VM {
  constructor() {
    this.registers = [0, 0, 0, 0];
    this.optable = {
      0: "addr",
      1: "addi",
      2: "mulr",
      3: "muli",
      4: "banr",
      5: "bani",
      6: "borr",
      7: "bori",
      8: "setr",
      9: "seti",
      10: "gtir",
      11: "gtri",
      12: "gtrr",
      13: "eqir",
      14: "eqri",
      15: "eqrr",
    };
  }

  setOptable(optable) {
    this.optable = optable;
  }

  getOp(opcode) {
    return this.optable[opcode];
  }

  setRegisters(a, b, c, d) {
    this.registers = [a, b, c, d];
  }

  checkRegisters(a, b, c, d) {
    const r = this.registers;
    return r[0] === a && r[1] === b && r[2] === c && r[3] === d;
  }

  execute(opcode, a, b, c) {
    const op = this.getOp(opcode);
    const reg = this.registers;

    if (op === "addr") reg[c] = reg[a] + reg[b];
    else if (op === "addi") reg[c] = reg[a] + b;

    else if (op === "mulr") reg[c] = reg[a] * reg[b];
    else if (op === "muli") reg[c] = reg[a] * b;

    else if (op === "banr") reg[c] = reg[a] & reg[b];
    else if (op === "bani") reg[c] = reg[a] & b;

    else if (op === "borr") reg[c] = reg[a] | reg[b];
    else if (op === "bori") reg[c] = reg[a] | b;

    else if (op === "setr") reg[c] = reg[a];
    else if (op === "seti") reg[c] = a;

    else if (op === "gtir") reg[c] = a > reg[b] ? 1 : 0;
    else if (op === "gtri") reg[c] = reg[a] > b ? 1 : 0;
    else if (op === "gtrr") reg[c] = reg[a] > reg[b] ? 1 : 0;

    else if (op === "eqir") reg[c] = a === reg[b] ? 1 : 0;
    else if (op === "eqri") reg[c] = reg[a] === b ? 1 : 0;
    else if (op === "eqrr") reg[c] = reg[a] === reg[b] ? 1 : 0;

    else throw new Error(`Invalid operation op(${op}) opcode(${opcode})`)
  }
}

const input = `Before: [2, 3, 2, 2]
0 3 3 0
After:  [0, 3, 2, 2]

Before: [1, 1, 2, 3]
6 0 2 0
After:  [0, 1, 2, 3]

Before: [1, 0, 2, 2]
6 0 2 0
After:  [0, 0, 2, 2]

Before: [1, 1, 1, 1]
11 2 1 0
After:  [2, 1, 1, 1]

Before: [3, 0, 0, 2]
0 3 3 2
After:  [3, 0, 0, 2]

Before: [1, 1, 2, 2]
9 1 0 2
After:  [1, 1, 1, 2]

Before: [3, 2, 1, 1]
5 2 1 1
After:  [3, 2, 1, 1]

Before: [1, 1, 0, 3]
7 1 3 0
After:  [0, 1, 0, 3]

Before: [1, 2, 1, 3]
5 2 1 0
After:  [2, 2, 1, 3]

Before: [0, 2, 2, 0]
8 0 0 0
After:  [0, 2, 2, 0]

Before: [2, 0, 0, 1]
3 0 3 0
After:  [1, 0, 0, 1]

Before: [3, 1, 2, 2]
4 1 3 1
After:  [3, 0, 2, 2]

Before: [2, 2, 1, 1]
5 2 1 1
After:  [2, 2, 1, 1]

Before: [1, 1, 2, 2]
6 0 2 2
After:  [1, 1, 0, 2]

Before: [1, 1, 1, 2]
4 1 3 0
After:  [0, 1, 1, 2]

Before: [2, 1, 3, 1]
13 1 3 0
After:  [1, 1, 3, 1]

Before: [0, 1, 2, 1]
13 1 3 1
After:  [0, 1, 2, 1]

Before: [2, 1, 0, 2]
4 1 3 1
After:  [2, 0, 0, 2]

Before: [2, 1, 0, 1]
2 0 1 3
After:  [2, 1, 0, 1]

Before: [3, 1, 2, 1]
12 1 2 2
After:  [3, 1, 0, 1]

Before: [1, 1, 3, 2]
4 1 3 3
After:  [1, 1, 3, 0]

Before: [2, 2, 1, 3]
7 1 3 0
After:  [0, 2, 1, 3]

Before: [1, 3, 2, 1]
6 0 2 1
After:  [1, 0, 2, 1]

Before: [2, 1, 2, 1]
13 1 3 1
After:  [2, 1, 2, 1]

Before: [2, 1, 3, 0]
14 2 0 3
After:  [2, 1, 3, 1]

Before: [1, 1, 2, 3]
6 0 2 3
After:  [1, 1, 2, 0]

Before: [1, 1, 1, 3]
11 2 1 2
After:  [1, 1, 2, 3]

Before: [2, 2, 3, 2]
0 3 3 0
After:  [0, 2, 3, 2]

Before: [1, 2, 0, 2]
1 0 2 3
After:  [1, 2, 0, 0]

Before: [2, 1, 0, 0]
2 0 1 3
After:  [2, 1, 0, 1]

Before: [0, 2, 1, 1]
5 2 1 3
After:  [0, 2, 1, 2]

Before: [0, 3, 2, 1]
10 3 2 3
After:  [0, 3, 2, 1]

Before: [3, 3, 2, 2]
0 3 3 0
After:  [0, 3, 2, 2]

Before: [1, 1, 2, 0]
12 1 2 0
After:  [0, 1, 2, 0]

Before: [0, 2, 1, 3]
5 2 1 0
After:  [2, 2, 1, 3]

Before: [0, 3, 2, 1]
8 0 0 0
After:  [0, 3, 2, 1]

Before: [1, 1, 1, 3]
11 2 1 1
After:  [1, 2, 1, 3]

Before: [0, 1, 1, 2]
11 2 1 2
After:  [0, 1, 2, 2]

Before: [1, 1, 1, 1]
13 1 3 1
After:  [1, 1, 1, 1]

Before: [1, 3, 0, 0]
1 0 2 1
After:  [1, 0, 0, 0]

Before: [2, 2, 3, 1]
14 2 0 1
After:  [2, 1, 3, 1]

Before: [0, 3, 0, 3]
8 0 0 3
After:  [0, 3, 0, 0]

Before: [0, 0, 1, 1]
8 0 0 2
After:  [0, 0, 0, 1]

Before: [0, 3, 2, 1]
8 0 0 2
After:  [0, 3, 0, 1]

Before: [2, 1, 2, 3]
12 1 2 1
After:  [2, 0, 2, 3]

Before: [3, 2, 2, 3]
14 2 1 2
After:  [3, 2, 1, 3]

Before: [2, 2, 3, 0]
15 2 2 2
After:  [2, 2, 1, 0]

Before: [2, 3, 3, 2]
15 2 2 0
After:  [1, 3, 3, 2]

Before: [1, 1, 0, 0]
1 0 2 3
After:  [1, 1, 0, 0]

Before: [3, 2, 2, 2]
0 3 3 3
After:  [3, 2, 2, 0]

Before: [1, 3, 2, 2]
6 0 2 3
After:  [1, 3, 2, 0]

Before: [2, 1, 0, 1]
3 0 3 1
After:  [2, 1, 0, 1]

Before: [3, 3, 1, 3]
7 2 3 0
After:  [0, 3, 1, 3]

Before: [0, 2, 1, 0]
5 2 1 3
After:  [0, 2, 1, 2]

Before: [1, 1, 1, 2]
4 1 3 2
After:  [1, 1, 0, 2]

Before: [0, 3, 1, 2]
8 0 0 1
After:  [0, 0, 1, 2]

Before: [2, 1, 3, 3]
7 1 3 0
After:  [0, 1, 3, 3]

Before: [3, 2, 2, 1]
10 3 2 0
After:  [1, 2, 2, 1]

Before: [2, 1, 0, 1]
3 0 3 3
After:  [2, 1, 0, 1]

Before: [2, 1, 1, 1]
13 1 3 2
After:  [2, 1, 1, 1]

Before: [2, 2, 0, 3]
7 1 3 1
After:  [2, 0, 0, 3]

Before: [2, 2, 0, 1]
3 0 3 0
After:  [1, 2, 0, 1]

Before: [2, 2, 3, 1]
3 0 3 3
After:  [2, 2, 3, 1]

Before: [1, 2, 0, 0]
1 0 2 1
After:  [1, 0, 0, 0]

Before: [2, 2, 2, 2]
14 3 2 1
After:  [2, 0, 2, 2]

Before: [3, 1, 1, 2]
4 1 3 1
After:  [3, 0, 1, 2]

Before: [2, 1, 1, 1]
2 0 1 3
After:  [2, 1, 1, 1]

Before: [1, 1, 0, 0]
1 0 2 1
After:  [1, 0, 0, 0]

Before: [1, 3, 0, 2]
1 0 2 1
After:  [1, 0, 0, 2]

Before: [1, 1, 1, 3]
9 1 0 2
After:  [1, 1, 1, 3]

Before: [3, 1, 2, 2]
12 1 2 2
After:  [3, 1, 0, 2]

Before: [0, 1, 2, 1]
12 1 2 2
After:  [0, 1, 0, 1]

Before: [3, 2, 0, 3]
7 1 3 3
After:  [3, 2, 0, 0]

Before: [2, 1, 2, 3]
7 2 3 2
After:  [2, 1, 0, 3]

Before: [3, 1, 3, 1]
13 1 3 0
After:  [1, 1, 3, 1]

Before: [2, 1, 1, 1]
11 2 1 0
After:  [2, 1, 1, 1]

Before: [0, 1, 1, 0]
11 2 1 3
After:  [0, 1, 1, 2]

Before: [2, 1, 3, 3]
7 1 3 2
After:  [2, 1, 0, 3]

Before: [2, 3, 2, 1]
10 3 2 1
After:  [2, 1, 2, 1]

Before: [1, 1, 2, 2]
4 1 3 1
After:  [1, 0, 2, 2]

Before: [1, 3, 0, 1]
1 0 2 0
After:  [0, 3, 0, 1]

Before: [1, 3, 0, 3]
1 0 2 3
After:  [1, 3, 0, 0]

Before: [2, 3, 3, 1]
3 0 3 1
After:  [2, 1, 3, 1]

Before: [2, 1, 1, 2]
11 2 1 3
After:  [2, 1, 1, 2]

Before: [2, 1, 1, 1]
2 0 1 1
After:  [2, 1, 1, 1]

Before: [3, 1, 2, 2]
4 1 3 0
After:  [0, 1, 2, 2]

Before: [2, 0, 2, 1]
10 3 2 1
After:  [2, 1, 2, 1]

Before: [1, 3, 0, 1]
1 0 2 1
After:  [1, 0, 0, 1]

Before: [1, 1, 0, 2]
9 1 0 0
After:  [1, 1, 0, 2]

Before: [2, 3, 2, 1]
3 0 3 2
After:  [2, 3, 1, 1]

Before: [1, 2, 2, 1]
0 3 3 3
After:  [1, 2, 2, 0]

Before: [3, 1, 2, 2]
12 1 2 1
After:  [3, 0, 2, 2]

Before: [0, 2, 3, 1]
8 0 0 1
After:  [0, 0, 3, 1]

Before: [0, 0, 2, 1]
10 3 2 2
After:  [0, 0, 1, 1]

Before: [3, 2, 1, 3]
15 0 0 3
After:  [3, 2, 1, 1]

Before: [1, 3, 2, 2]
6 0 2 2
After:  [1, 3, 0, 2]

Before: [1, 2, 2, 3]
6 0 2 3
After:  [1, 2, 2, 0]

Before: [1, 1, 3, 2]
4 1 3 2
After:  [1, 1, 0, 2]

Before: [1, 2, 2, 1]
10 3 2 3
After:  [1, 2, 2, 1]

Before: [1, 2, 2, 1]
6 0 2 2
After:  [1, 2, 0, 1]

Before: [1, 2, 1, 3]
7 2 3 1
After:  [1, 0, 1, 3]

Before: [1, 2, 2, 1]
10 3 2 0
After:  [1, 2, 2, 1]

Before: [2, 3, 3, 1]
3 0 3 3
After:  [2, 3, 3, 1]

Before: [2, 3, 2, 3]
14 2 0 2
After:  [2, 3, 1, 3]

Before: [2, 1, 3, 1]
2 0 1 3
After:  [2, 1, 3, 1]

Before: [0, 3, 3, 0]
8 0 0 1
After:  [0, 0, 3, 0]

Before: [2, 1, 1, 3]
7 2 3 2
After:  [2, 1, 0, 3]

Before: [0, 2, 2, 1]
10 3 2 3
After:  [0, 2, 2, 1]

Before: [3, 2, 1, 3]
5 2 1 3
After:  [3, 2, 1, 2]

Before: [3, 1, 1, 2]
0 3 3 2
After:  [3, 1, 0, 2]

Before: [0, 3, 1, 3]
7 2 3 3
After:  [0, 3, 1, 0]

Before: [2, 0, 2, 1]
10 3 2 3
After:  [2, 0, 2, 1]

Before: [2, 2, 1, 0]
5 2 1 2
After:  [2, 2, 2, 0]

Before: [2, 1, 2, 2]
4 1 3 3
After:  [2, 1, 2, 0]

Before: [1, 3, 1, 1]
0 2 3 2
After:  [1, 3, 0, 1]

Before: [1, 1, 0, 3]
1 0 2 3
After:  [1, 1, 0, 0]

Before: [1, 0, 0, 3]
1 0 2 2
After:  [1, 0, 0, 3]

Before: [2, 1, 1, 0]
11 2 1 0
After:  [2, 1, 1, 0]

Before: [2, 0, 0, 1]
3 0 3 3
After:  [2, 0, 0, 1]

Before: [3, 3, 0, 1]
14 0 2 2
After:  [3, 3, 1, 1]

Before: [0, 1, 2, 0]
8 0 0 1
After:  [0, 0, 2, 0]

Before: [2, 0, 1, 1]
3 0 3 2
After:  [2, 0, 1, 1]

Before: [1, 3, 2, 0]
6 0 2 1
After:  [1, 0, 2, 0]

Before: [3, 3, 2, 0]
2 0 2 3
After:  [3, 3, 2, 1]

Before: [2, 1, 0, 1]
13 1 3 2
After:  [2, 1, 1, 1]

Before: [1, 1, 2, 1]
13 1 3 2
After:  [1, 1, 1, 1]

Before: [1, 3, 2, 0]
6 0 2 2
After:  [1, 3, 0, 0]

Before: [3, 1, 3, 2]
4 1 3 1
After:  [3, 0, 3, 2]

Before: [2, 3, 2, 2]
15 0 0 3
After:  [2, 3, 2, 1]

Before: [2, 3, 2, 1]
3 0 3 3
After:  [2, 3, 2, 1]

Before: [2, 1, 1, 2]
4 1 3 0
After:  [0, 1, 1, 2]

Before: [1, 1, 1, 1]
13 1 3 0
After:  [1, 1, 1, 1]

Before: [3, 1, 1, 0]
11 2 1 2
After:  [3, 1, 2, 0]

Before: [3, 1, 1, 1]
11 2 1 0
After:  [2, 1, 1, 1]

Before: [3, 1, 0, 2]
4 1 3 0
After:  [0, 1, 0, 2]

Before: [3, 3, 1, 3]
15 0 0 3
After:  [3, 3, 1, 1]

Before: [1, 2, 2, 1]
10 3 2 1
After:  [1, 1, 2, 1]

Before: [1, 1, 1, 0]
11 2 1 3
After:  [1, 1, 1, 2]

Before: [1, 1, 1, 2]
11 2 1 0
After:  [2, 1, 1, 2]

Before: [3, 2, 2, 2]
14 2 1 2
After:  [3, 2, 1, 2]

Before: [0, 0, 3, 3]
15 2 2 3
After:  [0, 0, 3, 1]

Before: [0, 3, 2, 2]
0 3 3 0
After:  [0, 3, 2, 2]

Before: [1, 0, 2, 1]
10 3 2 1
After:  [1, 1, 2, 1]

Before: [2, 1, 2, 2]
14 3 2 1
After:  [2, 0, 2, 2]

Before: [1, 0, 0, 3]
1 0 2 1
After:  [1, 0, 0, 3]

Before: [3, 2, 1, 3]
7 2 3 1
After:  [3, 0, 1, 3]

Before: [3, 1, 1, 2]
11 2 1 0
After:  [2, 1, 1, 2]

Before: [1, 3, 2, 1]
6 0 2 0
After:  [0, 3, 2, 1]

Before: [2, 0, 3, 1]
3 0 3 0
After:  [1, 0, 3, 1]

Before: [3, 1, 2, 2]
12 1 2 0
After:  [0, 1, 2, 2]

Before: [3, 1, 2, 0]
12 1 2 3
After:  [3, 1, 2, 0]

Before: [2, 1, 2, 0]
2 0 1 3
After:  [2, 1, 2, 1]

Before: [1, 1, 3, 1]
14 2 3 2
After:  [1, 1, 0, 1]

Before: [1, 3, 2, 3]
6 0 2 0
After:  [0, 3, 2, 3]

Before: [1, 1, 2, 3]
12 1 2 0
After:  [0, 1, 2, 3]

Before: [3, 0, 2, 1]
10 3 2 1
After:  [3, 1, 2, 1]

Before: [1, 0, 2, 0]
6 0 2 1
After:  [1, 0, 2, 0]

Before: [2, 3, 1, 3]
7 2 3 2
After:  [2, 3, 0, 3]

Before: [1, 1, 1, 1]
11 2 1 3
After:  [1, 1, 1, 2]

Before: [2, 1, 2, 2]
2 0 1 0
After:  [1, 1, 2, 2]

Before: [1, 2, 1, 3]
7 2 3 3
After:  [1, 2, 1, 0]

Before: [1, 1, 2, 2]
12 1 2 0
After:  [0, 1, 2, 2]

Before: [2, 0, 2, 1]
10 3 2 2
After:  [2, 0, 1, 1]

Before: [0, 1, 2, 3]
12 1 2 2
After:  [0, 1, 0, 3]

Before: [2, 1, 1, 3]
11 2 1 0
After:  [2, 1, 1, 3]

Before: [2, 1, 3, 1]
13 1 3 3
After:  [2, 1, 3, 1]

Before: [0, 2, 1, 1]
8 0 0 1
After:  [0, 0, 1, 1]

Before: [1, 0, 0, 2]
1 0 2 1
After:  [1, 0, 0, 2]

Before: [2, 1, 3, 3]
2 0 1 1
After:  [2, 1, 3, 3]

Before: [0, 1, 2, 2]
4 1 3 2
After:  [0, 1, 0, 2]

Before: [1, 1, 2, 1]
13 1 3 0
After:  [1, 1, 2, 1]

Before: [1, 1, 3, 0]
9 1 0 1
After:  [1, 1, 3, 0]

Before: [1, 1, 0, 1]
1 0 2 1
After:  [1, 0, 0, 1]

Before: [2, 2, 3, 1]
3 0 3 1
After:  [2, 1, 3, 1]

Before: [3, 2, 1, 2]
5 2 1 0
After:  [2, 2, 1, 2]

Before: [1, 1, 2, 0]
12 1 2 1
After:  [1, 0, 2, 0]

Before: [3, 0, 2, 3]
2 0 2 3
After:  [3, 0, 2, 1]

Before: [2, 1, 3, 3]
2 0 1 2
After:  [2, 1, 1, 3]

Before: [3, 1, 3, 1]
15 0 0 0
After:  [1, 1, 3, 1]

Before: [0, 1, 3, 2]
4 1 3 1
After:  [0, 0, 3, 2]

Before: [3, 2, 3, 3]
15 2 0 0
After:  [1, 2, 3, 3]

Before: [1, 3, 3, 1]
0 3 3 0
After:  [0, 3, 3, 1]

Before: [0, 0, 2, 3]
7 2 3 0
After:  [0, 0, 2, 3]

Before: [0, 2, 1, 3]
7 2 3 2
After:  [0, 2, 0, 3]

Before: [3, 0, 2, 1]
2 0 2 0
After:  [1, 0, 2, 1]

Before: [2, 2, 2, 1]
10 3 2 2
After:  [2, 2, 1, 1]

Before: [1, 2, 0, 1]
1 0 2 0
After:  [0, 2, 0, 1]

Before: [1, 2, 0, 0]
1 0 2 2
After:  [1, 2, 0, 0]

Before: [3, 1, 2, 1]
2 0 2 1
After:  [3, 1, 2, 1]

Before: [0, 0, 3, 1]
8 0 0 1
After:  [0, 0, 3, 1]

Before: [0, 1, 1, 2]
11 2 1 3
After:  [0, 1, 1, 2]

Before: [0, 1, 3, 1]
13 1 3 2
After:  [0, 1, 1, 1]

Before: [1, 1, 1, 2]
11 2 1 2
After:  [1, 1, 2, 2]

Before: [2, 0, 3, 1]
3 0 3 3
After:  [2, 0, 3, 1]

Before: [0, 2, 1, 2]
8 0 0 0
After:  [0, 2, 1, 2]

Before: [1, 0, 2, 1]
6 0 2 1
After:  [1, 0, 2, 1]

Before: [1, 1, 0, 2]
4 1 3 3
After:  [1, 1, 0, 0]

Before: [2, 2, 1, 1]
3 0 3 2
After:  [2, 2, 1, 1]

Before: [1, 2, 1, 2]
5 2 1 2
After:  [1, 2, 2, 2]

Before: [2, 0, 2, 1]
3 0 3 3
After:  [2, 0, 2, 1]

Before: [2, 1, 0, 1]
3 0 3 2
After:  [2, 1, 1, 1]

Before: [2, 2, 1, 2]
5 2 1 1
After:  [2, 2, 1, 2]

Before: [1, 1, 2, 2]
9 1 0 3
After:  [1, 1, 2, 1]

Before: [2, 2, 1, 3]
15 0 0 3
After:  [2, 2, 1, 1]

Before: [3, 1, 0, 1]
13 1 3 3
After:  [3, 1, 0, 1]

Before: [3, 3, 2, 1]
10 3 2 2
After:  [3, 3, 1, 1]

Before: [0, 1, 3, 2]
4 1 3 3
After:  [0, 1, 3, 0]

Before: [0, 1, 1, 0]
11 2 1 2
After:  [0, 1, 2, 0]

Before: [3, 1, 3, 1]
14 3 1 0
After:  [0, 1, 3, 1]

Before: [0, 1, 3, 3]
8 0 0 3
After:  [0, 1, 3, 0]

Before: [0, 1, 2, 1]
10 3 2 0
After:  [1, 1, 2, 1]

Before: [2, 1, 2, 1]
3 0 3 2
After:  [2, 1, 1, 1]

Before: [0, 2, 1, 3]
5 2 1 3
After:  [0, 2, 1, 2]

Before: [1, 0, 0, 3]
1 0 2 0
After:  [0, 0, 0, 3]

Before: [2, 3, 0, 1]
3 0 3 0
After:  [1, 3, 0, 1]

Before: [2, 1, 2, 1]
12 1 2 1
After:  [2, 0, 2, 1]

Before: [2, 1, 3, 2]
4 1 3 0
After:  [0, 1, 3, 2]

Before: [1, 2, 1, 0]
5 2 1 3
After:  [1, 2, 1, 2]

Before: [3, 1, 3, 1]
13 1 3 1
After:  [3, 1, 3, 1]

Before: [1, 2, 1, 0]
5 2 1 1
After:  [1, 2, 1, 0]

Before: [3, 1, 2, 1]
10 3 2 1
After:  [3, 1, 2, 1]

Before: [1, 1, 1, 1]
13 1 3 2
After:  [1, 1, 1, 1]

Before: [2, 1, 2, 1]
13 1 3 2
After:  [2, 1, 1, 1]

Before: [1, 2, 1, 3]
7 1 3 1
After:  [1, 0, 1, 3]

Before: [0, 0, 2, 2]
14 3 2 3
After:  [0, 0, 2, 0]

Before: [2, 2, 1, 3]
15 0 0 1
After:  [2, 1, 1, 3]

Before: [2, 1, 3, 2]
4 1 3 1
After:  [2, 0, 3, 2]

Before: [1, 2, 1, 3]
5 2 1 2
After:  [1, 2, 2, 3]

Before: [2, 2, 1, 0]
5 2 1 3
After:  [2, 2, 1, 2]

Before: [2, 0, 2, 1]
3 0 3 2
After:  [2, 0, 1, 1]

Before: [1, 0, 0, 1]
1 0 2 0
After:  [0, 0, 0, 1]

Before: [2, 1, 1, 0]
15 0 0 0
After:  [1, 1, 1, 0]

Before: [0, 0, 3, 3]
8 0 0 0
After:  [0, 0, 3, 3]

Before: [1, 1, 1, 2]
4 1 3 3
After:  [1, 1, 1, 0]

Before: [1, 2, 0, 3]
1 0 2 1
After:  [1, 0, 0, 3]

Before: [1, 1, 0, 2]
9 1 0 1
After:  [1, 1, 0, 2]

Before: [3, 1, 1, 1]
11 2 1 3
After:  [3, 1, 1, 2]

Before: [1, 1, 0, 3]
7 1 3 1
After:  [1, 0, 0, 3]

Before: [1, 1, 1, 3]
7 1 3 2
After:  [1, 1, 0, 3]

Before: [1, 1, 2, 3]
6 0 2 1
After:  [1, 0, 2, 3]

Before: [2, 1, 1, 2]
4 1 3 3
After:  [2, 1, 1, 0]

Before: [2, 2, 2, 3]
7 1 3 2
After:  [2, 2, 0, 3]

Before: [1, 3, 2, 1]
0 3 3 3
After:  [1, 3, 2, 0]

Before: [0, 0, 3, 3]
8 0 0 3
After:  [0, 0, 3, 0]

Before: [3, 1, 3, 1]
15 0 0 1
After:  [3, 1, 3, 1]

Before: [1, 0, 0, 2]
1 0 2 2
After:  [1, 0, 0, 2]

Before: [0, 0, 0, 1]
0 3 3 1
After:  [0, 0, 0, 1]

Before: [1, 1, 1, 2]
9 1 0 0
After:  [1, 1, 1, 2]

Before: [1, 3, 0, 1]
1 0 2 2
After:  [1, 3, 0, 1]

Before: [1, 1, 3, 3]
9 1 0 0
After:  [1, 1, 3, 3]

Before: [2, 1, 3, 1]
13 1 3 2
After:  [2, 1, 1, 1]

Before: [2, 1, 3, 2]
4 1 3 3
After:  [2, 1, 3, 0]

Before: [2, 1, 2, 1]
13 1 3 3
After:  [2, 1, 2, 1]

Before: [1, 0, 2, 2]
6 0 2 1
After:  [1, 0, 2, 2]

Before: [1, 1, 2, 1]
10 3 2 2
After:  [1, 1, 1, 1]

Before: [3, 2, 1, 3]
5 2 1 2
After:  [3, 2, 2, 3]

Before: [0, 1, 2, 0]
12 1 2 2
After:  [0, 1, 0, 0]

Before: [2, 1, 1, 3]
2 0 1 0
After:  [1, 1, 1, 3]

Before: [1, 2, 2, 3]
14 2 1 2
After:  [1, 2, 1, 3]

Before: [1, 2, 0, 3]
1 0 2 0
After:  [0, 2, 0, 3]

Before: [0, 1, 2, 2]
8 0 0 2
After:  [0, 1, 0, 2]

Before: [0, 2, 1, 0]
5 2 1 1
After:  [0, 2, 1, 0]

Before: [2, 0, 0, 1]
15 0 0 2
After:  [2, 0, 1, 1]

Before: [2, 2, 1, 3]
5 2 1 0
After:  [2, 2, 1, 3]

Before: [3, 2, 2, 1]
10 3 2 2
After:  [3, 2, 1, 1]

Before: [0, 3, 2, 2]
14 3 2 2
After:  [0, 3, 0, 2]

Before: [1, 2, 0, 1]
1 0 2 2
After:  [1, 2, 0, 1]

Before: [0, 1, 1, 0]
11 2 1 0
After:  [2, 1, 1, 0]

Before: [1, 2, 2, 3]
14 2 1 3
After:  [1, 2, 2, 1]

Before: [2, 1, 3, 1]
3 0 3 3
After:  [2, 1, 3, 1]

Before: [0, 1, 2, 3]
7 1 3 3
After:  [0, 1, 2, 0]

Before: [2, 1, 2, 2]
2 0 1 1
After:  [2, 1, 2, 2]

Before: [2, 2, 1, 0]
5 2 1 1
After:  [2, 2, 1, 0]

Before: [3, 2, 1, 3]
5 2 1 0
After:  [2, 2, 1, 3]

Before: [1, 1, 2, 1]
0 3 3 1
After:  [1, 0, 2, 1]

Before: [1, 0, 2, 1]
6 0 2 3
After:  [1, 0, 2, 0]

Before: [1, 3, 0, 2]
1 0 2 0
After:  [0, 3, 0, 2]

Before: [0, 1, 1, 3]
11 2 1 2
After:  [0, 1, 2, 3]

Before: [1, 1, 3, 3]
9 1 0 1
After:  [1, 1, 3, 3]

Before: [3, 1, 2, 3]
12 1 2 1
After:  [3, 0, 2, 3]

Before: [0, 1, 1, 1]
13 1 3 0
After:  [1, 1, 1, 1]

Before: [1, 1, 2, 3]
9 1 0 1
After:  [1, 1, 2, 3]

Before: [0, 3, 1, 3]
7 2 3 0
After:  [0, 3, 1, 3]

Before: [3, 1, 2, 1]
13 1 3 2
After:  [3, 1, 1, 1]

Before: [1, 0, 1, 3]
7 2 3 1
After:  [1, 0, 1, 3]

Before: [1, 1, 0, 3]
1 0 2 0
After:  [0, 1, 0, 3]

Before: [2, 1, 2, 2]
12 1 2 2
After:  [2, 1, 0, 2]

Before: [3, 0, 1, 3]
14 3 0 0
After:  [1, 0, 1, 3]

Before: [3, 1, 3, 3]
7 1 3 3
After:  [3, 1, 3, 0]

Before: [1, 1, 0, 0]
1 0 2 0
After:  [0, 1, 0, 0]

Before: [1, 1, 1, 1]
0 2 3 2
After:  [1, 1, 0, 1]

Before: [2, 1, 0, 1]
2 0 1 2
After:  [2, 1, 1, 1]

Before: [1, 1, 2, 1]
14 3 1 1
After:  [1, 0, 2, 1]

Before: [0, 0, 2, 3]
7 2 3 3
After:  [0, 0, 2, 0]

Before: [3, 2, 0, 0]
14 0 2 1
After:  [3, 1, 0, 0]

Before: [0, 0, 2, 3]
8 0 0 0
After:  [0, 0, 2, 3]

Before: [3, 1, 1, 0]
11 2 1 1
After:  [3, 2, 1, 0]

Before: [1, 2, 1, 1]
5 2 1 2
After:  [1, 2, 2, 1]

Before: [0, 2, 1, 3]
7 2 3 3
After:  [0, 2, 1, 0]

Before: [3, 1, 2, 2]
15 0 0 3
After:  [3, 1, 2, 1]

Before: [0, 0, 0, 2]
8 0 0 2
After:  [0, 0, 0, 2]

Before: [3, 1, 3, 1]
13 1 3 2
After:  [3, 1, 1, 1]

Before: [1, 1, 2, 3]
9 1 0 2
After:  [1, 1, 1, 3]

Before: [1, 2, 0, 2]
1 0 2 2
After:  [1, 2, 0, 2]

Before: [2, 1, 2, 3]
2 0 1 3
After:  [2, 1, 2, 1]

Before: [1, 2, 0, 3]
1 0 2 2
After:  [1, 2, 0, 3]

Before: [1, 0, 2, 0]
6 0 2 3
After:  [1, 0, 2, 0]

Before: [1, 0, 3, 1]
0 3 3 2
After:  [1, 0, 0, 1]

Before: [1, 3, 2, 1]
6 0 2 3
After:  [1, 3, 2, 0]

Before: [1, 1, 1, 1]
9 1 0 3
After:  [1, 1, 1, 1]

Before: [0, 3, 2, 1]
0 3 3 1
After:  [0, 0, 2, 1]

Before: [1, 1, 3, 1]
13 1 3 3
After:  [1, 1, 3, 1]

Before: [2, 2, 0, 3]
7 1 3 0
After:  [0, 2, 0, 3]

Before: [0, 3, 2, 1]
0 3 3 0
After:  [0, 3, 2, 1]

Before: [1, 0, 0, 1]
1 0 2 2
After:  [1, 0, 0, 1]

Before: [2, 1, 2, 1]
2 0 1 2
After:  [2, 1, 1, 1]

Before: [1, 2, 2, 2]
6 0 2 2
After:  [1, 2, 0, 2]

Before: [0, 1, 1, 1]
13 1 3 3
After:  [0, 1, 1, 1]

Before: [2, 1, 1, 0]
11 2 1 2
After:  [2, 1, 2, 0]

Before: [0, 1, 3, 1]
13 1 3 1
After:  [0, 1, 3, 1]

Before: [3, 2, 0, 2]
0 3 3 1
After:  [3, 0, 0, 2]

Before: [1, 1, 2, 1]
10 3 2 3
After:  [1, 1, 2, 1]

Before: [2, 1, 2, 1]
13 1 3 0
After:  [1, 1, 2, 1]

Before: [2, 1, 0, 1]
13 1 3 1
After:  [2, 1, 0, 1]

Before: [2, 1, 2, 2]
12 1 2 3
After:  [2, 1, 2, 0]

Before: [0, 1, 2, 0]
12 1 2 1
After:  [0, 0, 2, 0]

Before: [3, 1, 2, 2]
4 1 3 2
After:  [3, 1, 0, 2]

Before: [1, 1, 0, 2]
1 0 2 1
After:  [1, 0, 0, 2]

Before: [0, 2, 1, 1]
0 2 3 2
After:  [0, 2, 0, 1]

Before: [1, 1, 2, 0]
6 0 2 0
After:  [0, 1, 2, 0]

Before: [0, 3, 1, 2]
8 0 0 3
After:  [0, 3, 1, 0]

Before: [1, 3, 0, 0]
1 0 2 2
After:  [1, 3, 0, 0]

Before: [1, 1, 2, 0]
12 1 2 2
After:  [1, 1, 0, 0]

Before: [2, 1, 0, 2]
0 3 3 1
After:  [2, 0, 0, 2]

Before: [0, 3, 3, 3]
8 0 0 1
After:  [0, 0, 3, 3]

Before: [3, 3, 0, 1]
0 3 3 0
After:  [0, 3, 0, 1]

Before: [3, 1, 1, 2]
4 1 3 3
After:  [3, 1, 1, 0]

Before: [2, 1, 2, 3]
12 1 2 3
After:  [2, 1, 2, 0]

Before: [3, 1, 2, 1]
12 1 2 3
After:  [3, 1, 2, 0]

Before: [1, 0, 2, 2]
6 0 2 3
After:  [1, 0, 2, 0]

Before: [1, 1, 0, 1]
0 3 3 1
After:  [1, 0, 0, 1]

Before: [1, 1, 0, 3]
9 1 0 2
After:  [1, 1, 1, 3]

Before: [3, 0, 2, 1]
10 3 2 3
After:  [3, 0, 2, 1]

Before: [2, 2, 3, 3]
14 3 2 3
After:  [2, 2, 3, 1]

Before: [3, 1, 2, 2]
12 1 2 3
After:  [3, 1, 2, 0]

Before: [0, 1, 2, 1]
10 3 2 1
After:  [0, 1, 2, 1]

Before: [0, 1, 3, 0]
8 0 0 2
After:  [0, 1, 0, 0]

Before: [3, 1, 2, 0]
12 1 2 1
After:  [3, 0, 2, 0]

Before: [1, 3, 2, 0]
6 0 2 3
After:  [1, 3, 2, 0]

Before: [2, 0, 1, 3]
7 2 3 3
After:  [2, 0, 1, 0]

Before: [3, 2, 2, 1]
10 3 2 3
After:  [3, 2, 2, 1]

Before: [1, 2, 0, 0]
1 0 2 3
After:  [1, 2, 0, 0]

Before: [2, 1, 1, 1]
0 2 3 0
After:  [0, 1, 1, 1]

Before: [3, 2, 1, 1]
5 2 1 3
After:  [3, 2, 1, 2]

Before: [3, 1, 3, 1]
14 2 3 0
After:  [0, 1, 3, 1]

Before: [2, 1, 1, 3]
14 2 1 1
After:  [2, 0, 1, 3]

Before: [0, 1, 1, 2]
8 0 0 0
After:  [0, 1, 1, 2]

Before: [2, 3, 3, 2]
15 2 2 2
After:  [2, 3, 1, 2]

Before: [0, 1, 2, 3]
7 2 3 1
After:  [0, 0, 2, 3]

Before: [1, 1, 0, 2]
4 1 3 2
After:  [1, 1, 0, 2]

Before: [0, 2, 3, 0]
8 0 0 2
After:  [0, 2, 0, 0]

Before: [0, 1, 1, 1]
11 2 1 1
After:  [0, 2, 1, 1]

Before: [2, 1, 1, 1]
13 1 3 0
After:  [1, 1, 1, 1]

Before: [2, 3, 1, 3]
7 2 3 0
After:  [0, 3, 1, 3]

Before: [2, 1, 2, 3]
12 1 2 2
After:  [2, 1, 0, 3]

Before: [2, 2, 1, 3]
5 2 1 3
After:  [2, 2, 1, 2]

Before: [3, 1, 1, 3]
11 2 1 0
After:  [2, 1, 1, 3]

Before: [0, 0, 1, 3]
7 2 3 1
After:  [0, 0, 1, 3]

Before: [1, 3, 2, 1]
10 3 2 2
After:  [1, 3, 1, 1]

Before: [3, 2, 1, 2]
15 0 0 2
After:  [3, 2, 1, 2]

Before: [1, 2, 1, 1]
0 2 3 1
After:  [1, 0, 1, 1]

Before: [1, 1, 1, 3]
9 1 0 3
After:  [1, 1, 1, 1]

Before: [1, 1, 0, 3]
9 1 0 3
After:  [1, 1, 0, 1]

Before: [0, 1, 1, 1]
11 2 1 2
After:  [0, 1, 2, 1]

Before: [0, 1, 2, 1]
13 1 3 2
After:  [0, 1, 1, 1]

Before: [1, 1, 2, 2]
4 1 3 2
After:  [1, 1, 0, 2]

Before: [3, 1, 1, 2]
11 2 1 3
After:  [3, 1, 1, 2]

Before: [2, 2, 3, 2]
0 3 3 3
After:  [2, 2, 3, 0]

Before: [0, 0, 1, 1]
0 2 3 1
After:  [0, 0, 1, 1]

Before: [0, 1, 2, 2]
12 1 2 1
After:  [0, 0, 2, 2]

Before: [2, 0, 3, 1]
3 0 3 2
After:  [2, 0, 1, 1]

Before: [1, 0, 2, 0]
6 0 2 0
After:  [0, 0, 2, 0]

Before: [0, 2, 1, 1]
5 2 1 0
After:  [2, 2, 1, 1]

Before: [1, 3, 3, 0]
15 2 2 0
After:  [1, 3, 3, 0]

Before: [0, 3, 2, 0]
8 0 0 2
After:  [0, 3, 0, 0]

Before: [2, 2, 2, 1]
0 3 3 1
After:  [2, 0, 2, 1]

Before: [3, 1, 1, 2]
4 1 3 0
After:  [0, 1, 1, 2]

Before: [1, 2, 1, 0]
5 2 1 0
After:  [2, 2, 1, 0]

Before: [2, 2, 3, 3]
15 0 0 0
After:  [1, 2, 3, 3]

Before: [2, 1, 0, 0]
2 0 1 1
After:  [2, 1, 0, 0]

Before: [1, 2, 2, 3]
6 0 2 2
After:  [1, 2, 0, 3]

Before: [1, 0, 0, 1]
1 0 2 1
After:  [1, 0, 0, 1]

Before: [2, 2, 0, 1]
3 0 3 1
After:  [2, 1, 0, 1]

Before: [3, 2, 1, 2]
5 2 1 1
After:  [3, 2, 1, 2]

Before: [2, 1, 3, 2]
14 2 0 1
After:  [2, 1, 3, 2]

Before: [1, 1, 0, 0]
9 1 0 2
After:  [1, 1, 1, 0]

Before: [2, 2, 3, 3]
15 2 2 2
After:  [2, 2, 1, 3]

Before: [0, 2, 1, 0]
8 0 0 2
After:  [0, 2, 0, 0]

Before: [1, 1, 0, 1]
9 1 0 0
After:  [1, 1, 0, 1]

Before: [0, 1, 2, 2]
4 1 3 0
After:  [0, 1, 2, 2]

Before: [1, 1, 0, 0]
9 1 0 0
After:  [1, 1, 0, 0]

Before: [2, 3, 2, 1]
3 0 3 1
After:  [2, 1, 2, 1]

Before: [1, 2, 1, 3]
5 2 1 3
After:  [1, 2, 1, 2]

Before: [2, 1, 1, 3]
11 2 1 2
After:  [2, 1, 2, 3]

Before: [1, 1, 3, 0]
9 1 0 2
After:  [1, 1, 1, 0]

Before: [2, 1, 1, 3]
11 2 1 1
After:  [2, 2, 1, 3]

Before: [2, 1, 3, 2]
2 0 1 2
After:  [2, 1, 1, 2]

Before: [0, 2, 1, 3]
5 2 1 2
After:  [0, 2, 2, 3]

Before: [1, 0, 0, 2]
1 0 2 3
After:  [1, 0, 0, 0]

Before: [1, 1, 1, 2]
9 1 0 3
After:  [1, 1, 1, 1]

Before: [2, 1, 3, 2]
4 1 3 2
After:  [2, 1, 0, 2]

Before: [1, 0, 2, 2]
6 0 2 2
After:  [1, 0, 0, 2]

Before: [3, 1, 1, 3]
11 2 1 1
After:  [3, 2, 1, 3]

Before: [3, 1, 2, 3]
2 0 2 0
After:  [1, 1, 2, 3]

Before: [1, 2, 0, 2]
1 0 2 0
After:  [0, 2, 0, 2]

Before: [3, 1, 2, 1]
10 3 2 2
After:  [3, 1, 1, 1]

Before: [1, 0, 2, 3]
7 2 3 0
After:  [0, 0, 2, 3]

Before: [3, 1, 2, 3]
12 1 2 0
After:  [0, 1, 2, 3]

Before: [2, 1, 1, 3]
7 2 3 1
After:  [2, 0, 1, 3]

Before: [0, 2, 1, 2]
5 2 1 3
After:  [0, 2, 1, 2]

Before: [3, 1, 1, 0]
11 2 1 0
After:  [2, 1, 1, 0]

Before: [1, 1, 3, 1]
9 1 0 0
After:  [1, 1, 3, 1]

Before: [1, 1, 2, 2]
9 1 0 1
After:  [1, 1, 2, 2]

Before: [2, 1, 1, 3]
11 2 1 3
After:  [2, 1, 1, 2]

Before: [1, 1, 1, 2]
4 1 3 1
After:  [1, 0, 1, 2]

Before: [3, 1, 0, 1]
13 1 3 0
After:  [1, 1, 0, 1]

Before: [1, 2, 2, 3]
6 0 2 0
After:  [0, 2, 2, 3]

Before: [1, 3, 0, 3]
1 0 2 0
After:  [0, 3, 0, 3]

Before: [2, 1, 1, 0]
2 0 1 2
After:  [2, 1, 1, 0]

Before: [0, 1, 2, 1]
12 1 2 3
After:  [0, 1, 2, 0]

Before: [2, 3, 1, 1]
3 0 3 3
After:  [2, 3, 1, 1]

Before: [2, 1, 3, 3]
2 0 1 3
After:  [2, 1, 3, 1]

Before: [1, 3, 2, 1]
10 3 2 3
After:  [1, 3, 2, 1]

Before: [1, 1, 3, 3]
9 1 0 3
After:  [1, 1, 3, 1]

Before: [1, 1, 3, 2]
9 1 0 1
After:  [1, 1, 3, 2]

Before: [1, 1, 0, 1]
13 1 3 2
After:  [1, 1, 1, 1]

Before: [3, 0, 2, 0]
2 0 2 1
After:  [3, 1, 2, 0]

Before: [2, 0, 0, 0]
14 0 1 2
After:  [2, 0, 1, 0]

Before: [0, 1, 2, 1]
13 1 3 3
After:  [0, 1, 2, 1]

Before: [2, 1, 3, 0]
14 2 0 1
After:  [2, 1, 3, 0]

Before: [2, 1, 0, 1]
13 1 3 0
After:  [1, 1, 0, 1]

Before: [2, 1, 0, 1]
2 0 1 1
After:  [2, 1, 0, 1]

Before: [0, 3, 2, 1]
10 3 2 0
After:  [1, 3, 2, 1]

Before: [0, 1, 3, 1]
0 3 3 2
After:  [0, 1, 0, 1]

Before: [0, 2, 1, 1]
5 2 1 1
After:  [0, 2, 1, 1]

Before: [2, 1, 1, 2]
15 0 0 3
After:  [2, 1, 1, 1]

Before: [1, 1, 2, 0]
6 0 2 2
After:  [1, 1, 0, 0]

Before: [1, 1, 2, 1]
6 0 2 0
After:  [0, 1, 2, 1]

Before: [0, 2, 1, 3]
7 1 3 1
After:  [0, 0, 1, 3]

Before: [1, 0, 0, 0]
1 0 2 3
After:  [1, 0, 0, 0]

Before: [2, 1, 2, 3]
2 0 1 2
After:  [2, 1, 1, 3]

Before: [0, 2, 0, 2]
0 3 3 1
After:  [0, 0, 0, 2]

Before: [0, 2, 3, 0]
15 2 2 2
After:  [0, 2, 1, 0]

Before: [1, 2, 2, 2]
14 2 1 3
After:  [1, 2, 2, 1]

Before: [0, 1, 3, 1]
8 0 0 2
After:  [0, 1, 0, 1]

Before: [3, 3, 3, 2]
15 0 0 3
After:  [3, 3, 3, 1]

Before: [3, 3, 0, 2]
14 0 2 1
After:  [3, 1, 0, 2]

Before: [0, 1, 1, 3]
11 2 1 0
After:  [2, 1, 1, 3]

Before: [1, 1, 0, 1]
9 1 0 2
After:  [1, 1, 1, 1]

Before: [0, 1, 2, 1]
10 3 2 3
After:  [0, 1, 2, 1]

Before: [2, 2, 2, 1]
10 3 2 1
After:  [2, 1, 2, 1]

Before: [0, 1, 2, 2]
4 1 3 3
After:  [0, 1, 2, 0]

Before: [1, 2, 2, 1]
10 3 2 2
After:  [1, 2, 1, 1]

Before: [2, 1, 1, 2]
11 2 1 1
After:  [2, 2, 1, 2]

Before: [1, 1, 2, 1]
12 1 2 3
After:  [1, 1, 2, 0]

Before: [3, 3, 1, 1]
0 2 3 1
After:  [3, 0, 1, 1]

Before: [0, 1, 2, 2]
4 1 3 1
After:  [0, 0, 2, 2]

Before: [0, 3, 2, 2]
8 0 0 3
After:  [0, 3, 2, 0]

Before: [2, 1, 2, 1]
2 0 1 0
After:  [1, 1, 2, 1]

Before: [1, 1, 0, 3]
1 0 2 1
After:  [1, 0, 0, 3]

Before: [3, 3, 3, 2]
15 0 0 0
After:  [1, 3, 3, 2]

Before: [0, 1, 1, 2]
4 1 3 2
After:  [0, 1, 0, 2]

Before: [1, 3, 0, 3]
1 0 2 1
After:  [1, 0, 0, 3]

Before: [1, 1, 0, 1]
1 0 2 2
After:  [1, 1, 0, 1]

Before: [2, 1, 0, 2]
4 1 3 0
After:  [0, 1, 0, 2]

Before: [3, 2, 2, 2]
2 0 2 2
After:  [3, 2, 1, 2]

Before: [0, 2, 2, 1]
10 3 2 1
After:  [0, 1, 2, 1]

Before: [0, 1, 0, 2]
4 1 3 2
After:  [0, 1, 0, 2]

Before: [0, 1, 0, 2]
4 1 3 3
After:  [0, 1, 0, 0]

Before: [1, 1, 2, 1]
10 3 2 1
After:  [1, 1, 2, 1]

Before: [1, 1, 0, 1]
13 1 3 0
After:  [1, 1, 0, 1]

Before: [1, 3, 2, 2]
6 0 2 1
After:  [1, 0, 2, 2]

Before: [0, 1, 2, 1]
13 1 3 0
After:  [1, 1, 2, 1]

Before: [0, 1, 1, 3]
11 2 1 1
After:  [0, 2, 1, 3]

Before: [3, 2, 1, 0]
5 2 1 3
After:  [3, 2, 1, 2]

Before: [2, 1, 2, 3]
7 2 3 3
After:  [2, 1, 2, 0]

Before: [1, 1, 1, 1]
11 2 1 2
After:  [1, 1, 2, 1]

Before: [2, 1, 1, 1]
3 0 3 2
After:  [2, 1, 1, 1]

Before: [0, 1, 1, 3]
8 0 0 1
After:  [0, 0, 1, 3]

Before: [3, 2, 3, 3]
7 1 3 3
After:  [3, 2, 3, 0]

Before: [0, 3, 0, 0]
8 0 0 2
After:  [0, 3, 0, 0]

Before: [1, 1, 2, 1]
6 0 2 1
After:  [1, 0, 2, 1]

Before: [0, 1, 1, 2]
4 1 3 0
After:  [0, 1, 1, 2]

Before: [1, 1, 2, 1]
9 1 0 1
After:  [1, 1, 2, 1]

Before: [3, 1, 2, 0]
12 1 2 0
After:  [0, 1, 2, 0]

Before: [1, 3, 0, 3]
1 0 2 2
After:  [1, 3, 0, 3]

Before: [1, 1, 0, 3]
9 1 0 1
After:  [1, 1, 0, 3]

Before: [0, 2, 2, 2]
8 0 0 1
After:  [0, 0, 2, 2]

Before: [0, 1, 1, 1]
13 1 3 1
After:  [0, 1, 1, 1]

Before: [1, 1, 3, 1]
13 1 3 0
After:  [1, 1, 3, 1]

Before: [0, 1, 2, 1]
8 0 0 0
After:  [0, 1, 2, 1]

Before: [2, 1, 2, 1]
12 1 2 2
After:  [2, 1, 0, 1]

Before: [1, 0, 2, 3]
6 0 2 1
After:  [1, 0, 2, 3]

Before: [3, 0, 3, 1]
15 2 0 2
After:  [3, 0, 1, 1]

Before: [0, 1, 1, 1]
0 2 3 0
After:  [0, 1, 1, 1]

Before: [3, 0, 0, 3]
14 0 2 1
After:  [3, 1, 0, 3]

Before: [3, 1, 1, 1]
0 2 3 1
After:  [3, 0, 1, 1]

Before: [0, 1, 2, 3]
7 2 3 3
After:  [0, 1, 2, 0]

Before: [3, 1, 0, 1]
13 1 3 1
After:  [3, 1, 0, 1]

Before: [0, 0, 3, 0]
8 0 0 1
After:  [0, 0, 3, 0]

Before: [1, 1, 0, 2]
1 0 2 3
After:  [1, 1, 0, 0]

Before: [2, 1, 1, 2]
4 1 3 1
After:  [2, 0, 1, 2]

Before: [3, 2, 3, 0]
15 2 2 3
After:  [3, 2, 3, 1]

Before: [0, 2, 0, 3]
7 1 3 0
After:  [0, 2, 0, 3]

Before: [1, 1, 3, 2]
9 1 0 2
After:  [1, 1, 1, 2]

Before: [0, 3, 1, 3]
8 0 0 1
After:  [0, 0, 1, 3]

Before: [3, 1, 2, 1]
2 0 2 0
After:  [1, 1, 2, 1]

Before: [1, 1, 3, 1]
9 1 0 2
After:  [1, 1, 1, 1]

Before: [2, 1, 3, 0]
2 0 1 3
After:  [2, 1, 3, 1]

Before: [2, 1, 1, 0]
11 2 1 1
After:  [2, 2, 1, 0]

Before: [3, 1, 1, 1]
13 1 3 0
After:  [1, 1, 1, 1]

Before: [2, 2, 1, 3]
5 2 1 1
After:  [2, 2, 1, 3]

Before: [0, 0, 2, 1]
10 3 2 3
After:  [0, 0, 2, 1]

Before: [3, 3, 0, 2]
0 3 3 1
After:  [3, 0, 0, 2]

Before: [0, 2, 1, 0]
8 0 0 0
After:  [0, 2, 1, 0]

Before: [3, 3, 0, 2]
15 0 0 3
After:  [3, 3, 0, 1]

Before: [1, 0, 2, 3]
6 0 2 0
After:  [0, 0, 2, 3]

Before: [0, 0, 1, 1]
8 0 0 1
After:  [0, 0, 1, 1]

Before: [1, 0, 2, 1]
10 3 2 0
After:  [1, 0, 2, 1]

Before: [1, 2, 1, 2]
5 2 1 1
After:  [1, 2, 1, 2]

Before: [2, 1, 3, 1]
14 2 0 1
After:  [2, 1, 3, 1]

Before: [2, 1, 2, 0]
2 0 1 0
After:  [1, 1, 2, 0]

Before: [1, 1, 2, 2]
6 0 2 3
After:  [1, 1, 2, 0]

Before: [2, 1, 1, 3]
2 0 1 2
After:  [2, 1, 1, 3]

Before: [2, 3, 3, 2]
14 2 0 2
After:  [2, 3, 1, 2]

Before: [1, 0, 0, 2]
1 0 2 0
After:  [0, 0, 0, 2]

Before: [3, 3, 2, 2]
15 0 0 0
After:  [1, 3, 2, 2]

Before: [0, 1, 1, 2]
4 1 3 3
After:  [0, 1, 1, 0]

Before: [2, 2, 1, 2]
5 2 1 3
After:  [2, 2, 1, 2]

Before: [2, 1, 2, 0]
12 1 2 0
After:  [0, 1, 2, 0]

Before: [3, 1, 0, 1]
13 1 3 2
After:  [3, 1, 1, 1]

Before: [1, 2, 1, 1]
5 2 1 1
After:  [1, 2, 1, 1]

Before: [2, 1, 2, 2]
4 1 3 2
After:  [2, 1, 0, 2]

Before: [0, 1, 0, 2]
4 1 3 0
After:  [0, 1, 0, 2]

Before: [3, 1, 0, 2]
4 1 3 2
After:  [3, 1, 0, 2]

Before: [1, 1, 3, 2]
4 1 3 1
After:  [1, 0, 3, 2]

Before: [3, 1, 1, 1]
13 1 3 2
After:  [3, 1, 1, 1]

Before: [0, 0, 2, 0]
8 0 0 3
After:  [0, 0, 2, 0]

Before: [1, 1, 3, 2]
9 1 0 0
After:  [1, 1, 3, 2]

Before: [3, 2, 1, 0]
5 2 1 1
After:  [3, 2, 1, 0]

Before: [1, 1, 0, 2]
1 0 2 0
After:  [0, 1, 0, 2]

Before: [2, 1, 0, 1]
13 1 3 3
After:  [2, 1, 0, 1]

Before: [3, 1, 2, 0]
12 1 2 2
After:  [3, 1, 0, 0]

Before: [3, 2, 2, 3]
2 0 2 0
After:  [1, 2, 2, 3]

Before: [1, 1, 1, 0]
11 2 1 1
After:  [1, 2, 1, 0]

Before: [0, 0, 1, 2]
8 0 0 3
After:  [0, 0, 1, 0]

Before: [1, 1, 0, 0]
9 1 0 3
After:  [1, 1, 0, 1]

Before: [1, 1, 3, 0]
9 1 0 3
After:  [1, 1, 3, 1]

Before: [1, 1, 1, 1]
11 2 1 1
After:  [1, 2, 1, 1]

Before: [3, 0, 0, 0]
14 0 2 3
After:  [3, 0, 0, 1]

Before: [2, 1, 1, 3]
7 1 3 3
After:  [2, 1, 1, 0]

Before: [0, 3, 3, 2]
8 0 0 2
After:  [0, 3, 0, 2]

Before: [3, 1, 2, 1]
12 1 2 1
After:  [3, 0, 2, 1]

Before: [3, 0, 2, 3]
7 2 3 0
After:  [0, 0, 2, 3]

Before: [3, 1, 1, 1]
14 3 1 1
After:  [3, 0, 1, 1]

Before: [1, 1, 1, 3]
9 1 0 0
After:  [1, 1, 1, 3]

Before: [0, 0, 3, 3]
8 0 0 2
After:  [0, 0, 0, 3]

Before: [3, 1, 3, 3]
7 1 3 1
After:  [3, 0, 3, 3]

Before: [1, 1, 2, 2]
12 1 2 1
After:  [1, 0, 2, 2]

Before: [1, 1, 0, 1]
1 0 2 3
After:  [1, 1, 0, 0]

Before: [2, 2, 2, 1]
3 0 3 2
After:  [2, 2, 1, 1]

Before: [2, 0, 3, 0]
14 0 1 1
After:  [2, 1, 3, 0]

Before: [1, 1, 2, 2]
4 1 3 3
After:  [1, 1, 2, 0]

Before: [1, 1, 2, 3]
12 1 2 2
After:  [1, 1, 0, 3]

Before: [1, 2, 1, 3]
7 2 3 2
After:  [1, 2, 0, 3]

Before: [3, 0, 0, 1]
14 0 2 2
After:  [3, 0, 1, 1]

Before: [3, 2, 1, 0]
5 2 1 0
After:  [2, 2, 1, 0]

Before: [2, 3, 2, 1]
3 0 3 0
After:  [1, 3, 2, 1]

Before: [0, 1, 3, 2]
8 0 0 3
After:  [0, 1, 3, 0]

Before: [2, 2, 1, 1]
3 0 3 3
After:  [2, 2, 1, 1]

Before: [3, 2, 3, 1]
0 3 3 3
After:  [3, 2, 3, 0]

Before: [2, 1, 1, 0]
14 2 1 3
After:  [2, 1, 1, 0]

Before: [2, 2, 1, 3]
7 2 3 1
After:  [2, 0, 1, 3]

Before: [2, 3, 3, 1]
3 0 3 2
After:  [2, 3, 1, 1]

Before: [1, 1, 2, 1]
9 1 0 2
After:  [1, 1, 1, 1]

Before: [0, 3, 2, 1]
10 3 2 1
After:  [0, 1, 2, 1]

Before: [0, 1, 0, 1]
13 1 3 3
After:  [0, 1, 0, 1]

Before: [1, 1, 1, 3]
11 2 1 3
After:  [1, 1, 1, 2]

Before: [3, 1, 1, 2]
11 2 1 2
After:  [3, 1, 2, 2]

Before: [1, 3, 2, 3]
6 0 2 3
After:  [1, 3, 2, 0]

Before: [0, 1, 2, 3]
8 0 0 2
After:  [0, 1, 0, 3]

Before: [3, 0, 1, 3]
14 3 0 2
After:  [3, 0, 1, 3]

Before: [2, 1, 2, 0]
12 1 2 3
After:  [2, 1, 2, 0]

Before: [0, 1, 1, 1]
11 2 1 0
After:  [2, 1, 1, 1]

Before: [2, 3, 2, 1]
0 3 3 2
After:  [2, 3, 0, 1]

Before: [1, 1, 0, 2]
0 3 3 3
After:  [1, 1, 0, 0]

Before: [1, 0, 0, 1]
1 0 2 3
After:  [1, 0, 0, 0]

Before: [3, 2, 1, 3]
7 2 3 3
After:  [3, 2, 1, 0]

Before: [3, 1, 1, 3]
11 2 1 2
After:  [3, 1, 2, 3]

Before: [0, 1, 2, 2]
12 1 2 3
After:  [0, 1, 2, 0]

Before: [3, 3, 2, 1]
10 3 2 0
After:  [1, 3, 2, 1]

Before: [1, 1, 3, 1]
13 1 3 1
After:  [1, 1, 3, 1]

Before: [2, 2, 1, 1]
3 0 3 1
After:  [2, 1, 1, 1]

Before: [2, 1, 2, 2]
4 1 3 0
After:  [0, 1, 2, 2]

Before: [1, 1, 1, 1]
9 1 0 2
After:  [1, 1, 1, 1]

Before: [1, 3, 2, 1]
10 3 2 0
After:  [1, 3, 2, 1]

Before: [2, 0, 2, 1]
10 3 2 0
After:  [1, 0, 2, 1]

Before: [1, 1, 0, 3]
1 0 2 2
After:  [1, 1, 0, 3]

Before: [1, 2, 0, 1]
1 0 2 3
After:  [1, 2, 0, 0]

Before: [1, 3, 0, 0]
1 0 2 0
After:  [0, 3, 0, 0]

Before: [2, 1, 1, 3]
14 2 1 0
After:  [0, 1, 1, 3]

Before: [1, 1, 1, 2]
9 1 0 1
After:  [1, 1, 1, 2]

Before: [1, 1, 0, 1]
13 1 3 1
After:  [1, 1, 0, 1]

Before: [2, 0, 0, 2]
15 0 0 0
After:  [1, 0, 0, 2]

Before: [2, 3, 1, 1]
3 0 3 0
After:  [1, 3, 1, 1]

Before: [0, 1, 2, 0]
12 1 2 3
After:  [0, 1, 2, 0]

Before: [1, 2, 1, 2]
5 2 1 0
After:  [2, 2, 1, 2]

Before: [2, 0, 2, 2]
14 3 2 2
After:  [2, 0, 0, 2]

Before: [0, 2, 2, 1]
10 3 2 0
After:  [1, 2, 2, 1]

Before: [2, 1, 0, 2]
4 1 3 3
After:  [2, 1, 0, 0]

Before: [1, 3, 0, 2]
1 0 2 2
After:  [1, 3, 0, 2]

Before: [0, 0, 2, 3]
8 0 0 1
After:  [0, 0, 2, 3]

Before: [2, 1, 1, 3]
7 1 3 0
After:  [0, 1, 1, 3]

Before: [3, 1, 2, 1]
13 1 3 0
After:  [1, 1, 2, 1]

Before: [2, 0, 1, 1]
3 0 3 1
After:  [2, 1, 1, 1]

Before: [1, 1, 2, 1]
13 1 3 1
After:  [1, 1, 2, 1]

Before: [0, 1, 2, 1]
12 1 2 1
After:  [0, 0, 2, 1]

Before: [2, 2, 3, 3]
14 3 2 2
After:  [2, 2, 1, 3]

Before: [3, 1, 1, 1]
13 1 3 3
After:  [3, 1, 1, 1]

Before: [3, 3, 3, 2]
15 2 0 1
After:  [3, 1, 3, 2]

Before: [2, 1, 2, 1]
3 0 3 1
After:  [2, 1, 2, 1]

Before: [3, 1, 2, 0]
2 0 2 3
After:  [3, 1, 2, 1]

Before: [1, 2, 1, 2]
5 2 1 3
After:  [1, 2, 1, 2]

Before: [3, 2, 1, 1]
5 2 1 0
After:  [2, 2, 1, 1]

Before: [0, 1, 2, 1]
12 1 2 0
After:  [0, 1, 2, 1]

Before: [2, 1, 1, 1]
3 0 3 0
After:  [1, 1, 1, 1]

Before: [3, 1, 1, 2]
11 2 1 1
After:  [3, 2, 1, 2]

Before: [1, 1, 1, 3]
11 2 1 0
After:  [2, 1, 1, 3]

Before: [1, 1, 2, 0]
9 1 0 3
After:  [1, 1, 2, 1]

Before: [0, 2, 2, 3]
8 0 0 3
After:  [0, 2, 2, 0]

Before: [0, 0, 2, 1]
10 3 2 1
After:  [0, 1, 2, 1]

Before: [0, 2, 3, 3]
14 3 2 0
After:  [1, 2, 3, 3]

Before: [2, 1, 0, 3]
2 0 1 2
After:  [2, 1, 1, 3]

Before: [3, 1, 2, 0]
2 0 2 0
After:  [1, 1, 2, 0]

Before: [3, 1, 0, 2]
14 0 2 0
After:  [1, 1, 0, 2]

Before: [2, 1, 3, 0]
2 0 1 1
After:  [2, 1, 3, 0]

Before: [1, 1, 1, 0]
9 1 0 3
After:  [1, 1, 1, 1]

Before: [1, 0, 0, 0]
1 0 2 1
After:  [1, 0, 0, 0]

Before: [0, 3, 2, 2]
8 0 0 2
After:  [0, 3, 0, 2]

Before: [3, 3, 2, 2]
2 0 2 0
After:  [1, 3, 2, 2]

Before: [0, 2, 1, 2]
5 2 1 1
After:  [0, 2, 1, 2]

Before: [3, 3, 2, 2]
2 0 2 3
After:  [3, 3, 2, 1]

Before: [0, 2, 1, 2]
5 2 1 0
After:  [2, 2, 1, 2]

Before: [1, 0, 2, 1]
10 3 2 2
After:  [1, 0, 1, 1]

Before: [0, 1, 0, 1]
13 1 3 2
After:  [0, 1, 1, 1]

Before: [3, 1, 1, 1]
14 2 1 1
After:  [3, 0, 1, 1]

Before: [0, 1, 0, 1]
13 1 3 1
After:  [0, 1, 0, 1]

Before: [2, 2, 0, 1]
3 0 3 2
After:  [2, 2, 1, 1]

Before: [3, 2, 1, 3]
14 3 0 0
After:  [1, 2, 1, 3]

Before: [1, 1, 2, 2]
4 1 3 0
After:  [0, 1, 2, 2]

Before: [3, 1, 2, 3]
7 1 3 1
After:  [3, 0, 2, 3]

Before: [3, 0, 3, 0]
15 2 2 1
After:  [3, 1, 3, 0]

Before: [0, 2, 2, 2]
14 2 1 3
After:  [0, 2, 2, 1]

Before: [1, 1, 2, 3]
12 1 2 1
After:  [1, 0, 2, 3]

Before: [3, 1, 1, 1]
13 1 3 1
After:  [3, 1, 1, 1]

Before: [2, 1, 1, 1]
13 1 3 3
After:  [2, 1, 1, 1]

Before: [2, 2, 2, 3]
7 2 3 3
After:  [2, 2, 2, 0]

Before: [2, 3, 3, 3]
15 0 0 2
After:  [2, 3, 1, 3]

Before: [3, 1, 2, 1]
13 1 3 3
After:  [3, 1, 2, 1]

Before: [3, 3, 3, 2]
15 0 2 0
After:  [1, 3, 3, 2]

Before: [3, 1, 0, 2]
0 3 3 0
After:  [0, 1, 0, 2]

Before: [2, 0, 3, 2]
14 0 1 1
After:  [2, 1, 3, 2]

Before: [1, 0, 2, 1]
10 3 2 3
After:  [1, 0, 2, 1]

Before: [1, 3, 3, 1]
0 3 3 2
After:  [1, 3, 0, 1]

Before: [0, 2, 2, 1]
10 3 2 2
After:  [0, 2, 1, 1]

Before: [2, 2, 1, 0]
5 2 1 0
After:  [2, 2, 1, 0]

Before: [2, 3, 0, 1]
3 0 3 2
After:  [2, 3, 1, 1]

Before: [1, 2, 2, 2]
6 0 2 1
After:  [1, 0, 2, 2]

Before: [0, 1, 2, 2]
12 1 2 0
After:  [0, 1, 2, 2]

Before: [1, 1, 0, 2]
9 1 0 2
After:  [1, 1, 1, 2]

Before: [0, 1, 2, 2]
12 1 2 2
After:  [0, 1, 0, 2]

Before: [2, 1, 2, 0]
12 1 2 2
After:  [2, 1, 0, 0]

Before: [2, 3, 3, 0]
15 0 0 3
After:  [2, 3, 3, 1]

Before: [2, 2, 0, 1]
15 0 0 0
After:  [1, 2, 0, 1]

Before: [2, 0, 3, 2]
0 3 3 2
After:  [2, 0, 0, 2]

Before: [3, 0, 3, 2]
15 2 2 3
After:  [3, 0, 3, 1]

Before: [2, 3, 2, 1]
10 3 2 3
After:  [2, 3, 2, 1]

Before: [2, 1, 2, 1]
3 0 3 3
After:  [2, 1, 2, 1]

Before: [1, 3, 0, 0]
1 0 2 3
After:  [1, 3, 0, 0]

Before: [3, 1, 2, 3]
2 0 2 3
After:  [3, 1, 2, 1]

Before: [2, 1, 1, 2]
11 2 1 2
After:  [2, 1, 2, 2]

Before: [1, 3, 2, 3]
7 2 3 1
After:  [1, 0, 2, 3]

Before: [0, 0, 0, 0]
8 0 0 3
After:  [0, 0, 0, 0]

Before: [1, 0, 3, 1]
14 2 3 2
After:  [1, 0, 0, 1]

Before: [3, 2, 0, 3]
14 0 2 3
After:  [3, 2, 0, 1]

Before: [3, 2, 2, 1]
2 0 2 1
After:  [3, 1, 2, 1]

Before: [2, 1, 2, 1]
3 0 3 0
After:  [1, 1, 2, 1]

Before: [2, 2, 0, 1]
3 0 3 3
After:  [2, 2, 0, 1]

Before: [0, 3, 3, 2]
8 0 0 0
After:  [0, 3, 3, 2]

Before: [3, 2, 0, 1]
14 0 2 1
After:  [3, 1, 0, 1]

Before: [1, 1, 1, 3]
9 1 0 1
After:  [1, 1, 1, 3]

Before: [0, 1, 0, 1]
13 1 3 0
After:  [1, 1, 0, 1]

Before: [1, 1, 1, 0]
9 1 0 1
After:  [1, 1, 1, 0]

Before: [1, 3, 2, 2]
6 0 2 0
After:  [0, 3, 2, 2]

Before: [2, 1, 1, 1]
14 3 1 0
After:  [0, 1, 1, 1]

Before: [1, 1, 3, 0]
9 1 0 0
After:  [1, 1, 3, 0]

Before: [2, 1, 3, 1]
3 0 3 2
After:  [2, 1, 1, 1]

Before: [2, 1, 1, 1]
3 0 3 1
After:  [2, 1, 1, 1]

Before: [3, 2, 1, 3]
7 1 3 3
After:  [3, 2, 1, 0]

Before: [2, 0, 3, 3]
15 0 0 2
After:  [2, 0, 1, 3]

Before: [3, 0, 2, 1]
10 3 2 2
After:  [3, 0, 1, 1]

Before: [1, 1, 2, 3]
9 1 0 0
After:  [1, 1, 2, 3]

Before: [1, 2, 1, 1]
5 2 1 0
After:  [2, 2, 1, 1]

Before: [0, 1, 2, 3]
12 1 2 1
After:  [0, 0, 2, 3]

Before: [1, 3, 0, 1]
1 0 2 3
After:  [1, 3, 0, 0]

Before: [2, 1, 0, 1]
2 0 1 0
After:  [1, 1, 0, 1]

Before: [3, 2, 2, 3]
2 0 2 1
After:  [3, 1, 2, 3]

Before: [1, 2, 0, 1]
1 0 2 1
After:  [1, 0, 0, 1]

Before: [1, 2, 2, 0]
6 0 2 0
After:  [0, 2, 2, 0]

Before: [2, 1, 1, 2]
11 2 1 0
After:  [2, 1, 1, 2]

Before: [3, 1, 1, 3]
7 1 3 2
After:  [3, 1, 0, 3]

Before: [2, 2, 1, 3]
5 2 1 2
After:  [2, 2, 2, 3]

Before: [3, 1, 1, 1]
11 2 1 1
After:  [3, 2, 1, 1]

Before: [2, 1, 2, 2]
4 1 3 1
After:  [2, 0, 2, 2]

Before: [1, 1, 2, 1]
12 1 2 0
After:  [0, 1, 2, 1]

Before: [1, 1, 0, 2]
9 1 0 3
After:  [1, 1, 0, 1]

Before: [3, 3, 2, 3]
2 0 2 0
After:  [1, 3, 2, 3]

Before: [1, 1, 2, 3]
9 1 0 3
After:  [1, 1, 2, 1]

Before: [2, 1, 2, 1]
12 1 2 0
After:  [0, 1, 2, 1]

Before: [1, 1, 0, 2]
4 1 3 1
After:  [1, 0, 0, 2]

Before: [1, 2, 2, 0]
6 0 2 3
After:  [1, 2, 2, 0]

Before: [2, 1, 1, 0]
11 2 1 3
After:  [2, 1, 1, 2]

Before: [1, 1, 0, 1]
13 1 3 3
After:  [1, 1, 0, 1]

Before: [3, 1, 2, 3]
7 1 3 3
After:  [3, 1, 2, 0]

Before: [0, 2, 1, 3]
8 0 0 0
After:  [0, 2, 1, 3]

Before: [3, 2, 1, 3]
7 1 3 0
After:  [0, 2, 1, 3]

Before: [1, 2, 2, 2]
6 0 2 3
After:  [1, 2, 2, 0]

Before: [1, 1, 1, 1]
13 1 3 3
After:  [1, 1, 1, 1]

Before: [2, 1, 3, 2]
15 2 2 1
After:  [2, 1, 3, 2]

Before: [2, 1, 0, 3]
2 0 1 0
After:  [1, 1, 0, 3]

Before: [1, 1, 2, 1]
12 1 2 2
After:  [1, 1, 0, 1]

Before: [1, 1, 3, 2]
4 1 3 0
After:  [0, 1, 3, 2]

Before: [2, 3, 2, 3]
7 2 3 2
After:  [2, 3, 0, 3]

Before: [2, 2, 1, 1]
5 2 1 3
After:  [2, 2, 1, 2]

Before: [0, 0, 2, 1]
10 3 2 0
After:  [1, 0, 2, 1]

Before: [3, 1, 0, 3]
7 1 3 2
After:  [3, 1, 0, 3]

Before: [2, 1, 3, 2]
2 0 1 1
After:  [2, 1, 3, 2]

Before: [2, 3, 1, 1]
3 0 3 1
After:  [2, 1, 1, 1]

Before: [2, 2, 1, 3]
7 1 3 3
After:  [2, 2, 1, 0]

Before: [3, 3, 3, 1]
15 0 2 1
After:  [3, 1, 3, 1]

Before: [0, 1, 1, 0]
11 2 1 1
After:  [0, 2, 1, 0]

Before: [1, 1, 1, 0]
11 2 1 0
After:  [2, 1, 1, 0]

Before: [3, 1, 3, 1]
13 1 3 3
After:  [3, 1, 3, 1]

Before: [0, 1, 3, 2]
8 0 0 1
After:  [0, 0, 3, 2]

Before: [2, 2, 0, 3]
7 1 3 3
After:  [2, 2, 0, 0]

Before: [1, 0, 2, 1]
6 0 2 2
After:  [1, 0, 0, 1]

Before: [1, 3, 0, 2]
0 3 3 3
After:  [1, 3, 0, 0]

Before: [1, 1, 0, 1]
9 1 0 3
After:  [1, 1, 0, 1]

Before: [1, 2, 2, 3]
7 1 3 1
After:  [1, 0, 2, 3]

Before: [1, 1, 2, 2]
12 1 2 3
After:  [1, 1, 2, 0]

Before: [1, 1, 2, 0]
12 1 2 3
After:  [1, 1, 2, 0]

Before: [0, 1, 0, 2]
4 1 3 1
After:  [0, 0, 0, 2]

Before: [1, 1, 1, 0]
9 1 0 0
After:  [1, 1, 1, 0]

Before: [1, 1, 2, 0]
9 1 0 0
After:  [1, 1, 2, 0]

Before: [1, 2, 1, 1]
5 2 1 3
After:  [1, 2, 1, 2]

Before: [3, 0, 3, 2]
15 2 2 0
After:  [1, 0, 3, 2]

Before: [2, 2, 1, 3]
7 2 3 3
After:  [2, 2, 1, 0]

Before: [3, 1, 2, 2]
4 1 3 3
After:  [3, 1, 2, 0]

Before: [3, 1, 2, 1]
15 0 0 1
After:  [3, 1, 2, 1]

Before: [2, 3, 2, 1]
10 3 2 0
After:  [1, 3, 2, 1]

Before: [2, 1, 2, 2]
0 3 3 1
After:  [2, 0, 2, 2]

Before: [1, 2, 0, 2]
1 0 2 1
After:  [1, 0, 0, 2]

Before: [3, 3, 2, 0]
2 0 2 0
After:  [1, 3, 2, 0]

Before: [0, 1, 1, 2]
11 2 1 1
After:  [0, 2, 1, 2]

Before: [3, 1, 2, 1]
13 1 3 1
After:  [3, 1, 2, 1]

Before: [3, 1, 3, 3]
15 2 0 3
After:  [3, 1, 3, 1]

Before: [0, 1, 0, 1]
8 0 0 3
After:  [0, 1, 0, 0]

Before: [2, 3, 2, 1]
0 3 3 3
After:  [2, 3, 2, 0]

Before: [2, 1, 1, 2]
4 1 3 2
After:  [2, 1, 0, 2]

Before: [0, 1, 3, 1]
13 1 3 0
After:  [1, 1, 3, 1]

Before: [2, 2, 1, 1]
5 2 1 0
After:  [2, 2, 1, 1]

Before: [3, 1, 2, 0]
15 0 0 0
After:  [1, 1, 2, 0]

Before: [1, 1, 1, 1]
9 1 0 0
After:  [1, 1, 1, 1]

Before: [1, 1, 2, 2]
12 1 2 2
After:  [1, 1, 0, 2]

Before: [1, 1, 2, 1]
10 3 2 0
After:  [1, 1, 2, 1]

Before: [2, 0, 1, 1]
3 0 3 3
After:  [2, 0, 1, 1]



8 0 0 2
5 2 2 2
6 3 1 1
8 0 0 3
5 3 0 3
9 2 3 1
8 1 3 1
8 1 2 1
11 0 1 0
10 0 0 1
8 0 0 2
5 2 3 2
6 3 0 3
8 2 0 0
5 0 1 0
12 3 2 0
8 0 3 0
11 1 0 1
10 1 1 3
6 1 2 0
8 1 0 1
5 1 0 1
6 0 0 2
5 0 1 1
8 1 3 1
11 3 1 3
10 3 3 2
6 3 0 3
6 2 1 1
4 3 1 0
8 0 3 0
11 0 2 2
10 2 0 1
8 1 0 0
5 0 1 0
8 3 0 2
5 2 0 2
6 2 1 3
8 0 2 3
8 3 3 3
8 3 3 3
11 3 1 1
10 1 1 3
6 3 3 2
6 0 0 1
8 0 2 0
8 0 1 0
8 0 1 0
11 3 0 3
10 3 0 0
6 2 2 1
6 1 0 3
13 1 2 1
8 1 2 1
11 1 0 0
10 0 3 2
6 2 0 0
6 3 1 1
6 2 0 3
9 0 3 1
8 1 1 1
8 1 3 1
11 1 2 2
10 2 0 0
6 3 1 1
6 2 1 2
6 0 2 3
7 3 2 1
8 1 2 1
8 1 2 1
11 1 0 0
10 0 3 3
6 3 1 2
6 1 2 0
6 0 1 1
6 2 1 1
8 1 1 1
11 3 1 3
10 3 3 1
6 2 0 3
8 0 0 2
5 2 0 2
6 2 2 0
15 0 3 0
8 0 1 0
8 0 2 0
11 0 1 1
10 1 0 0
6 3 1 1
6 0 0 3
6 2 1 2
7 3 2 2
8 2 2 2
11 2 0 0
10 0 1 1
6 1 0 3
8 0 0 0
5 0 2 0
8 0 0 2
5 2 0 2
3 0 3 2
8 2 3 2
8 2 2 2
11 1 2 1
10 1 1 3
8 2 0 2
5 2 3 2
6 3 2 0
6 1 3 1
8 1 2 2
8 2 1 2
11 2 3 3
6 1 1 0
8 1 0 2
5 2 0 2
6 2 0 0
8 0 3 0
11 3 0 3
10 3 3 2
6 2 1 0
6 2 2 3
6 0 1 1
9 0 3 0
8 0 1 0
8 0 1 0
11 0 2 2
10 2 3 3
6 3 1 1
8 3 0 2
5 2 1 2
6 1 3 0
5 0 1 0
8 0 2 0
11 0 3 3
10 3 0 0
6 1 3 3
8 0 0 2
5 2 0 2
6 0 1 1
5 3 1 2
8 2 2 2
11 0 2 0
10 0 2 3
6 2 1 1
6 2 0 2
6 3 3 0
13 1 0 1
8 1 2 1
11 1 3 3
10 3 2 2
6 1 1 3
6 0 2 1
6 0 2 0
5 3 1 3
8 3 2 3
11 2 3 2
10 2 3 3
6 1 3 0
6 0 0 2
6 3 1 1
8 0 2 1
8 1 3 1
11 3 1 3
10 3 0 1
6 2 2 0
6 2 1 3
6 3 3 2
9 0 3 2
8 2 2 2
8 2 3 2
11 2 1 1
10 1 3 3
6 0 3 2
8 2 0 1
5 1 3 1
2 0 1 1
8 1 1 1
11 1 3 3
10 3 3 2
6 3 0 1
6 1 1 3
3 0 3 1
8 1 3 1
11 2 1 2
10 2 1 0
6 2 1 1
6 1 3 2
6 2 0 3
9 1 3 3
8 3 3 3
11 3 0 0
10 0 3 2
6 2 3 0
6 1 0 3
3 0 3 3
8 3 2 3
11 2 3 2
10 2 2 1
6 1 2 3
6 2 3 2
3 0 3 2
8 2 1 2
8 2 2 2
11 2 1 1
10 1 0 2
6 3 2 1
6 3 3 0
11 3 3 1
8 1 2 1
8 1 2 1
11 2 1 2
6 2 1 1
13 1 0 0
8 0 3 0
8 0 1 0
11 0 2 2
10 2 1 3
8 1 0 0
5 0 1 0
6 0 0 2
8 0 2 0
8 0 3 0
8 0 2 0
11 3 0 3
10 3 3 1
6 3 3 2
6 2 1 0
6 2 2 3
15 0 3 3
8 3 2 3
11 3 1 1
10 1 3 2
6 3 1 1
8 2 0 3
5 3 0 3
4 1 0 1
8 1 2 1
11 2 1 2
10 2 0 1
6 3 1 2
6 1 1 3
6 1 0 0
8 3 2 3
8 3 2 3
11 1 3 1
10 1 2 3
6 2 1 1
6 2 1 2
10 0 2 2
8 2 1 2
11 3 2 3
6 0 0 1
6 2 1 2
10 0 2 0
8 0 3 0
11 3 0 3
10 3 1 2
8 2 0 3
5 3 0 3
6 1 1 0
11 0 0 3
8 3 2 3
11 3 2 2
10 2 3 3
6 2 1 1
6 3 2 2
6 2 2 0
0 0 2 0
8 0 1 0
11 0 3 3
10 3 3 2
6 2 1 3
6 2 0 0
6 3 0 1
15 0 3 3
8 3 1 3
8 3 3 3
11 3 2 2
10 2 3 1
8 1 0 0
5 0 1 0
6 3 3 2
8 0 0 3
5 3 1 3
8 0 2 3
8 3 1 3
11 3 1 1
10 1 1 3
6 0 0 1
6 2 1 2
10 0 2 1
8 1 2 1
11 1 3 3
10 3 2 0
8 0 0 2
5 2 0 2
6 3 2 3
6 3 3 1
12 3 2 1
8 1 1 1
11 1 0 0
10 0 0 3
6 3 2 1
6 2 2 0
6 3 3 2
0 0 2 0
8 0 3 0
8 0 1 0
11 0 3 3
10 3 3 2
6 1 3 1
8 1 0 3
5 3 2 3
8 0 0 0
5 0 2 0
1 1 3 0
8 0 1 0
11 2 0 2
6 3 1 1
6 2 0 0
4 1 0 1
8 1 2 1
11 2 1 2
10 2 1 1
6 3 0 2
6 1 2 3
3 0 3 0
8 0 1 0
11 0 1 1
8 3 0 2
5 2 2 2
6 2 0 3
8 2 0 0
5 0 3 0
2 2 0 2
8 2 1 2
11 1 2 1
10 1 2 0
6 3 0 1
8 0 0 2
5 2 0 2
14 2 3 1
8 1 2 1
11 1 0 0
10 0 2 3
6 3 3 2
6 1 3 0
8 3 0 1
5 1 1 1
11 1 0 2
8 2 3 2
8 2 3 2
11 3 2 3
10 3 3 1
6 2 2 2
6 0 2 3
7 3 2 0
8 0 2 0
8 0 2 0
11 1 0 1
10 1 2 3
6 3 2 0
8 2 0 2
5 2 0 2
8 1 0 1
5 1 3 1
0 2 0 0
8 0 3 0
11 0 3 3
10 3 2 1
6 1 1 0
8 3 0 3
5 3 0 3
6 1 1 2
6 3 0 2
8 2 2 2
11 2 1 1
10 1 3 2
8 3 0 1
5 1 1 1
6 3 1 3
11 0 0 1
8 1 1 1
11 1 2 2
10 2 1 1
6 1 2 2
6 3 2 0
6 2 1 3
12 0 2 0
8 0 3 0
11 1 0 1
10 1 1 2
6 2 3 0
8 2 0 3
5 3 1 3
6 3 1 1
5 3 1 3
8 3 2 3
11 2 3 2
6 0 3 3
6 3 0 0
8 2 0 1
5 1 2 1
13 1 0 0
8 0 1 0
11 0 2 2
10 2 3 1
6 2 1 2
6 1 2 3
6 3 0 0
2 2 0 3
8 3 3 3
11 1 3 1
10 1 2 3
6 1 3 0
6 3 0 1
5 0 1 1
8 1 2 1
11 1 3 3
10 3 3 2
6 1 3 3
8 0 0 1
5 1 0 1
8 1 0 0
5 0 2 0
3 0 3 1
8 1 2 1
11 2 1 2
6 1 1 0
6 0 2 1
8 3 0 3
5 3 2 3
5 0 1 0
8 0 3 0
8 0 2 0
11 0 2 2
6 1 0 1
6 2 1 0
15 0 3 3
8 3 3 3
11 3 2 2
6 0 2 1
6 2 3 3
6 3 3 0
4 0 3 1
8 1 2 1
11 2 1 2
6 0 1 3
8 0 0 0
5 0 2 0
8 3 0 1
5 1 2 1
6 3 0 0
8 0 2 0
8 0 3 0
11 0 2 2
10 2 1 3
8 2 0 2
5 2 3 2
6 1 1 1
6 2 3 0
1 1 0 2
8 2 3 2
11 3 2 3
10 3 0 0
6 0 3 3
8 3 0 1
5 1 0 1
6 2 0 2
7 3 2 2
8 2 2 2
11 0 2 0
10 0 0 3
6 2 3 1
8 3 0 2
5 2 0 2
6 3 3 0
13 1 0 2
8 2 3 2
8 2 3 2
11 3 2 3
8 3 0 2
5 2 2 2
2 2 0 1
8 1 3 1
11 3 1 3
10 3 2 2
6 1 3 3
6 3 3 1
6 2 0 0
3 0 3 3
8 3 3 3
11 3 2 2
10 2 2 0
6 1 1 1
6 2 1 3
8 2 0 2
5 2 0 2
14 2 3 2
8 2 2 2
8 2 3 2
11 2 0 0
10 0 1 3
6 3 0 1
6 3 2 2
6 2 0 0
6 2 1 0
8 0 2 0
11 3 0 3
10 3 0 1
6 0 1 3
6 2 3 2
8 3 0 0
5 0 0 0
7 3 2 3
8 3 3 3
8 3 2 3
11 1 3 1
10 1 1 2
6 2 0 0
8 0 0 3
5 3 1 3
6 1 1 1
1 3 0 1
8 1 2 1
11 1 2 2
10 2 2 3
6 0 2 1
6 3 1 0
6 2 2 2
2 2 0 1
8 1 3 1
8 1 1 1
11 1 3 3
10 3 1 2
6 1 0 1
6 2 2 3
1 1 3 0
8 0 2 0
8 0 3 0
11 2 0 2
10 2 3 1
6 2 0 0
6 2 0 2
15 0 3 3
8 3 1 3
11 3 1 1
10 1 0 3
6 3 0 2
6 1 3 1
0 0 2 2
8 2 3 2
11 3 2 3
10 3 3 0
6 1 2 3
6 3 1 1
6 0 0 2
12 1 2 3
8 3 3 3
8 3 3 3
11 3 0 0
10 0 3 1
8 1 0 0
5 0 2 0
8 1 0 2
5 2 2 2
6 0 2 3
7 3 2 2
8 2 2 2
11 2 1 1
10 1 2 3
6 2 3 1
6 3 1 2
13 1 2 0
8 0 3 0
11 0 3 3
10 3 1 1
6 1 2 3
6 3 1 0
8 3 2 0
8 0 1 0
11 1 0 1
6 1 3 0
6 2 2 2
6 3 0 3
10 0 2 0
8 0 1 0
11 0 1 1
6 3 0 0
2 2 0 3
8 3 1 3
11 3 1 1
10 1 2 3
6 1 2 2
8 1 0 1
5 1 1 1
6 2 2 0
1 1 0 0
8 0 3 0
11 3 0 3
10 3 1 0
6 2 0 3
6 2 0 2
1 1 3 3
8 3 1 3
11 3 0 0
10 0 0 3
6 3 2 1
8 3 0 0
5 0 2 0
6 3 2 2
0 0 2 2
8 2 1 2
11 3 2 3
10 3 3 0
8 0 0 3
5 3 0 3
6 1 3 1
6 2 2 2
7 3 2 3
8 3 1 3
8 3 3 3
11 0 3 0
10 0 0 3
6 3 2 2
6 2 1 0
0 0 2 1
8 1 3 1
8 1 2 1
11 1 3 3
8 1 0 2
5 2 2 2
6 3 1 0
6 3 3 1
2 2 1 1
8 1 1 1
11 3 1 3
10 3 1 1
6 3 2 3
6 2 0 0
6 3 0 2
13 0 2 3
8 3 3 3
8 3 1 3
11 3 1 1
10 1 2 3
8 2 0 0
5 0 1 0
8 3 0 2
5 2 2 2
8 0 0 1
5 1 0 1
11 0 0 1
8 1 2 1
11 3 1 3
10 3 3 0
6 0 1 3
6 3 3 1
6 3 1 2
14 3 2 3
8 3 3 3
11 0 3 0
10 0 2 3
6 1 0 1
6 1 0 0
6 2 3 2
10 0 2 1
8 1 1 1
8 1 2 1
11 1 3 3
6 1 1 2
6 0 3 1
5 0 1 2
8 2 3 2
11 3 2 3
10 3 2 1
8 3 0 3
5 3 2 3
8 1 0 0
5 0 2 0
6 3 3 2
0 0 2 3
8 3 2 3
8 3 1 3
11 3 1 1
10 1 2 0
6 1 3 3
8 3 0 2
5 2 1 2
6 0 1 1
5 3 1 3
8 3 1 3
11 0 3 0
10 0 3 1
6 1 3 0
6 0 3 3
8 1 0 2
5 2 2 2
7 3 2 3
8 3 2 3
11 3 1 1
6 0 0 2
6 2 3 3
6 0 3 0
14 2 3 0
8 0 1 0
8 0 1 0
11 0 1 1
10 1 0 3
6 3 0 2
6 2 2 0
6 2 0 1
13 0 2 1
8 1 3 1
8 1 1 1
11 3 1 3
10 3 2 1
6 3 1 3
6 1 2 0
8 0 2 2
8 2 3 2
11 1 2 1
6 1 0 3
6 3 3 2
11 0 0 2
8 2 2 2
11 1 2 1
10 1 2 3
6 0 3 0
8 1 0 2
5 2 2 2
6 3 2 1
2 2 1 2
8 2 1 2
11 3 2 3
6 0 0 2
6 1 3 1
8 1 2 0
8 0 3 0
8 0 2 0
11 0 3 3
10 3 2 2
6 2 2 0
6 1 2 3
3 0 3 0
8 0 2 0
11 2 0 2
10 2 3 3
6 0 0 1
6 2 0 0
6 3 3 2
0 0 2 2
8 2 1 2
8 2 1 2
11 2 3 3
10 3 1 0
6 2 3 1
6 2 3 3
8 3 0 2
5 2 0 2
14 2 3 2
8 2 3 2
11 2 0 0
10 0 0 1
8 2 0 2
5 2 0 2
6 1 0 0
1 0 3 3
8 3 2 3
8 3 2 3
11 1 3 1
6 2 2 0
6 2 0 3
6 1 3 2
15 0 3 0
8 0 2 0
11 1 0 1
10 1 2 0
6 3 0 1
6 0 3 2
6 1 1 3
12 1 2 1
8 1 1 1
11 1 0 0
10 0 1 2
6 3 1 1
6 3 1 0
5 3 1 3
8 3 3 3
11 2 3 2
10 2 1 0
6 0 2 3
6 2 3 2
8 1 0 1
5 1 0 1
7 3 2 3
8 3 1 3
8 3 1 3
11 3 0 0
6 2 1 1
6 3 0 2
6 0 1 3
14 3 2 2
8 2 2 2
11 2 0 0
8 2 0 2
5 2 0 2
6 1 1 3
6 2 3 1
8 1 3 1
11 0 1 0
10 0 0 1
6 2 1 0
6 3 1 2
1 3 0 0
8 0 2 0
11 0 1 1
10 1 3 0
6 0 3 3
6 1 1 1
14 3 2 1
8 1 2 1
11 0 1 0
10 0 3 2
6 2 3 1
6 2 0 0
6 1 1 3
1 3 0 0
8 0 1 0
11 0 2 2
10 2 0 1
6 0 2 2
6 2 0 3
6 2 1 0
15 0 3 3
8 3 2 3
8 3 3 3
11 1 3 1
6 3 0 0
8 0 0 3
5 3 1 3
11 3 3 3
8 3 1 3
8 3 1 3
11 3 1 1
10 1 3 3
6 2 0 0
6 3 0 2
8 0 0 1
5 1 2 1
0 0 2 1
8 1 1 1
8 1 1 1
11 1 3 3
10 3 1 2
6 2 0 1
6 2 3 3
15 0 3 1
8 1 1 1
8 1 1 1
11 1 2 2
10 2 1 0
6 0 2 3
6 3 3 1
6 2 1 2
7 3 2 3
8 3 3 3
11 3 0 0
10 0 0 2
6 2 3 0
6 0 0 3
2 0 1 3
8 3 3 3
11 2 3 2
10 2 2 3
6 1 0 2
6 1 0 1
1 1 0 1
8 1 1 1
11 3 1 3
8 1 0 1
5 1 3 1
2 0 1 1
8 1 3 1
11 3 1 3
10 3 0 2
6 2 2 3
8 2 0 1
5 1 3 1
15 0 3 1
8 1 1 1
8 1 1 1
11 2 1 2
10 2 3 0
6 3 0 1
6 1 0 3
6 2 1 2
2 2 1 2
8 2 2 2
8 2 3 2
11 0 2 0
10 0 0 1
6 1 0 0
6 2 2 2
10 0 2 2
8 2 1 2
11 1 2 1
10 1 2 0
6 3 1 1
6 2 0 3
6 2 0 2
9 2 3 2
8 2 1 2
11 0 2 0
10 0 2 2
6 1 1 3
6 0 2 1
8 0 0 0
5 0 1 0
5 3 1 3
8 3 2 3
11 3 2 2
10 2 0 1
6 1 2 2
6 2 1 3
1 0 3 2
8 2 2 2
11 2 1 1
6 3 3 2
6 2 3 0
15 0 3 2
8 2 2 2
11 2 1 1
10 1 2 0
6 2 1 1
6 3 3 2
9 1 3 3
8 3 3 3
11 0 3 0
10 0 2 1
6 0 0 2
6 2 0 0
6 1 1 3
1 3 0 2
8 2 1 2
8 2 1 2
11 2 1 1
10 1 0 0
6 2 2 1
6 0 0 3
6 3 2 2
13 1 2 2
8 2 3 2
11 0 2 0
10 0 0 2
6 2 2 3
8 2 0 0
5 0 0 0
6 3 1 1
6 3 0 0
8 0 3 0
11 0 2 2
10 2 0 1
6 0 1 2
6 3 2 0
6 0 1 3
12 0 2 3
8 3 1 3
8 3 2 3
11 3 1 1
10 1 3 2
6 2 2 1
6 2 3 0
6 3 2 3
4 3 1 1
8 1 2 1
11 2 1 2
10 2 0 0
8 3 0 3
5 3 1 3
6 1 1 1
6 3 3 2
8 3 2 3
8 3 2 3
11 0 3 0
6 2 3 2
6 2 0 1
6 2 0 3
9 1 3 3
8 3 1 3
11 0 3 0
10 0 1 2
6 1 3 3
6 2 2 0
11 3 3 3
8 3 2 3
11 2 3 2
6 2 0 3
6 3 1 1
15 0 3 0
8 0 2 0
8 0 2 0
11 2 0 2
10 2 2 3
8 2 0 0
5 0 1 0
8 3 0 1
5 1 1 1
6 0 0 2
8 1 2 2
8 2 2 2
8 2 1 2
11 3 2 3
10 3 2 0
`;

