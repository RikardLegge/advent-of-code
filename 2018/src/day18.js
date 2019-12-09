export function day18a() {
  const world = parseWorld(input);
  for (let i = 0; i < 10; i++) {
    world.step();
  }

  return world.woods() * world.lumberyards();
}

export function day18b() {
  const minutes = 1000000000;
  const world = parseWorld(input);
  const states = new Map();
  states.set(world.toString(), 0);

  let from, to;
  for (let i = 0; i < minutes; i++) {
    world.step();
    const state = world.toString();
    if (states.has(state)) {
      to = i;
      from = states.get(state);
      break;
    }
    states.set(state, i);
  }

  const period = to - from;
  const left = (minutes - from) % period;
  {
    const world = parseWorld(input);
    for (let i = 0; i < from + left; i++) world.step();
    return world.woods() * world.lumberyards();
  }
}

function parseWorld(input) {
  const rows = input.split('\n');
  const grid = [];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const type = rows[x][y];
      if (!grid[x]) grid[x] = [];
      grid[x][y] = type;
    }
  }
  return new World(grid);
}

class World {
  constructor(grid) {
    this.grid = grid;
  }

  get(x, y) {
    const column = this.grid[x];
    if (!column) return null;
    return this.grid[x][y];
  }

  adjacentPredicate(x, y, type, max) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (this.get(x + dx, y + dy) === type) {
          count++;
          if (count >= max) return true;
        }
      }
    }
    return false;
  }

  nextCell(x, y) {
    const type = this.grid[x][y];
    if (type === ".") {
      const hasTrees = this.adjacentPredicate(x, y, "|", 3);
      if (hasTrees) return "|";
      return ".";
    } else if (type === "|") {
      const hasLumber = this.adjacentPredicate(x, y, "#", 3);
      if (hasLumber) return "#";
      return "|";
    } else if (type === "#") {
      const hasLumber = this.adjacentPredicate(x, y, "#", 1);
      const hasTrees = this.adjacentPredicate(x, y, "|", 1);
      if (hasLumber && hasTrees) return "#";
      return ".";
    }
  }

  step() {
    const newGrid = [];
    const grid = this.grid;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (!newGrid[x]) newGrid[x] = [];
        newGrid[x][y] = this.nextCell(x, y);
      }
    }
    this.grid = newGrid;
  }

  woods() {
    const grid = this.grid;
    let count = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[x][y] === "|") count++;
      }
    }
    return count;
  }

  lumberyards() {
    const grid = this.grid;
    let count = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[x][y] === "#") count++;
      }
    }
    return count;
  }

  toString() {
    const grid = this.grid;
    return grid.map(r => r.join('')).join('\n');
  }

  print() {
    console.log(this.toString());
  }
}

const testInput = `.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.`;

const input = `#...|#...#.....#...|#.#.|...|......|#|...|||#..||.
.|..#.....#.|...#.##.#.#||.#...|#...#.|.|.#..||...
.#..#.###|.#..|.......#...|.#|..#......|.#..#.....
...#.#|#.#.#.|.|#.#.#.#.##....#.......|##||..#.|.#
..##...#.....|||.#|.#..|.#.#...|....#....#........
.#.#...#|...#........|.#..#.|#.#.#|.|.....##...#|#
#......|....||.##..#|...|..|||....##..|.#.|.###|..
...#|....|...........#||..|...|#|....||||..#|..#..
|..|....#....###....|.|..#.#|.|....#....#.#.#...||
..#.#...#.#...|||#|#..|..#.||..#......|..##...|.#|
.|#.#.||.##..#..#.|.#......|.###.#|.#|....|...##..
.|..|#|.....||...#.|.#.|#|##|..|..|||..||#......|.
#.....||#.|..##....|#|||..|....|..#.#.#|#|#...|..|
..#|..........|#..#..#|.#..|...##|.#..#...|#|..#.|
#|....#...|.##..#.|#.|.|##.........|.|.......#...|
.....|.....||###.#.##..|....|..|||##|.|#.|.||#..#.
|..#.||#|#.#.|##.|||#.|###.#|#...##...#.|.....|..|
.||...#.|.....|#|...|....#......#....|.|.|||#.#..#
...|..#....|.||||..|..|........|..#.......#..#.|..
##||#|||..........|##.#.#....###..|..||...|.#.|..#
|##||#....#....|.......#......||...#..#.||..#.|#..
.##.#..|.|#.##.....##|..#......#.#..|...#...#...|.
.#...#......#.##..##.|#.#.#.|.|#.||....##|..|....|
#...#..#||#.||....#|..|....#..|.#|#|###|||....|..|
..|.|||.#||.#|........#....|.##||||.|##..#........
.......|#.#|.|..|#|.#........|#|.||.....##.||||..#
..|...##...#..||#|.##|..#..|...##..#.|||#|#|||.||.
.#..|..#....##........|..##||.#..||#.....###.....|
##......|#.|...#..#||..||||...|..||.|...|..#...#.#
#.|...#.#..#.....#..|.|.#.....#|.#.........#.#....
.....#...|..##|....#|..||#....||#...#.#.||.||#..|#
....#...#..|||.#...#.|.....|.....||.#...||#.....#.
....#....|....#...##|..|||||#........|....##..#.##
.#...#.#|##.|..||..||......#||..|..|#...##.#.|##..
..#.#.#.#.||#.|###.....|#.#.......#....|#|.#..#.##
..###....|.#..|..##.#.||....|..#..||.|.###.|#..#|.
#...|.#..|..#..#.....|..||.|#..#||.|..||.#.||.#.|#
.#|...|....#..|.|..#....#|#.|.....|.|.#........|..
.#.#|..#..#....#..###..#|..#.|#|..|.....|.|#|...|#
.....|#.#|......####..|..#...#..|##.|..|.||#.#.|.|
|.....|..#.|....#...|..#....#|##|.#.#..#......#|.|
....|.....|#.|#.....#....|.#||...#...|.||.#...#|.#
.......#|..........##|#|.#|#.|.|.|.|#.....#....||.
|#|#....##.##||.#.#.#.......|||..#....|.|...|.|.|#
...#.#...#|#...#..||...|.##|..#.....##|#...|.|..|.
....#|.|..||.........||.......|..#.......##|.....#
..|.||.||#.#.#.|....|#||.#|..#...|.##|..##....#|.|
......#.||.#||..........#....#..|..........|...#.|
..||...|...............|.#|..#.#|....||.....|...|.
...##.|#.#..||.##..|#.....|.#...##|...............`;
