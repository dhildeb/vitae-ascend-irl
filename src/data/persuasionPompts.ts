export interface PersuasionPrompt {
  text: string

  /*
   * Each inner array represents ONE audience concern.
   *
   * The scorer gives credit when the writer addresses the concern
   * using one or more related concepts.
   */
  audience: {
    concerns: string[][]
  }

  /*
   * Structural expectations for this particular scenario.
   */
  expected: {
    reasons: number
    counterargument: boolean
    consequences: number
  }
}

export const PERSUASION_PROMPTS: PersuasionPrompt[] = [
  // ─────────────────────────────────────────────
  // ADVENTURING PARTY
  // ─────────────────────────────────────────────

  {
    text:
      "Your party has found a mysterious door covered in magical runes. " +
      "Your companions want to open it immediately, but you believe it should remain sealed. " +
      "Convince the party what they should do.",

    audience: {
      concerns: [
        ["danger", "risk", "safe", "safety", "deadly", "trap"],
        ["treasure", "reward", "benefit", "gain", "valuable"],
        ["party", "companion", "group", "team", "together"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party has been offered a large reward to escort a wealthy merchant through dangerous territory. " +
      "You suspect the merchant is hiding something. " +
      "Convince your companions whether they should accept the job.",

    audience: {
      concerns: [
        ["gold", "money", "reward", "payment", "wealth"],
        ["danger", "risk", "safe", "safety", "death"],
        ["trust", "lie", "secret", "honest", "suspicious"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party has captured a goblin who claims to know where a legendary treasure is hidden. " +
      "Some companions want to kill it, while others want to interrogate it. " +
      "Convince the party what should be done.",

    audience: {
      concerns: [
        ["treasure", "gold", "reward", "wealth", "legendary"],
        ["information", "knowledge", "secret", "location", "learn"],
        ["danger", "risk", "trust", "betray", "trap"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party is exhausted after a difficult battle, but you have discovered a trail that may lead directly to the villain you have been hunting. " +
      "Convince your companions whether to pursue the trail immediately or rest first.",

    audience: {
      concerns: [
        ["tired", "exhausted", "rest", "recover", "health"],
        ["villain", "enemy", "escape", "trail", "pursue"],
        ["danger", "risk", "death", "injury", "safe"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party has only enough gold to purchase one magical item: a powerful weapon or an item that can heal the entire party. " +
      "Convince your companions which one they should choose.",

    audience: {
      concerns: [
        ["damage", "weapon", "attack", "power", "fight"],
        ["heal", "health", "injury", "survive", "protect"],
        ["gold", "money", "cost", "value", "worth"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  // ─────────────────────────────────────────────
  // TAVERN / SOCIAL
  // ─────────────────────────────────────────────

  {
    text:
      "The local tavern has banned adventurers from entering after too many fights. " +
      "Convince the tavern owner to make an exception for your party.",

    audience: {
      concerns: [
        ["fight", "violence", "trouble", "damage", "peace"],
        ["money", "gold", "business", "customers", "profit"],
        ["trust", "responsible", "respect", "promise", "behavior"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 1,
    },
  },

  {
    text:
      "You have accidentally destroyed part of a farmer's fence while fighting a monster. " +
      "You cannot afford to pay for the damage. " +
      "Convince the farmer to forgive you.",

    audience: {
      concerns: [
        ["fence", "farm", "damage", "repair", "property"],
        ["money", "gold", "cost", "payment", "afford"],
        ["trust", "sorry", "apology", "responsibility", "honest"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 1,
    },
  },

  {
    text:
      "A wealthy noble wants to hire your party, but the offered payment is insultingly low. " +
      "Convince the noble to substantially increase the reward.",

    audience: {
      concerns: [
        ["gold", "money", "wealth", "payment", "price", "cost"],
        ["value", "worth", "work", "danger", "effort"],
        ["reputation", "service", "quality", "reliable", "professional"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "The owner of a magical shop refuses to sell you an extremely powerful item because they believe adventurers cannot be trusted. " +
      "Convince them to sell it to you.",

    audience: {
      concerns: [
        ["trust", "honest", "reliable", "responsible", "promise"],
        ["danger", "magic", "power", "weapon", "harm"],
        ["money", "gold", "payment", "profit", "business"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  // ─────────────────────────────────────────────
  // LEADERSHIP
  // ─────────────────────────────────────────────

  {
    text:
      "Your party has just suffered a humiliating defeat. Everyone is discouraged and wants to abandon the quest. " +
      "Give a speech convincing them to continue.",

    audience: {
      concerns: [
        ["failure", "defeat", "lost", "failed", "mistake"],
        ["hope", "confidence", "believe", "courage", "strength"],
        ["goal", "quest", "mission", "purpose", "victory"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your adventuring party must choose between three dangerous routes to reach its destination. " +
      "You have incomplete information about each route. " +
      "Convince the party to trust your choice.",

    audience: {
      concerns: [
        ["danger", "risk", "safe", "safety", "deadly"],
        ["time", "fast", "quick", "delay", "journey"],
        ["trust", "evidence", "reason", "information", "knowledge"],
      ],
    },

    expected: {
      reasons: 3,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "You have been chosen to lead a group of inexperienced adventurers into a dangerous dungeon. " +
      "Convince them that they should trust your leadership.",

    audience: {
      concerns: [
        ["trust", "leader", "leadership", "reliable", "responsible"],
        ["danger", "safe", "safety", "protect", "survive"],
        ["experience", "knowledge", "skill", "prepared", "plan"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your town is about to be attacked by an army of monsters. " +
      "The townspeople are terrified and preparing to flee. " +
      "Give a speech convincing them to stay and defend their home.",

    audience: {
      concerns: [
        ["family", "home", "children", "loved", "community"],
        ["fear", "danger", "death", "safe", "survive"],
        ["defend", "fight", "protect", "together", "courage"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  // ─────────────────────────────────────────────
  // NEGOTIATION
  // ─────────────────────────────────────────────

  {
    text:
      "A dragon has blocked the only road through a mountain pass and demands a payment from every traveler. " +
      "Your party cannot afford the demanded price. " +
      "Convince the dragon to let you pass for less.",

    audience: {
      concerns: [
        ["gold", "treasure", "payment", "wealth", "rich"],
        ["respect", "power", "dragon", "pride", "honor"],
        ["benefit", "trade", "deal", "offer", "value"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "A merchant has the final healing potion in town, but knows you desperately need it and demands an outrageous price. " +
      "Convince the merchant to give you a fair deal.",

    audience: {
      concerns: [
        ["money", "gold", "profit", "price", "payment"],
        ["fair", "reasonable", "deal", "trade", "value"],
        ["potion", "heal", "health", "injury", "life"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "A rival adventuring party claims they discovered a treasure first and demands that you leave. " +
      "You believe you have an equal claim. " +
      "Convince them to share the treasure.",

    audience: {
      concerns: [
        ["treasure", "gold", "reward", "wealth"],
        ["fair", "equal", "justice", "claim", "deserve"],
        ["fight", "conflict", "danger", "peace", "cooperate"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  // ─────────────────────────────────────────────
  // MORAL / COMPLEX
  // ─────────────────────────────────────────────

  {
    text:
      "A kingdom is preparing to execute a captured enemy commander. " +
      "The ruler cares deeply about justice, fears another war, and desperately wants information about the enemy army. " +
      "You have one opportunity to address the ruler before the sentence is carried out. " +
      "Make your case for what should happen.",

    audience: {
      concerns: [
        ["justice", "fair", "law", "trial", "guilty"],
        ["war", "army", "battle", "enemy", "attack", "peace"],
        ["information", "secret", "knowledge", "learn", "reveal"],
      ],
    },

    expected: {
      reasons: 3,
      counterargument: true,
      consequences: 3,
    },
  },

  {
    text:
      "A thief steals food because their family is starving. " +
      "The law demands punishment, but you believe the circumstances matter. " +
      "Convince the local judge what should happen.",

    audience: {
      concerns: [
        ["law", "justice", "rule", "crime", "punishment"],
        ["family", "children", "starving", "food", "hunger"],
        ["mercy", "fair", "compassion", "circumstances", "forgive"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party discovers a powerful magical artifact that could save thousands of lives, " +
      "but using it would permanently destroy the memories of one innocent person. " +
      "Convince your companions what should be done.",

    audience: {
      concerns: [
        ["lives", "people", "save", "death", "thousands"],
        ["memory", "innocent", "victim", "person", "harm"],
        ["sacrifice", "moral", "right", "wrong", "ethics"],
      ],
    },

    expected: {
      reasons: 3,
      counterargument: true,
      consequences: 3,
    },
  },

  {
    text:
      "Your party can complete its quest quickly by abandoning a group of strangers who are trapped nearby. " +
      "Helping them will cost valuable time and may allow your enemy to escape. " +
      "Convince your companions what they should do.",

    audience: {
      concerns: [
        ["quest", "mission", "goal", "enemy", "escape"],
        ["people", "strangers", "save", "rescue", "help"],
        ["time", "delay", "risk", "cost", "consequence"],
      ],
    },

    expected: {
      reasons: 3,
      counterargument: true,
      consequences: 3,
    },
  },

  // ─────────────────────────────────────────────
  // FUN / UNEXPECTED
  // ─────────────────────────────────────────────

  {
    text:
      "A dragon claims that adventurers have unfairly ruined its reputation and demands that your party publicly apologize. " +
      "Convince the dragon why it should or should not receive an apology.",

    audience: {
      concerns: [
        ["reputation", "respect", "honor", "name", "image"],
        ["apology", "sorry", "wrong", "insult", "offense"],
        ["dragon", "power", "pride", "fear", "authority"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party discovers a mimic disguised as a treasure chest. " +
      "Instead of attacking it, you believe it could become a valuable companion. " +
      "Convince your companions to give the mimic a chance.",

    audience: {
      concerns: [
        ["danger", "attack", "eat", "kill", "threat"],
        ["companion", "friend", "ally", "team", "loyal"],
        ["benefit", "useful", "help", "valuable", "advantage"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 2,
    },
  },

  {
    text:
      "Your party's wizard insists that wearing a ridiculous wizard hat makes them more powerful. " +
      "Nobody believes them. " +
      "Convince the party that the hat really is essential equipment.",

    audience: {
      concerns: [
        ["magic", "power", "spell", "wizard", "ability"],
        ["danger", "battle", "fight", "survive", "protect"],
        ["hat", "equipment", "useful", "essential", "benefit"],
      ],
    },

    expected: {
      reasons: 2,
      counterargument: true,
      consequences: 1,
    },
  },
]