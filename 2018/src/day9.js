class DLLNode {
  constructor(value, previous=this, next=this) {
    this.value = value;
    this.previous = previous;
    this.next = next;
  }

  append(value) {
    const next = this.next;
    const node = new DLLNode(value, this, next);
    next.previous = node;
    this.next = node;
    return node;
  }

  remove() {
    const previous = this.previous;
    const next = this.next;
    previous.next = next;
    next.previous = previous;

    this.next = this;
    this.previous = this;
    return this.value;
  }
}

export function day9a() {
  let [_, playerCountStr, maxPointsStr] = /(\d+)[^\d]*(\d+)/.exec(input);
  const [playerCount, maxPoints] = [Number(playerCountStr), Number(maxPointsStr)];

  const players = [];
  for(let id = 0; id < playerCount; id++)
    players.push({id, score: 0});

  const root = new DLLNode(0);
  let currentNode = root;
  let nextMarbel = 1;
  gameLoop: while(true) {
    for(const player of players) {

      if(nextMarbel % 23 !== 0) {
        currentNode = currentNode.next;
        currentNode = currentNode.append(nextMarbel);
      } else {
        for(let i = 0; i < 7; i++)
          currentNode = currentNode.previous;
        const next = currentNode.next;
        player.score += nextMarbel + currentNode.remove();
        currentNode = next;
      }

      nextMarbel++;
      if(nextMarbel > maxPoints) break gameLoop;
    }
  }

  const winner = players.sort((a,b)=>b.score-a.score)[0];
  return winner.score;
}

export function day9b() {
  let [_, playerCountStr, maxPointsStr] = /(\d+)[^\d]*(\d+)/.exec(input);
  const [playerCount, maxPoints] = [Number(playerCountStr), Number(maxPointsStr)*100];

  const players = [];
  for(let id = 0; id < playerCount; id++)
    players.push({id, score: 0});

  const root = new DLLNode(0);
  let currentNode = root;
  let nextMarbel = 1;
  gameLoop: while(true) {
    for(const player of players) {

      if(nextMarbel % 23 !== 0) {
        currentNode = currentNode.next;
        currentNode = currentNode.append(nextMarbel);
      } else {
        for(let i = 0; i < 7; i++)
          currentNode = currentNode.previous;
        const next = currentNode.next;
        player.score += nextMarbel + currentNode.remove();
        currentNode = next;
      }

      nextMarbel++;
      if(nextMarbel > maxPoints) break gameLoop;
    }
  }

  const winner = players.sort((a,b)=>b.score-a.score)[0];
  return winner.score;
}

const input = `452 players; last marble is worth 70784 points`;
