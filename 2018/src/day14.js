export function day14a() {
  const offset = input;
  const amount = 10;

  const board = [3, 7];
  const elves = [0, 1];

  for (let i = 0; board.length <= offset + amount; i++) {
    let sum = 0;
    for (const elf of elves) {
      sum += board[elf];
    }

    if (sum >= 10) {
      board.push(Math.floor(sum / 10));
      board.push(sum % 10);
    } else {
      board.push(sum);
    }

    for (let i = 0; i < elves.length; i++) {
      const elf = elves[i];
      const score = board[elf];
      elves[i] = (elf + score + 1) % board.length;
    }
  }

  return board.slice(offset, offset + amount).join('');
}

export function day14b() {
  const maxSize = 30000000;
  const needle = String(input).split('').map(Number);
  const board = [3, 7];
  const elves = [0, 1];

  let needleI = 0;
  let found = false;
  for (let i = 0; i < maxSize; i++) {
    let sum = 0;
    for (const elf of elves) {
      sum += board[elf];
    }

    if (sum >= 10) {
      const first = Math.floor(sum / 10);
      const second = sum % 10;

      board.push(first);
      if (first === needle[needleI]) {
        needleI++;
        if (needleI === needle.length) {
          found = true;
          break;
        }
      } else {
        needleI = 0;
      }

      board.push(second);
      if (second === needle[needleI]) {
        needleI++;
        if (needleI === needle.length) {
          found = true;
          break;
        }
      } else {
        needleI = 0;
      }
    } else {
      board.push(sum);
      if (sum === needle[needleI]) {
        needleI++;
        if (needleI === needle.length) {
          found = true;
          break;
        }
      } else {
        needleI = 0;
      }
    }

    for (let i = 0; i < elves.length; i++) {
      const elf = elves[i];
      const score = board[elf];
      elves[i] = (elf + score + 1) % board.length;
    }
  }

  if(found) {
    return board.length - needle.length;
  } else {
    return "Solution was not found";
  }
}

const input = 513401;

