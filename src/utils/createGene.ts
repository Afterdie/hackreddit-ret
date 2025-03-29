//inputs the parents as strings
import { Devvit } from "@devvit/public-api";

import PreviewPage from "../components/PreviewPage.js";
import { creature } from "../types/props.js";

export async function createGene(context: Devvit.Context): Promise<number> {
  //might have to change the start because too many items
  let pool: creature[] = await context.redis.zRange("population", 0, 100, {
    by: "score",
  });
  const [parentA, parentB] = selectParents(pool);

  const childGene = crossover(parentA, parentB);
  adjustWeights(parentA, parentB);
  return childGene;
  //creation of post
}

const selectParents = (pool: creature[]): [number, number] => {
  const cumulativeScores: number[] = [];
  let totalScore = 0;

  for (const item of pool) {
    totalScore += item.score;
    cumulativeScores.push(totalScore);
  }

  const pickOne = (): creature => {
    if (totalScore === 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const randomValue = Math.random() * totalScore;
    const index = binarySearch(cumulativeScores, randomValue);
    return pool[index];
  };

  let parentA = pickOne();
  let parentB = pickOne();
  while (parentA.member === parentB.member) {
    parentB = pickOne();
  }

  return [parseInt(parentA.member, 2), parseInt(parentB.member, 2)];
};

const crossover = (parentA: number, parentB: number): number => {
  // Ensure inputs are within 30-bit range
  parentA &= 0x3fffffff; // Mask to keep only 30 bits
  parentB &= 0x3fffffff; // 0x3FFFFFFF = 30 bits set (0b111111111111111111111111111111)

  // Choose a random crossover point (1 to 29)
  const crossoverPoint = Math.floor(Math.random() * 29) + 1;

  // Create bit masks for crossover
  const maskLeft = (1 << crossoverPoint) - 1; // Bits to keep from parentA
  const maskRight = ~maskLeft & 0x3fffffff; // Bits to keep from parentB

  // Create the child by combining bits from both parents
  const child = (parentA & maskLeft) | (parentB & maskRight);

  //add the shiny logic here

  return child;
};

//helper function
const binarySearch = (arr: number[], target: number): number => {
  let low = 0,
    high = arr.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] < target) low = mid + 1;
    else high = mid;
  }

  return low;
};

const adjustWeights = (parentA: number, parentB: number): void => {};
