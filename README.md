Gene code - 35 bits

Flow of the app

- on install a initial population and score is introduced
- on every post the fittest parents are found, new gene created through crossover and mutation
- the new gene is used to create a base64 image with the gene-engine
- the new image is stored in the media against the postId
- the gene is stored in the prefitness hashset

- at every 24 hours a cronjob runs to calculate a fitness value and generates a zset to create a leaderboard that will be used the next day
