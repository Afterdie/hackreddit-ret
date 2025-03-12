import { Devvit } from "@devvit/public-api";

import { PageProps } from "../types/props.js";

import { createGene } from "../utils/createGene.js";

const HatchPage: Devvit.BlockComponent<PageProps> = ({navigate, context}) => {
    const hatch: Devvit.Blocks.OnPressEventHandler = () => {
        //create the post here and also write to the redis db
        const value = createGene(context)
    };
  
    return (
      <vstack
        padding="medium"
        gap="medium"
        alignment="top center"
        cornerRadius="medium"
      >
        <button onPress={hatch} appearance="secondary">
          Post your ret to h it
        </button>
      </vstack>
    );
  };

export default HatchPage