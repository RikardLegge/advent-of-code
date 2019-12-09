const WALL = {type: 'wall', icon: '#'};
const GROUND = {type: 'ground', icon: '.'};
const PATH_ORDER = [{dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: 1}];
const PATH_ORDER_KEYS = PATH_ORDER.map(({dx, dy}) => `${dx}:${dy}`);

class Goblin {
  constructor(x, y) {
    this.type = "goblin";
    this.enemy = "elf";
    this.icon = 'G';
    this.hp = 200;
    this.attack = 3;
    this.x = x;
    this.y = y;
  }
}

class Elf {
  constructor(x, y) {
    this.type = "elf";
    this.enemy = "goblin";
    this.icon = 'E';
    this.hp = 200;
    this.attack = 3;
    this.x = x;
    this.y = y;
  }
}

class WorldMap {
  constructor(grid) {
    this.grid = grid;
    this.width = this.grid.length;
    this.height = this.grid[0].length;
  }

  get(x, y) {
    return this.grid[y][x];
  }

  set(x, y, entity) {
    this.grid[y][x] = entity;
  }

  remove(entity) {
    const {x, y} = entity;
    if (this.get(x, y) !== entity) throw new Error("Invariant not upheld");
    this.set(x, y, GROUND);
  }

  move(entity, {dx, dy}) {
    this.remove(entity);

    const {x, y} = entity;
    entity.x = x + dx;
    entity.y = y + dy;
    this.set(entity.x, entity.y, entity);
  }

  findAdjacentEnemy(entity) {
    let lowestHpOrOrder = null;
    for (const {dx, dy} of PATH_ORDER) {
      const neighbour = this.get(entity.x + dx, entity.y + dy);
      if (neighbour.type === entity.enemy) {
        if (!lowestHpOrOrder) lowestHpOrOrder = neighbour;
        else if (lowestHpOrOrder.hp > neighbour.hp) lowestHpOrOrder = neighbour;
      }
    }
    return lowestHpOrOrder;
  }

  findEnemyPath(entity, start) {
    const closedSet = new Set();
    const openSet = new Set();
    const cameFrom = new Map();
    const scores = new Map();

    openSet.add(start);
    scores.set(start, 0);

    const enemies = new Set();
    let enemyDistance = Infinity;

    while (openSet.size > 0) {
      const current = [...openSet].sort((a, b) => scores.get(a) - scores.get(b))[0];
      const [sx, sy] = current.split(':');
      const [x, y] = [Number(sx), Number(sy)];
      const currentScore = scores.get(current);

      if (currentScore > enemyDistance + 1) break;

      openSet.delete(current);
      closedSet.add(current);

      for (const {dx, dy} of PATH_ORDER) {
        const neighbour = `${x + dx}:${y + dy}`;
        if (closedSet.has(neighbour)) continue;
        // We can't pass walls or friends
        const neighbourEntity = this.get(x + dx, y + dy);
        if (neighbourEntity.type === 'wall' || neighbourEntity.type === entity.type) continue;

        openSet.add(neighbour);

        const newScore = currentScore + 1;
        const from = cameFrom.get(neighbour) || new Set();
        from.add(current);
        cameFrom.set(neighbour, from);
        scores.set(neighbour, newScore);

        if (newScore <= enemyDistance) {
          if (neighbourEntity.type === entity.enemy) {
            enemyDistance = newScore;
            enemies.add(neighbour);
          }
        }
      }
    }

    function followPath(from, target) {
      const firstMoves = new Set();
      for (const pos of from) {
        const from = cameFrom.get(pos);
        if (from.has(start)) {
          firstMoves.add(pos);
        } else {
          const end = followPath(from, target);
          for (const pos of end) {
            firstMoves.add(pos);
          }
        }
      }
      return firstMoves;
    }

    const paths = [];
    for (const enemy of enemies) {
      let pos = enemy;
      let from = cameFrom.get(pos);
      const firstMoves = followPath(from, start);
      const firstMove = [...firstMoves].sort((a, b) => PATH_ORDER_KEYS.indexOf(a.path) - PATH_ORDER_KEYS.indexOf(b.path))[0];
      const [sx, sy] = firstMove.split(':');
      const [dx, dy] = [Number(sx) - entity.x, Number(sy) - entity.y];
      const path = `${dx}:${dy}`;
      const cost = scores.get(enemy);
      paths.push({path, cost});
    }
    return paths;
  }

  // https://en.wikipedia.org/wiki/A*_search_algorithm
  findEnemyDirection(entity) {
    if (!entity.enemy) return null;

    const x = entity.x;
    const y = entity.y;
    const start = `${x}:${y}`;
    const paths = this.findEnemyPath(entity, start);
    if (paths.length === 0) return null;

    const pathList = paths.sort((a, b) => a.cost * 100 - b.cost * 100 + PATH_ORDER_KEYS.indexOf(a.path) - PATH_ORDER_KEYS.indexOf(b.path));
    const chosenPath = pathList[0].path;
    const [sx, sy] = chosenPath.split(':');
    const [dx, dy] = [Number(sx), Number(sy)];
    return {dx, dy};
  }

