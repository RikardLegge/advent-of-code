function getPowerLevel(x,y,serial) {
  const rackID = x + 10;
  let powerLevel = y * rackID;
  powerLevel += serial;
  powerLevel *= rackID;
  powerLevel = Math.floor(powerLevel / 100) % 10;
  powerLevel -= 5;
  return powerLevel;
}

export function day11a() {
  const width = 300;
  const height = 300;
  const grid = [];
  for (let x = 1; x <= width; x++) {
    const col = [];
    for (let y = 1; y <= height; y++) {
      col[y] = getPowerLevel(x,y,input);
    }
    grid[x] = col;
  }

  let max = {sum: Number.NEGATIVE_INFINITY, x: -1, y: -1};
  for (let x = 1; x <= width-2; x++) {
    for (let y = 1; y <= height-2; y++) {
      let sum = 0;
      for (let dx = 0; dx <= 2; dx++) {
        for (let dy = 0; dy <= 2; dy++) {
          sum += grid[x + dx][y + dy];
        }
      }
      if (sum > max.sum) {
        max = {sum, x, y};
      }
    }
  }
  return `${max.x},${max.y}`;
}

export function day11b() {
  const size = 300;
  const grid = [];
  for (let x = 1; x <= size; x++) {
    const col = [];
    for (let y = 1; y <= size; y++) {
      const power = getPowerLevel(x,y,input);
      col[y] = {power, area: 0, row: 0, col: 0};
    }
    grid[x] = col;
  }

  let max = {sum: Number.NEGATIVE_INFINITY, x: -1, y: -1, s: -1};
  for(let s = 1; s <= size; s++) {
    for (let x = 1; x < size - s; x++) {
      const dx = x+s-1;
      for (let y = 1; y < size - s; y++) {
        const dy = y+s-1;
        let area = grid[x][y].area;
        let row = grid[x][dy].row;
        let col = grid[dx][y].col;

        const extra = grid[dx][dy].power;
        const sum = area + row + col + extra;
        if (sum > max.sum) {
          max = {sum, x, y, s};
        }

        grid[x][y].area = sum;
        grid[x][dy].row = row+extra;
        grid[dx][y].col = col+extra;
      }
    }
  }
  return `${max.x},${max.y},${max.s}`;
}

const input = 9445;
