import { Devvit } from "@devvit/public-api";

export enum PageType {
  FLEXPAGE,
  HATCHPAGE,
}

export interface PageProps {
  navigate: (page: PageType) => void;
  context: Devvit.Context;
}

export interface creature {
  member: string;
  score: number;
}
