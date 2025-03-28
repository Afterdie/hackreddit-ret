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
        { member: "1100", score: 80 },
        { member: "1111", score: 95 },
        { member: "0000", score: 77 },
        { member: "0101", score: 84 },
        { member: "1001", score: 92 }
      );
      await redis.set("installed_on", new Date().toISOString());
    } catch (e) {
      console.log("something went wrong");
    }
  },
});

Devvit.addMenuItem({
  label: "Gen",
  location: "subreddit",
  onPress: async (_, context) => {
    const { reddit, ui, redis } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: "Web View Example",
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">on the way ...</text>
        </vstack>
      ),
    });

    const postId = post.id;
    redis.hSet("preFitness", { [postId]: "1100" });

    ui.showToast({ text: "Created post!" });
    ui.navigateTo(post);
  },
});

export default Devvit;
