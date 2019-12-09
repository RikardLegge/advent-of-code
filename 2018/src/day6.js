const min = (a, b) => a <= b ? a : b;
const max = (a, b) => a >= b ? a : b;

export function day6a() {
  const points = input.split("\n").map(s => s.split(", ")).map(p => ({x: Number(p[0]), y: Number(p[1]), area: 0}));
  const minX = points.map(p => p.x).reduce(min);
  const maxX = points.map(p => p.x).reduce(max);
  const minY = points.map(p => p.y).reduce(min);
  const maxY = points.map(p => p.y).reduce(max);

  // new Grid()
  const grid = [];
  for (let x = minX; x <= maxX; x++) {
    const col = [];
    for (let y = minY; y <= maxY; y++) {
      col[y] = {owner: null, distance: Number.MAX_VALUE};
    }
    grid[x] = col;
  }
  // Add points to grid
  for (const point of points) {
    const {x, y} = point;
    grid[x][y] = {owner: point, distance: 0};
  }

  // Calculate manhattan distance and set cell owners
  for (const point of points) {
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const cell = grid[x][y];
        if(cell.owner === point) continue;

        const dx = Math.abs(x - point.x);
        const dy = Math.abs(y - point.y);
        const distance = dx + dy;
        if (distance < cell.distance) {
          cell.owner = point;
          cell.distance = distance;
        } else if (distance === cell.distance) {
          cell.owner = null;
        }
      }
    }
  }

  // Count cells owned by a point
  pointsLoop: for (const point of points) {
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const {owner} = grid[x][y];
        if (owner === point) {
          if (x === minX || x === maxX || y === minY || y === maxY) {
            point.area = Number.POSITIVE_INFINITY;
            continue pointsLoop;
          } else {
            point.area++;
          }
        }
      }
    }
  }

  // Remove infinite areas
  const nonInfinitePoints = points.filter(p => isFinite(p.area));
  // Return the largest area
  return nonInfinitePoints.map(p => p.area).reduce(max, 0);
}

export function day6b() {
  const MaxDistanceSum = 10000;
  const points = input.split("\n").map(s => s.split(", ")).map(p => ({x: Number(p[0]), y: Number(p[1]), area: 0}));
  const minX = points.map(p => p.x).reduce(min);
  const maxX = points.map(p => p.x).reduce(max);
  const minY = points.map(p => p.y).reduce(min);
  const maxY = points.map(p => p.y).reduce(max);

  let safeCells = 0;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      let sum = 0;
      for (const point of points) {
        const dx = Math.abs(x - point.x);
        const dy = Math.abs(y - point.y);
        const distance = dx + dy;
        sum += distance;
      }
      if(sum < MaxDistanceSum) {
        safeCells++;
      }
    }
  }

  return safeCells;
}

const input = `152, 292
163, 90
258, 65
123, 147
342, 42
325, 185
69, 45
249, 336
92, 134
230, 241
74, 262
241, 78
299, 58
231, 146
239, 87
44, 157
156, 340
227, 226
212, 318
194, 135
235, 146
171, 197
160, 59
218, 205
323, 102
290, 356
244, 214
174, 250
70, 331
288, 80
268, 128
359, 98
78, 249
221, 48
321, 228
52, 225
151, 302
183, 150
142, 327
172, 56
72, 321
225, 298
265, 300
86, 288
78, 120
146, 345
268, 181
243, 235
262, 268
40, 60`;