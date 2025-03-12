import { Devvit, useState, useAsync } from "@devvit/public-api";
import { PageProps, PageType } from "../types/props.js";

const FlexPage: Devvit.BlockComponent<PageProps> = ({ navigate, context }) => {
  const { redis } = context;
  const postId = context.postId;

  const { data, loading, error } = useAsync(async () => {
    const res = await redis.hGet("preFitness", `${postId}`);
    return res ?? null;
  });

  const hatchPage: Devvit.Blocks.OnPressEventHandler = () => {
    navigate(PageType.HATCHPAGE);
  };

  return (
    <vstack
      padding="medium"
      gap="medium"
      alignment="top center"
      cornerRadius="medium"
    >
      {/* {loading && <text>Loading...</text>}
          {error && (
            <text color="red" wrap={true}>
              {error.message}
            </text>
          )}
          {data && <text>bruh{data}</text>} */}
      {data && <text>{data}</text>}
      <button onPress={hatchPage}>Hatch</button>
    </vstack>
  );
};

export default FlexPage;
