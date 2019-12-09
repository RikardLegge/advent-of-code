import {day1a, day1b} from "./day1.js";
import {day2a, day2b} from "./day2.js";
import {day3a, day3b} from "./day3.js";
import {day4a, day4b} from "./day4.js";
import {day5a, day5b} from "./day5.js";
import {day6a, day6b} from "./day6.js";
import {day7a, day7b} from "./day7.js";
import {day8a, day8b} from "./day8.js";
import {day9a, day9b} from "./day9.js";
import {day10a, day10b} from "./day10.js";
import {day11a, day11b} from "./day11.js";
import {day12a, day12b} from "./day12.js";
import {day13a, day13b} from "./day13.js";
import {day14a, day14b} from "./day14.js";
import {day15a, day15b} from "./day15.js";
import {day16a, day16b} from "./day16.js";
import {day17a, day17b} from "./day17.js";
import {day18a, day18b} from "./day18.js";
import {day19a, day19b} from "./day19.js";

const days = [
  [day1a, day1b],
  [day2a, day2b],
  [day3a, day3b],
  [day4a, day4b],
  [day5a, day5b],
  [day6a, day6b],
  [day7a, day7b],
  [day8a, day8b],
  [day9a, day9b],
  [day10a, day10b],
  [day11a, day11b],
  [day12a, day12b],
  [day13a, day13b],
  [day14a, day14b],
  [day15a, day15b],
  [day16a, day16b],
  [day17a, day17b],
  [day18a, day18b],
  [day19a, day19b],
];

const hash = location.search.substring(1);
const day = Number(hash) || 1;
function getResult(dayId, index) {
  const day = days[dayId-1];
  if(!day) return "Unavailable";
  const start = Date.now();
  const result = day[index]();
  const end = Date.now();
  return `${result} [${end-start}ms]`;
}

document.body.innerHTML += `
<div class="days">
    ${days.map((_, i)=>`
        <a class="day" href="?${i+1}">${i+1}</a>
    `).join('')}
</div>`;
document.body.innerHTML += `
<div class="page">
    <div class="content">
        <div class="title">December ${day}</div>
    <div class="content">
    <div class="content">
        <div class="results">
            <div class="result" id="result-1"></div>
            <div class="result" id="result-2"></divclass>
        </div>
    </div>
</div>`;

document.getElementById("result-1").innerText = `a: ${getResult(day, 0)}`;
document.getElementById("result-2").innerText = `a: ${getResult(day, 1)}`;