  print() {
    for (let y = 0; y < this.height; y++) {
      let toPrint = `${y}`.padEnd(4, ' ');
      const entities = [];
      for (let x = 0; x < this.width; x++) {
        const entity = this.get(x, y);
        if (entity.hp) entities.push(entity);
        toPrint += entity.icon;
      }
      toPrint += "   " + entities.map(e => `${e.icon}(${e.hp})`).join(', ');
      console.log(toPrint);
    }
    console.log('');
  }
}

function parseWorld(input) {
  const inputRows = input.split('\n');
  const mapGrid = [];
  const entities = [];
  for (let y = 0; y < inputRows.length; y++) {
    const mapRow = [];
    for (let x = 0; x < inputRows[y].length; x++) {
      const inputCell = inputRows[y][x];
      switch (inputCell) {
        case "#": {
          mapRow.push(WALL);
          break;
        }
        case ".": {
          mapRow.push(GROUND);
          break;
        }
        case "G": {
          const goblin = new Goblin(x, y);
          entities.push(goblin);
          mapRow.push(goblin);
          break;
        }
        case "E": {
          const elf = new Elf(x, y);
          entities.push(elf);
          mapRow.push(elf);
          break;
        }
        default:
          throw new Error("Invalid character: " + inputCell);
      }
    }
    mapGrid[y] = mapRow;
  }
  const map = new WorldMap(mapGrid);
  return {map, entities};
}

function simulateRound(map, entities) {
  let somethingHappened = false;
  let roundCompleted = true;

  entities.sort((a, b) => (a.x + a.y * map.width) - (b.x + b.y * map.width));
  const deadEntities = [];
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (deadEntities.indexOf(entity) !== -1) continue;

    let enemyExists = false;
    for (let enemy of entities) {
      if (deadEntities.indexOf(enemy) !== -1) continue;
      if (entity.enemy !== enemy.type) continue;
      enemyExists = true;
      break;
    }
    if (!enemyExists) {
      roundCompleted = false;
      break;
    }

    let enemy = map.findAdjacentEnemy(entity);
    if (!enemy) {
      const direction = map.findEnemyDirection(entity);
      if (!direction) continue;
      map.move(entity, direction);
      somethingHappened = true;
      enemy = map.findAdjacentEnemy(entity);
    }
    if (enemy) {
      enemy.hp -= entity.attack;
      if (enemy.hp <= 0) {
        map.remove(enemy);
        deadEntities.push(enemy);
      }
      somethingHappened = true;
    }
  }

  for (const entity of deadEntities) {
    const i = entities.indexOf(entity);
    if (i === -1) throw new Error("Invariant not upheld");
    entities.splice(i, 1);
  }

  const done = !(somethingHappened && roundCompleted);
  return {done, deaths: deadEntities};

}

export function day15a() {
  const {entities, map} = parseWorld(input);

  let round = 0;
  while (true) {
    const {done} = simulateRound(map, entities);
    if (done) break;
    round++;
  }

  const hp = entities.reduce((tot, {hp}) => tot + hp, 0);
  return round * hp;
}

// Low:  46140
// High: 47678
export function day15b() {
  let round, entities, map, attack;
  increaseAttack: for (attack = 4; attack <= 200; attack++) {
    const startState = parseWorld(input);
    entities = startState.entities;
    map = startState.map;
    round = 0;

    entities.filter(({type}) => type === 'elf').forEach(e => e.attack = attack);
    while (true) {
      const {done, deaths} = simulateRound(map, entities);
      const elfDied = deaths.find(({type}) => type === 'elf');
      if (elfDied) continue increaseAttack;
      if (done) break increaseAttack;
      round++;
    }
  }

  const hp = entities.reduce((tot, {hp}) => tot + hp, 0);
  console.log(`    ${round}:${hp}:${attack}`);
  map.print();
  return round * hp + " which is wrong!!!";
}

const testInput = `#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`;

const input = `################################
################..##############
################..##############
##############.....#############
##############...G###.##########
###############..####.##########
###############...###.##########
#############.....#....##..#####
#############.......#.......####
##############.......#..#...####
#####G.#######.#.G.............#
#####..####.......G..G.G....#.##
#####.........#####.........####
####.#...##GG#######....E..#####
###G..G.G.#.#########.G....#####
####...G....#########........###
######..G...#########........###
######.G....#########..E.......#
######......#########.....#....#
######.......#######......E#.#.#
####.G........#####.GE.....#####
####..G.......E.E.....##...#####
###.#........G..#.....##..######
#..G..........######......######
###......#......####..#...######
###.............#######.########
###.....###....########..#######
###..#E.##....#######.....######
####....#############.##E#######
####..#..###########E..#########
#####...############E#.#########
################################`;

