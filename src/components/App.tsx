import { Devvit, useState, useAsync } from "@devvit/public-api";

import { createGene } from "../utils/createGene.js";
import { useWebView } from "@devvit/public-api";

/** Message from Devvit to the web view. */
export type DevvitMessage = { type: "set-gene"; gene: number };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: "webViewReady" }
  | { type: "imgURL"; url: string };

const App: Devvit.CustomPostComponent = (context: Devvit.Context) => {
  //loads in the creature for the current post
  const { reddit, redis, media, ui } = context;
  const postId = context.postId;
  const {
    data: mediaUrl,
    loading,
    error,
  } = useAsync(async () => {
    //const res = await redis.hGet("preFitness", `${postId}`);
    const mediaId = await redis.get(`image:${postId}`);
    const mediaUrl = `https://i.redd.it/${mediaId}.png`;
    return mediaUrl ?? null;
  });

  //generates a new post and stores its creature in media and mediaid in redis
  const createPost = async (imageUrl: string): Promise<void> => {
    const userName = await reddit.getCurrentUsername();
    const subName = context.subredditName || "Some guy";
    const response = await media.upload({
      url: imageUrl,
      type: "image",
    });
    const post = await reddit.submitPost({
      title: `${userName}'s pet`,
      subredditName: subName,
      preview: (
        <vstack>
          <text>Wait a min</text>
        </vstack>
      ),
    });
    await redis.set(`image:${post.id}`, response.mediaId);
    redis.hSet("preFitness", { [post.id]: "1100" });
  };

  //for handling the webview interaction and messages
  const { mount, unmount, postMessage } = useWebView<
    WebViewMessage,
    DevvitMessage
  >({
    // URL of your web view content
    url: "page.html",

    // Message handler
    onMessage: async (message) => {
      if (message.type === "webViewReady") {
        const gene = await createGene(context);
        postMessage({
          type: "set-gene",
          gene: gene,
        });
      } else if (message.type === "imgURL") {
        unmount();
        createPost(message.url);
      }
    },

    // Cleanup when web view is closed
    onUnmount: () => {},
  });
  return (
    <vstack
      padding="medium"
      gap="medium"
      alignment="top center"
      cornerRadius="medium"
    >
      {loading && <text>Loading...</text>}
      {error && <text>Error fetching message</text>}
      {mediaUrl && <image url={mediaUrl} imageHeight={200} imageWidth={200} />}
      <button onPress={mount}>Hatch</button>
    </vstack>
  );
};

export default App;
