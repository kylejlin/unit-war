# Unit War

A simple experiment to evaluate the effectiveness of random play in random non-perfect information games.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Background

Unit War is a game I created in hopes of convincing a friend that playing Texas Hold'em randomly was not the optimal strategy against a professional.

### Unit War Rules

> Unless otherwise specified, the term "number" refers to a [real number](https://en.wikipedia.org/wiki/Real_number).

Unit War is played between two players.
Each player starts off with 0 monetary units.

1. Select a number on the interval `[0, 1]` to use as the _ante_.
2. Select a number of _hands_ to play.
3. For each hand:
   1. Randomly select one player to be the _leader_.
   2. The other player is the _follower_.
   3. Each player is assigned a randomly selected number from the interval `[0, 1]`. This number is referred to as the player's _strength_. Each player only knows their own strength, and does not know their opponent's strength.
   4. The leader must make an _initial bet_ on the interval `[ante, 1]`. The leader announces their initial bet to the follower.
   5. The follower can either _fold_ (see Folding) or place a _following bet_ on the interval `[initial bet, 1]`. If the following bet equals the initial bet, the players _showdown_ using the initial bet (see Showdown). Otherwise, proceed to the next step.
   6. The leader can either _call_ the following bet, or fold (see Folding). If the leader calls, the players showdown with the following bet (see Showdown).
   7. **Folding:** If a player folds, the current hand ends immediately. Money is awarded as follows:
      1. If the follower folds, the follower loses `ante` monetary units, and the leader gains `ante` monetary units.
      2. If the leader folds, the leader loses `initial bet` monetary units, and the follower gains `initial bet` monetary units.
   8. **Showdown**: If the players showdown using a bet `b`, the current hand ends immediately. Each player reveals their strength. Money is awarded as follows:
      1. If both players have an equal strength, no money is awarded.
      2. If one player has a greater strength, then they are designated the _hand winner_. The other player is designated the _hand loser_.
         The hand winner gains `b` monetary units, and the hand loser loses `b` monetary units.

Once the specified number of hands have been played, the player with more money wins. If both players have the same amount of money, the game ends in a draw.

## Usage

1. Open [https://kylejlin.github.io/unit-war](https://kylejlin.github.io/unit-war) in your browser.
2. Click "Create agent"
   1. Configure the agent settings to your liking.
   2. Click "Create"
3. Repeat step (2) one or more times.
4. Click "Evaluate"
   1. Select the two agents you want to play against each other.
   2. Click "Start"

### Additional features

- Click "Play" to play against one of your agents (you can choose which one).
- Click "Graph" to view the policies of one of your agents (you can choose which one).
- Click "Train" to open the training menu.
  - Select the one agent to train, and a set of opponents to train it against.
  - Click "Start"
  - Wait for the training to complete. This may take a few minutes.
  - After the agent has been trained, the agent will hopefully perform better against those opponents it was trained against. However, it's possible for the training to have no effect, or even _worsen_ the agent's performance.
  - Not all agents are trainable (see [Agents](#agents)). Training non-trainable agents is a no-op.
  - You can tune the training hyperparameters by clicking "Options" on the main menu.

### How to read evaluations

An evaluation is displayed as a reward and a performance rating.

For evaluating agent A against agent B, the equations for agent A's reward and performance are as follows:

```
agentAReward = (agentAMoney - agentBMoney) / 2

agentAPerformance = (agentAReward + handsPlayed) / (2 * handsPlayed)
```

...where `agentAMoney` and `agentBMoney` represent the amounts of money each agent has at the end of the game, and `handsPlayed` represents the number of hands played that game.

If you're wondering how to interpret the performance rating, it is just a metric that represents how well the agent did in terms of earning reward/money, where `0.0` means the agent lost the maximum bet every hand, and `1.0` means the agent won the maximum bet every hand.

### Agents

Below is a list of agents and their betting policies:

- Artichoke - Bets determined by two neural networks (one for leading and one for following). The networks both have one hidden layer.
- Broccoli - Makes uniformly random bets.
- Carrot - Makes bets exactly equal to its strength.
- Daikon - Makes a constant bet (configurable by user).
- Eggplant - Slightly adjusted version of Carrot. See [src/agents/eggplant.ts](./src/agents/eggplant.ts) for more details.
- Fig - A variation of Artichoke that trains its networks independently (Artichoke trains its networks sequentially, so updates in the first network would affect the training of the second network).
- Grape - A variation of Fig that normalizes its inputs around a mean of `0`.
- Habanero - A variation of Grape that uses the sigmoid activation function in its hidden layer instead of ReLU.

Agent source code can be found in [src/agents](./src/agents/).

Feel free to add your own agents and open a pull request.
Please adhere to the alphabetical vegetable naming convention.

## License

MIT

Copyright (c) 2020 Kyle Lin
