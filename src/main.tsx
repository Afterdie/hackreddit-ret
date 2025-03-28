import { Devvit, useState } from "@devvit/public-api";

import App from "./components/App.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

Devvit.addCustomPostType({
  name: "Ret",
  description: "Evolve your ret!",
  render: App,
});

Devvit.addTrigger({
  event: "AppInstall",
  onEvent: async (_, context) => {
    const { redis } = context;

    try {
      await redis.zAdd(
        "population",
        { member: "00000011011101111001001011101001010", score: 80 },
        { member: "11101011001010100000010111111000011", score: 95 },
        { member: "00100011101010010000101111111111001", score: 77 },
        { member: "01110010011001001000010010101001111", score: 84 },
        { member: "01100110101000101001101010000010110", score: 92 }
      );
      await redis.set("installed_on", new Date().toISOString());
    } catch (e) {
      console.log("something went wrong");
    }
  },
});

Devvit.addMenuItem({
  label: "Genesis",
  location: "subreddit",
  onPress: async (_, context) => {
    const { reddit, ui, redis } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: "Pet Genesis",
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">A RedPet just landed !</text>
        </vstack>
      ),
    });

    //since we dont have the gene no point storing
    // const postId = post.id;
    // redis.hSet("preFitness", { [postId]: "1100" });

    ui.showToast({ text: "Created post!" });
    ui.navigateTo(post);
  },
});

export default Devvit;
