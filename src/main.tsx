import { Devvit, JobContext } from "@devvit/public-api";

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
    //setup a job that runs at the end of every day to generate the leaderboard from the fitness set
    await context.scheduler.runJob({
      name: "createLeaderboard", // the name of the job that we specified in addSchedulerJob() above
      cron: "0 0 * * *",
    });

    //generate the first post so users can click the hatch button
    const { reddit, ui } = context;
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

//for dev purposes clear the hset when too many have been generated
Devvit.addMenuItem({
  label: "Nuke",
  location: "subreddit",
  onPress: async (_, context) => {
    const { ui, redis } = context;
    //remove all entries
    redis.del("preFitness");
    ui.showToast(`Nuked the population 😢`);
  },
});

Devvit.addSchedulerJob({
  name: "createLeaderboard",
  onRun: async (_, context) => {
    handleLeaderboardGeneration(context);
  },
});

//
const handleLeaderboardGeneration = async (context: JobContext) => {
  const { redis, reddit } = context;

  //clear the leaderboard from last day
  await redis.del("population");
  console.log("Cleared yesterday's leaderboard");

  const postData = await redis.hGetAll("preFitness");

  if (!postData) {
    console.log("No posts found");
    return;
  }

  for (const [postId, gene] of Object.entries(postData)) {
    try {
      const post = await reddit.getPostById(postId);

      if (!post) {
        console.log(`Post ${postId} not found`);
        continue;
      }

      const likes = post.score || 0;
      const comments = post.numberOfComments || 0;

      // comments have higher weightage
      const score = likes * 2 + comments * 3;

      await redis.zAdd("population", { member: gene, score });
    } catch (error) {
      console.error(`Error processing post ${postId}:`, error);
    }
  }

  await redis.del("preFitness");
};

export default Devvit;
