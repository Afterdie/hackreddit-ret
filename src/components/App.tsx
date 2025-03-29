import { Devvit, useState, useAsync } from "@devvit/public-api";

import { createGene } from "../utils/createGene.js";
import { useWebView } from "@devvit/public-api";

/** Message from Devvit to the web view. */
export type DevvitMessage = { gene: number };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: "webViewReady" }
  | { type: "imgURL"; url: string };

const App: Devvit.CustomPostComponent = (context: Devvit.Context) => {
  //loads in the creature for the current post
  const { reddit, redis, media, ui } = context;
  const postId = context.postId;

  const [gene, setGene] = useState<number | null>(null);

  const {
    data: mediaUrl,
    loading,
    error,
  } = useAsync(async () => {
    const mediaId = await redis.get(`image:${postId}`);
    return mediaId ? `https://i.redd.it/${mediaId}.png` : null;
  });

  //generates a new post and stores its creature in media and mediaid in redis
  const createPost = async (imageUrl: string): Promise<string> => {
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
        <vstack
          padding="medium"
          gap="medium"
          alignment="center"
          cornerRadius="medium"
        >
          <text>{userName || "Someone"}'s RedPet is hatching 🐣</text>
        </vstack>
      ),
    });
    await redis.set(`image:${post.id}`, response.mediaId);
    return post.id;
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
      try {
        if (message.type === "webViewReady") {
          const newGene = await createGene(context);
          if (!newGene) throw new Error("Failed to generate gene");
          setGene(newGene);
          postMessage({
            gene: newGene,
          });
          //ui.showToast(`${newGene}`);
        } else if (message.type === "imgURL") {
          if (!gene) throw new Error("Faulty Gene");
          unmount();
          //get the post id of the post and store the gene against the postid
          const postId = await createPost(message.url);
          //store the preFitness values used for generating the leaderboards
          await redis.hSet("preFitness", { [postId]: gene.toString(2) });
          ui.showToast("Hatched your RedPet");
        }
      } catch (e) {
        if (e instanceof Error) ui.showToast(`Failed: ${e.message}`);
        else ui.showToast("Something went wrong");
      }
    },

    // Cleanup when web view is closed
    onUnmount: () => {},
  });
  return (
    <vstack
      padding="medium"
      gap="medium"
      alignment="center"
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
