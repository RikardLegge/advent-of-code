export function day12a() {
  return simulatePots(20);
}

function countPots(pots, offset) {
  return Array.from(pots).reduce((acc, plant, i) => {
    if (plant === '#') {
      return i + acc + offset;
    } else {
      return acc;
    }
  }, 0);
}

function trimPots(pots) {
  return pots
    .replace(/(^\.*)/, '')
    .replace(/\.*$/, '');
}

function simulatePots(generations) {
  const [initialStr, , ...rulesStr] = input.split('\n');
  const state = initialStr.split(': ')[1].split('').join('');
  const rules = rulesStr.map(r => {
    const [key, value] = r.split(" => ");
    return {key, value};
  });

  const pad = ".....";
  let pots = pad + state + pad;
  let offset = -pad.length;
  for (let g = 1; g <= generations; g++) {
    let newPots = pots.substr(0, 2);
    potLoop: for (let c = 2; c < pots.length - 2; c++) {
      const sur = pots.substr(c - 2, 5);
      for (const {key, value} of rules) {
        if (key === sur) {
          newPots += value;
          continue potLoop;
        }
      }
      newPots += '.';
    }
    newPots += pots.substr(pots.length - 2, 2);
    const start = /^\.*/.exec(newPots)[0].length;
    const end = /\.*$/.exec(newPots)[0].length;
    const oldOffset = offset;

    newPots = newPots.substring(start, newPots.length - end);
    offset += start;

    const hasChanged = trimPots(pots) !== newPots;
    pots = pad + newPots + pad;
    offset -= pad.length;

    if (!hasChanged) {
      const deltaOffset = offset - oldOffset;
      offset += (generations - g) * deltaOffset;
      break;
    }
  }

  return countPots(pots, offset);
}

export function day12b() {
  return simulatePots(50000000000);
}

const input = `initial state: ##..#.#.#..##..#..##..##..#.#....#.....##.#########...#.#..#..#....#.###.###....#..........###.#.#..

..##. => .
..... => .
##..# => .
...#. => .
#.... => .
...## => #
.#.#. => .
#..#. => #
##.#. => .
#..## => .
..#.. => .
#.#.# => .
###.# => .
###.. => .
.#... => #
.##.# => .
##... => #
..### => .
####. => .
#...# => #
.#..# => #
##### => #
..#.# => #
.#.## => #
#.### => .
....# => .
.###. => .
.#### => #
.##.. => .
##.## => #
#.##. => #
#.#.. => #`;
