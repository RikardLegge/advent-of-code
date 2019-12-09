export function day19a() {
  const {instructions, ipReg} = parseInput(input);
  const vm = new VM(ipReg);

  console.log(factor(974));

  for (let i = 0; i < 10000000; i++) {
    if (i === 7593310) continue;
    if (!vm.executeNext(instructions)) return vm.registers[0];
  }
}

function parseInput() {
  const instructions = [];
  const rows = input.split('\n');
  let ipReg;
  for (let i = 0; i < rows.length; i++) {
    const instruction = /(#?\w+) (\d+)(?: (\d+) (\d))?/.exec(rows[i]);
    const op = instruction[1];
    if (op === "#ip") {
      ipReg = instruction[2];
    } else {
      const args = instruction.slice(2, 5).map(Number);
      instructions.push({op, args});
    }
  }

  return {instructions, ipReg};
}

export function day19b() {
  let prime = 2 * 2 * 19 * 11;
  let one = 6 * 22 + 6;
  prime += one;
  one = (27 * 28 + 29) * 30 * 15 * 32;
  prime += one;

  console.log(prime);
  return factor(10551374);
}

// Reversed engeneered version of the program
function factor(prime) {
  let primeCount = 0;

  for (let i = 1; i <= prime; i++) {
    for (let j = 1; j <= prime; j++) {
      if (i * j > prime) break;
      if (i * j === prime) {
        primeCount += i
      }
    }
  }

  return primeCount;
}


class VM {
  constructor(ipReg) {
    this.ipReg = ipReg;
    this.registers = [0, 0, 0, 0, 0, 0];
    this.history = [];
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

  executeNext(instructions) {
    const ip = this.registers[this.ipReg];
    const instruction = instructions[ip];
    if (!instruction) return false;
    const {op, args} = instruction;
    this.execute(op, ...args);
    this.history.push(ip);
    return true;
  }

  execute(op, a, b, c) {
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

    reg[this.ipReg]++;
  }
}

// 3 4 5 6 8 9 10 11 3 ...
const input = `#ip 2
addi 2 16 2
seti 1 0 4
seti 1 5 5
mulr 4 5 1
eqrr 1 3 1
addr 1 2 2
addi 2 1 2
addr 4 0 0
addi 5 1 5
gtrr 5 3 1
addr 2 1 2
seti 2 6 2
addi 4 1 4
gtrr 4 3 1
addr 1 2 2
seti 1 7 2
mulr 2 2 2
addi 3 2 3
mulr 3 3 3
mulr 2 3 3
muli 3 11 3
addi 1 6 1
mulr 1 2 1
addi 1 6 1
addr 3 1 3
addr 2 0 2
seti 0 3 2
setr 2 3 1
mulr 1 2 1
addr 2 1 1
mulr 2 1 1
muli 1 14 1
mulr 1 2 1
addr 3 1 3
seti 0 9 0
seti 0 5 2`;

const prog = `#ip 2
addi 2 16 2 bra 16
seti 1   4  four=1
seti 1   5  five=1
mulr 4 5 1  one=four*five
eqrr 1 3 1  isTrue = one == three
addr 1 2 2  if(isTrue) bra 1
addi 2 1 2  bra 1
addr 4 0 0    sum += four
addi 5 1 5  five += 1
gtrr 5 3 1  isTrue = five > three
addr 2 1 2  if(isTrue) bra 1
seti 2   2    jmp 2
addi 4 1 4  four += 1
gtrr 4 3 1  isTrue = four > three
addr 1 2 2  if(isTrue) bra 1
seti 1   2    jmp 1
mulr 2 2 2  jmp 257
addi 3 2 3  three += 2
mulr 3 3 3  three *= three
mulr 2 3 3  three *= ip
muli 3 11 3 three *= 11
addi 1 6 1  one += 6
mulr 1 2 1  one *= ip
addi 1 6 1  one += 6
addr 3 1 3  three += one
addr 2 0 2  bra sum
seti 0   2  jmp 0
setr 2   1  one = ip
mulr 1 2 1  one *= ip
addr 2 1 1  one += ip
mulr 2 1 1  one *= ip
muli 1 14 1 one *= 14
mulr 1 2 1  one *= ip
addr 3 1 3  three += one
seti 0   0  sum = 0
seti 0   2  jmp 0
`;
