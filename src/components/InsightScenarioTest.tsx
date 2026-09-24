import { useMemo, useRef, useState } from 'react'

interface ScenarioOption {
  text: string
  score: number // 0-4, judgment quality — never shown in the UI
}

interface ScenarioStage {
  text: string
  options: ScenarioOption[]
}

interface ScenarioTemplate extends ScenarioStage {
  // Optional second stage: new information arrives after the initial judgment.
  // Not every scenario needs one — some should confirm, weaken, or reverse the
  // first read rather than "the second paragraph always has the real answer."
  followUp?: ScenarioStage
}

type Confidence = 'low' | 'medium' | 'high'

const BANK: ScenarioTemplate[] = [
  {
    text: `A caravan master asks your party to escort a sealed chest through a mountain pass. He explains that the contents are valuable but ordinary trade goods, and offers a generous bonus if the chest arrives unopened. His papers are legitimate, his guards appear experienced, and he has used the same route for years. During a rest, however, one guard quietly asks whether your party has ever dealt with customs officials in the next city. When questioned, the caravan master says the guard is merely new and nervous. What is the most reasonable conclusion?`,
    options: [
      { text: `The chest is probably harmless because the caravan has legitimate papers, an established route, and experienced guards who have no obvious reason to deceive you`, score: 1 },
      { text: `The guard's question suggests the caravan may be anticipating a customs problem, but that alone does not establish what is inside; the important uncertainty is what the master has not disclosed`, score: 4 },
      { text: `The master is almost certainly smuggling something because legitimate merchants would have no reason to offer extra money for keeping ordinary trade goods sealed`, score: 0 },
      { text: `The guard is probably planning to betray the master because asking about customs officials is an unusual question for someone who is supposedly inexperienced`, score: 1 },
    ],
  },

  {
    text: `A village healer asks your party to investigate several people who became sick after drinking from the same spring. The villagers blame a witch who recently moved nearby. The healer privately agrees that the witch is suspicious but points out that the first illness occurred shortly after a new stone drainage channel was built upstream. The channel was inspected and appears structurally sound. A farmer insists his family drank from the spring for decades without trouble. What should receive the greatest weight?`,
    options: [
      { text: `The witch's recent arrival deserves the most attention because unexplained illness beginning after a stranger arrives is a meaningful circumstantial connection`, score: 1 },
      { text: `The farmer's long history with the spring largely rules out contamination because a dangerous water source would probably have harmed people before now`, score: 1 },
      { text: `The timing of the new drainage channel provides a more direct causal lead than the witch's presence, even though it does not yet prove contamination`, score: 4 },
      { text: `The healer's suspicion should carry the most weight because she understands local illnesses and has already considered the supernatural explanation`, score: 2 },
    ],
  },

  {
    text: `A noble offers your party a contract to protect a remote estate for three weeks. He explains that bandits have recently threatened the region and emphasizes that your safety is his primary concern. The contract pays unusually well and allows you to inspect the grounds beforehand. During the inspection, you learn that the estate's normal guards were dismissed two days ago, the nearby villagers have been warned not to approach the property, and the noble insists that the contract begin immediately. He provides reasonable explanations for each point. What is the strongest concern?`,
    options: [
      { text: `The high payment is the clearest warning because wealthy employers rarely offer substantially more than the normal rate unless they expect extraordinary danger`, score: 2 },
      { text: `The dismissed guards and restricted villagers suggest the noble is concealing something, making the contract too suspicious to accept regardless of his explanations`, score: 2 },
      { text: `The individual explanations may each be reasonable, but their combination suggests the party is being asked to enter a situation whose relevant information is being selectively controlled`, score: 4 },
      { text: `The immediate start is probably the main problem because a legitimate employer should always allow adventurers several days to prepare before accepting a dangerous contract`, score: 1 },
    ],
  },

  {
    text: `Your party finds a wounded scout beside a road. He claims a group of raiders attacked his patrol and says three companions were captured. He correctly identifies the patrol's commander, knows the patrol's normal route, and carries an official insignia. He asks you to follow a trail leading into the forest before the raiders have time to move the prisoners. One detail bothers you: despite claiming to have fled through thick undergrowth while wounded, his clothing has almost no fresh tears or debris. What is the wisest interpretation?`,
    options: [
      { text: `The clothing discrepancy is probably decisive evidence that he staged the attack, because someone fleeing through thick forest should necessarily have visible damage`, score: 1 },
      { text: `His knowledge and insignia make the story credible overall, so the clothing should be ignored unless stronger evidence directly contradicts the account`, score: 2 },
      { text: `The clothing is an inconsistency worth investigating, but it should lower confidence rather than automatically overturn otherwise independent evidence supporting his identity`, score: 4 },
      { text: `The most likely explanation is that he was helped through the forest by an accomplice, meaning the party should assume an ambush is waiting at the end of the trail`, score: 1 },
    ],
  },

  {
    text: `A town council hires your party to recover stolen grain. The council claims a nearby clan of hunters is responsible because several clan members were seen near the granary on the night of the theft. The hunters deny it and explain that they were following deer tracks. The stolen grain is later discovered in a barn belonging to a respected merchant who publicly supported the council's reelection. The merchant claims an employee must have hidden it there without his knowledge. What should you conclude?`,
    options: [
      { text: `The hunters remain the strongest suspects because their presence near the granary occurred before the grain disappeared and therefore has a more direct connection to the theft`, score: 1 },
      { text: `The merchant is certainly responsible because stolen goods being found on someone's property is sufficient to establish that the property owner knew about them`, score: 1 },
      { text: `The discovery substantially changes the evidence, but possession of the grain still requires investigation into access, knowledge, and alternative explanations before assigning responsibility`, score: 4 },
      { text: `The council probably framed the merchant because political supporters frequently become involved in local corruption when valuable resources are being distributed`, score: 1 },
    ],
  },

  {
    text: `A wizard asks your party to retrieve a particular book from a ruined library. She says the book contains dangerous knowledge and insists that nobody read it. She provides an unusually detailed description of the shelf where it should be found and warns you that the ruin may contain traps. When you arrive, the book is exactly where she predicted, but another scholar's notes beside it describe the same book as a harmless agricultural treatise. The wizard dismisses the notes as unreliable without reading them. What is the most justified response?`,
    options: [
      { text: `Trust the wizard because accurately predicting the book's location demonstrates knowledge of the library that an ordinary manipulator would be unlikely to possess`, score: 2 },
      { text: `Assume the scholar is correct because written notes created closer to the original source are inherently more reliable than information provided by someone commissioning the mission`, score: 2 },
      { text: `Recognize that the wizard's warning may be legitimate while still checking the competing evidence, because accurate knowledge of location does not establish the claimed danger`, score: 4 },
      { text: `Assume the wizard wants the book for herself because refusing to explain the danger while demanding that others avoid reading it is inherently deceptive`, score: 1 },
    ],
  },

  {
    text: `A merchant's apprentice reports that his employer has been stealing wages from workers. He gives you account records showing several payments that appear to be missing. The merchant produces a second set of records and says the apprentice altered the first set after being fired for theft. Both records look authentic. A worker confirms that wages were sometimes late but says the merchant eventually paid everything owed. The apprentice becomes angry when asked about the possibility of an accounting error. What matters most before deciding who is lying?`,
    options: [
      { text: `The apprentice's anger is important because an innocent person would normally remain calm when presenting evidence of wrongdoing`, score: 1 },
      { text: `The worker's testimony should settle the issue because employees personally receiving wages are better positioned than outsiders to know whether money was actually stolen`, score: 2 },
      { text: `The conflicting records need to be independently reconciled against transactions or payment evidence, because neither person's confidence establishes which accounting trail is accurate`, score: 4 },
      { text: `The merchant's accusation of theft is probably retaliatory because employers commonly accuse dissatisfied workers of dishonesty when financial misconduct is discovered`, score: 1 },
    ],
  },

  {
    text: `Your party is asked to judge a dispute between two adventuring groups over a discovered ruin. One group has a written map dated six months earlier. The other has a witness who says they found the entrance three weeks ago. The map shows the entrance in roughly the same place but labels the ruin as collapsed. The witness insists the first group must have copied their discovery because the map was never shown to anyone. Both groups accuse the other of lying. What is the strongest inference?`,
    options: [
      { text: `The dated map proves the first group knew about the ruin before the witness did, so their claim of independent discovery should be rejected`, score: 2 },
      { text: `The witness's recent discovery is more persuasive because the ruin's current state matters more than a map that describes conditions from six months earlier`, score: 2 },
      { text: `The evidence establishes prior knowledge of the location but not necessarily knowledge of the accessible ruin, so the exact meaning of "discovery" remains the disputed issue`, score: 4 },
      { text: `The groups probably discovered the ruin independently because the map and witness describe slightly different versions of the same location`, score: 1 },
    ],
  },

  {
    text: `A guard captain tells you that a prisoner attempted escape at midnight. Three guards independently say they heard shouting and saw the prisoner near the outer gate. The prisoner claims the guards attacked him after he refused to sign a confession. You notice that all three guards use nearly identical wording when describing the event, including an unusual phrase none of them normally uses. The captain says this merely proves they coordinated their testimony clearly. What should you infer?`,
    options: [
      { text: `The identical wording proves the guards rehearsed a false story because truthful witnesses would never describe the same event using similar language`, score: 1 },
      { text: `The identical wording is not proof of fabrication, but it reduces the independence of the three accounts and means they should not be treated as three separate confirmations`, score: 4 },
      { text: `The captain is probably telling the truth because coordinating testimony after an incident is a normal way for guards to prevent contradictory memories`, score: 2 },
      { text: `The prisoner's account should now be accepted because evidence that witnesses discussed their testimony makes every part of their statements unreliable`, score: 1 },
    ],
  },

  {
    text: `A respected innkeeper warns travelers that a particular road is unsafe after sunset. He points to several recent robberies recorded by the town watch. A competing innkeeper says the road is perfectly safe and claims the first innkeeper is spreading fear to attract customers who stay in his establishment instead. You discover that the first innkeeper's records show fewer guests using the road at night since his warning began, while the watch confirms that robberies really did increase. What is the most careful conclusion?`,
    options: [
      { text: `The first innkeeper is probably manipulating travelers because his warning directly benefits his business even though the robberies themselves are genuine`, score: 2 },
      { text: `The second innkeeper is probably lying because official robbery records support the first innkeeper's warning and contradict his claim that the road is safe`, score: 1 },
      { text: `The robberies provide evidence that the warning has a factual basis, while the innkeeper's financial incentive remains relevant to how confidently his motives should be interpreted`, score: 4 },
      { text: `The increase in robberies proves the road became dangerous because of the first innkeeper's warning, since fewer travelers now use it and criminals have fewer witnesses`, score: 0 },
    ],
  },

  {
    text: `A village elder asks you to remove a statue from the town square because she believes it brings misfortune. Over the last month, three businesses near the statue have failed. The statue was erected shortly before the failures. A young carpenter argues that the failures are caused by a new trade route that bypasses the village. The elder points out that the carpenter has recently built a workshop on that route and therefore has an obvious financial motive. What is the best way to reason about the disagreement?`,
    options: [
      { text: `The elder's motive is less important than the timing, because the statue predating several failures is concrete evidence while the carpenter's financial interest is circumstantial`, score: 2 },
      { text: `The carpenter's motive makes his economic explanation unreliable, so the supernatural explanation should receive greater weight until he can prove he has no financial interest`, score: 1 },
      { text: `Both explanations contain potentially relevant information, but the strongest test is whether the failures correlate with the trade change or with exposure to the statue rather than who benefits from either explanation`, score: 4 },
      { text: `The statue should be removed temporarily because doing so is harmless and would test the elder's theory while avoiding the need to determine which explanation is objectively correct`, score: 2 },
    ],
  },

  {
    text: `A scout reports seeing an army moving toward your town. She gives the exact number of soldiers, describes their banners, and says they marched silently during the night. Another scout reports seeing campfires in the same direction but estimates a much smaller force. A farmer reports hearing hundreds of horses. Later, you discover that the army is known to use illusion magic. What should you do with the conflicting reports?`,
    options: [
      { text: `Trust the first scout because precise numbers and banners indicate she observed the force directly rather than relying on rumor`, score: 1 },
      { text: `Trust the farmer because hearing hundreds of horses provides physical evidence that is less vulnerable to illusion than visual observation`, score: 2 },
      { text: `Treat the reports as evidence of a possible military presence while lowering confidence in exact numbers and appearance because the known illusion capability affects the reliability of those observations`, score: 4 },
      { text: `Reject all reports because the possibility of illusion means nobody can establish whether an army is actually present until direct combat occurs`, score: 1 },
    ],
  },

  {
    text: `A noblewoman asks your party to escort her through a city. She says a political rival has threatened her life. During the journey, she repeatedly chooses crowded streets instead of secluded ones and insists that you remain visible to witnesses. She also refuses to tell you which rival she fears. At one point she quietly changes the route after seeing a particular official. When asked why, she says she simply dislikes him. What is the most reasonable interpretation?`,
    options: [
      { text: `She is probably inventing the threat because someone genuinely fearing assassination would avoid crowds and explain exactly who is threatening them`, score: 1 },
      { text: `Her behavior suggests she has a concrete reason to avoid certain people or places, but the evidence does not establish whether she is protecting herself from an assassin, avoiding political exposure, or hiding another concern`, score: 4 },
      { text: `The official she avoided is almost certainly the person threatening her because changing the route immediately after seeing him is stronger evidence than her refusal to identify the rival`, score: 1 },
      { text: `She is probably using the party as political protection because remaining visible and refusing to explain her enemies indicates that the real purpose is intimidation rather than personal safety`, score: 1 },
    ],
  },

  {
    text: `A ranger tells you that wolves have become unusually aggressive near a forest settlement. Villagers report attacks on livestock and insist the wolves are being controlled by a druid. You find several carcasses with wounds that resemble wolf bites. Deeper in the forest, you discover the remains of an illegal logging camp and several discarded containers of an unknown substance. The ranger says the substance is irrelevant because wolves have always lived there. What should receive the most attention?`,
    options: [
      { text: `The bite wounds should settle the issue because they demonstrate that wolves are responsible for the attacks regardless of why their behavior changed`, score: 1 },
      { text: `The druid theory deserves serious consideration because unusually coordinated animal behavior is difficult to explain through ordinary changes in the environment`, score: 1 },
      { text: `The abandoned logging camp and unknown substance provide a new causal possibility that directly connects human activity with a recent behavioral change and therefore merits investigation`, score: 4 },
      { text: `The ranger's experience should outweigh the villagers because long-term familiarity with the forest makes his judgment more reliable than observations from frightened residents`, score: 2 },
    ],
  },

  {
    text: `A captain asks your party to arrest a merchant accused of selling weapons to rebels. The evidence is a ledger containing several suspicious payments and a courier who claims the merchant ordered the shipments. The merchant admits knowing the courier but says the payments were for legal supplies. You discover that the courier was arrested carrying forged documents in an unrelated investigation. The captain says this does not matter because the ledger is independent evidence. What should you examine next?`,
    options: [
      { text: `The merchant's explanation should be rejected because people accused of serious crimes commonly invent innocent explanations once they realize investigators have evidence`, score: 1 },
      { text: `The forged documents make the courier completely unreliable, so the ledger should be treated as proof without considering the courier's testimony further`, score: 1 },
      { text: `The ledger should be authenticated and its entries independently connected to the alleged shipments, because the courier's credibility and the meaning of the ledger are separate questions`, score: 4 },
      { text: `The captain's confidence suggests the investigation has already established sufficient evidence, so further examination would risk allowing the merchant to destroy records or escape`, score: 1 },
    ],
  },

  {
    text: `A traveler offers your party a map of a dangerous swamp. He claims he drew it himself while searching for his missing brother. The map contains several accurate landmarks, but one bridge is marked where you know no bridge exists. The traveler says the bridge may have collapsed recently. A local guide says there has never been a bridge there, but admits she has not visited that part of the swamp in years. What should you infer?`,
    options: [
      { text: `The map is probably fraudulent because a single false landmark undermines confidence in the entire document and suggests the traveler invented his story`, score: 1 },
      { text: `The map should be trusted because several accurate landmarks demonstrate that the traveler genuinely explored the swamp and therefore probably knows the route`, score: 2 },
      { text: `The map contains useful but imperfect information; the false bridge should be treated as an unresolved discrepancy rather than allowing either one error or several correct details to settle its overall reliability`, score: 4 },
      { text: `The local guide should be trusted because long familiarity with the region is more reliable than a recently produced map created by someone with an emotional reason to search for a missing person`, score: 1 },
    ],
  },

  {
    text: `A temple asks you to investigate why its offerings have been disappearing. The priest suspects thieves because only valuable offerings vanish. A novice suspects a supernatural spirit because several candles extinguish shortly before each disappearance. You discover that the offerings are stored beside a poorly sealed ventilation shaft, and the temple's night watchman is the only person with a key to the room. The watchman has a clean record and seems genuinely offended by the suspicion. What is the strongest next step?`,
    options: [
      { text: `Investigate the watchman first because exclusive access makes him the most obvious suspect, regardless of his clean record or emotional reaction`, score: 2 },
      { text: `Investigate the ventilation shaft and physical access patterns because the observed disappearances may have a mundane mechanism that does not require assuming either theft by the watchman or supernatural involvement`, score: 4 },
      { text: `Investigate the candles because their repeated extinguishing is a distinctive pattern that ordinary explanations do not adequately account for`, score: 1 },
      { text: `Accept the priest's theft theory because valuable offerings disappearing selectively is stronger evidence than the novice's interpretation of candle behavior`, score: 1 },
    ],
  },

  {
    text: `Your party is deciding whether to cross a frozen lake. A local fisherman says the ice is safe because he crossed it yesterday. Another fisherman says the ice is unsafe because two days ago he heard cracking near the eastern shore. You observe that the temperature has risen substantially since yesterday, and several patches of snow have melted. The first fisherman says the weather is irrelevant because the lake froze thickly this winter. What should matter most?`,
    options: [
      { text: `The first fisherman's recent crossing is strongest because direct experience on the lake provides more relevant evidence than a general concern about changing weather`, score: 2 },
      { text: `The second fisherman's warning is strongest because hearing cracking is direct evidence of unstable ice and should outweigh observations that do not involve actual crossings`, score: 2 },
      { text: `The current conditions matter more than either historical crossing because ice safety can change rapidly, making yesterday's successful crossing weak evidence for today's conditions`, score: 4 },
      { text: `The winter's thick ice should dominate the decision because substantial seasonal thickness makes short-term temperature changes unlikely to alter the lake's overall safety`, score: 1 },
    ],
  },

  {
    text: `A captain reports that one of your party members has been secretly meeting with an enemy agent. The captain shows you a witness statement and says the meetings occurred three times. Your companion admits meeting the person but says they were exchanging information intended to protect the town. The witness is a rival adventurer who has previously argued with your companion. The captain says the rival's motive is irrelevant because the meetings themselves are confirmed. What distinction is most important?`,
    options: [
      { text: `The rival's hostility makes the testimony too biased to consider because a person with a personal dispute cannot provide reliable evidence`, score: 1 },
      { text: `The meetings being confirmed establishes that contact occurred, but it does not by itself establish the purpose of the contact, which is the central unresolved question`, score: 4 },
      { text: `Your companion's explanation should be accepted because admitting the meetings voluntarily is evidence that they have nothing important to hide`, score: 2 },
      { text: `The captain is probably correct because secret meetings with an enemy agent are inherently suspicious and require no additional evidence about what was discussed`, score: 1 },
    ],
  },

  {
    text: `A wealthy patron asks your party to recover a stolen painting. She gives you a detailed description of the thief and says the painting has enormous sentimental value. Her servants confirm the theft occurred. At an auction, you find a painting matching her description being sold by a collector who claims to have bought it legally from an estate. The patron immediately demands that you seize it. The collector produces a purchase receipt dated before the alleged theft. What is the most appropriate conclusion?`,
    options: [
      { text: `The collector is probably lying because a genuine owner would be able to identify a stolen painting more convincingly than someone relying on a receipt`, score: 1 },
      { text: `The patron's identification should settle the issue because sentimental owners are uniquely capable of recognizing their own possessions even when documentation conflicts`, score: 1 },
      { text: `The competing claims require establishing provenance and ownership history rather than treating recognition, urgency, or a single receipt as automatically decisive`, score: 4 },
      { text: `The collector's receipt proves the painting cannot be stolen because documentation of a purchase establishes legitimate ownership regardless of when or from whom it was acquired`, score: 1 },
    ],
  },

  {
    text: `A healer recommends that your party avoid a certain mushroom because three people became ill after eating it. A druid says the mushroom is harmless and claims the illness was caused by spoiled meat served at the same meal. You learn that all three sick people ate the mushroom, but only one ate the meat. The healer points out that the three victims also shared the same drinking water. What is the strongest inference?`,
    options: [
      { text: `The mushroom is the most likely cause because every sick person consumed it while the other proposed causes do not account for all three cases`, score: 2 },
      { text: `The water is the most likely cause because all three victims shared it and therefore it provides the broadest common exposure`, score: 2 },
      { text: `The mushroom hypothesis has stronger support than the meat explanation, but the shared water remains a competing exposure that prevents the evidence from establishing causation by itself`, score: 4 },
      { text: `The druid's explanation should be rejected because the fact that one healthy person ate the meat makes spoiled meat an impossible cause of illness`, score: 1 },
    ],
  },

  {
    text: `A merchant asks your party to deliver a message to a distant city. He gives you a sealed letter and says it concerns a routine business dispute. He offers to pay extra if you arrive within two days. Along the road, a guard recognizes the seal and quietly tells you that the merchant has recently been involved in a legal dispute with the city magistrate. The merchant later sends a messenger asking whether you opened the letter. What should you make of this?`,
    options: [
      { text: `The merchant is probably involved in criminal activity because unusually high urgency combined with concern about the letter being opened is inconsistent with routine business`, score: 2 },
      { text: `The letter is probably harmless because the merchant trusted the party enough to carry it rather than sending a professional courier under his own name`, score: 1 },
      { text: `The circumstances justify increased caution about the letter's importance, but they do not establish its contents or the merchant's purpose without additional evidence`, score: 4 },
      { text: `The guard's information proves the letter concerns the magistrate because the merchant's legal dispute provides an obvious motive for sending a secret message`, score: 1 },
    ],
  },

  {
    text: `A village repeatedly loses livestock near the same stretch of road. Several farmers blame a large predator because tracks resembling those of a bear have been found nearby. A hunter points out that the tracks are unusually shallow and lack claw marks. Another farmer says the animals were probably killed by a monster because the wounds are too clean for a normal predator. You find that every carcass was left beside a fence with a broken section. What should you investigate first?`,
    options: [
      { text: `The monster theory, because unusually clean wounds and repeated attacks indicate a predator unlike any ordinary animal known in the region`, score: 1 },
      { text: `The bear theory, because repeated tracks near the attacks provide direct physical evidence even if individual details about the tracks are imperfect`, score: 2 },
      { text: `The broken fence sections, because they offer a repeatable physical connection between the locations of the attacks and a possible means of access`, score: 4 },
      { text: `The hunter's expertise, because his familiarity with animal tracks makes his interpretation more reliable than observations made by frightened farmers`, score: 2 },
    ],
  },

  {
    text: `A soldier returns from a battle claiming the enemy commander was killed. He provides the commander's distinctive sword as proof. Another soldier says the commander survived and was seen retreating. The first soldier explains that the second soldier was injured and confused during the battle. You later learn that the sword was taken from the commander's tent before the battle ended, but nobody knows who carried it afterward. What should happen to your confidence in the first report?`,
    options: [
      { text: `It should remain high because possession of the commander's distinctive sword is strong physical evidence even if its exact chain of possession is uncertain`, score: 1 },
      { text: `It should fall substantially because the sword no longer establishes that the first soldier personally witnessed the commander's death or even obtained it after the battle`, score: 4 },
      { text: `It should remain unchanged because the second soldier's injury makes his testimony unreliable regardless of what happened to the sword`, score: 1 },
      { text: `It should reverse entirely in favor of the second soldier because evidence discovered to be ambiguous cannot contribute to either explanation`, score: 1 },
    ],
  },

  {
    text: `A town's crime rate appears to double after a new watch captain takes office. The mayor blames the captain for being ineffective. The captain says the increase reflects better reporting because residents now trust the watch enough to report crimes. You examine records and discover that the number of reported minor thefts increased sharply, while reported violent crimes remained nearly unchanged. What is the most careful interpretation?`,
    options: [
      { text: `The captain is probably responsible because a sudden increase in recorded crime after a leadership change is evidence that the watch has become less effective`, score: 1 },
      { text: `The mayor is probably correct because violent crimes remaining stable means the increase in minor theft reports cannot be explained by improved reporting`, score: 2 },
      { text: `The statistics show an increase in recorded incidents, but the change in reporting behavior means they cannot by themselves establish that the underlying crime rate doubled`, score: 4 },
      { text: `The captain's explanation should be accepted because whenever reported crime increases after a leadership change, improved reporting is the most likely explanation`, score: 2 },
    ],
  },

  {
    text: `A wizard offers to remove a curse from one member of your party. She explains that the ritual is safe but will temporarily make the target forget one day of recent memories. She has successfully performed the ritual many times. A second wizard warns that the procedure can permanently erase memories if interrupted. The first wizard says the second wizard is merely jealous. The second wizard admits they have never personally seen the ritual fail. What is the most important consideration?`,
    options: [
      { text: `The first wizard's experience should settle the matter because repeated successful use is stronger evidence than a theoretical risk described by someone without firsthand experience`, score: 2 },
      { text: `The second wizard's warning should be accepted because any possibility of permanent memory loss makes the ritual too dangerous to consider`, score: 1 },
      { text: `The decision depends on the severity of the curse, the frequency and consequences of interruption, and the reliability of evidence about the ritual's failure mode rather than either wizard's personal dispute`, score: 4 },
      { text: `The first wizard is probably trustworthy because openly acknowledging temporary memory loss demonstrates that she is being transparent about the ritual's risks`, score: 2 },
    ],
  },

  {
    text: `A group of villagers asks your party to escort them through monster territory. They insist that the safest route is along a particular road because their elders have used it for generations. A scout suggests a newer trail through the hills because monster tracks are rarer there. The villagers object that the hills contain dangerous cliffs. When you inspect the road, you find recent monster tracks but no signs of attacks. The hill trail has no monster tracks but shows several fresh human footprints. What should you consider?`,
    options: [
      { text: `The traditional road is safer because the villagers' generations of experience outweigh the possibility that recent tracks indicate danger without actual attacks`, score: 1 },
      { text: `The hill trail is safer because the absence of monster tracks is direct evidence that monsters do not use it even though humans have recently traveled there`, score: 2 },
      { text: `Neither route can be judged from one indicator alone; monster presence, terrain hazards, recent human activity, and the villagers' experience all represent different kinds of risk`, score: 4 },
      { text: `The villagers are probably hiding something because their refusal to use the hill trail despite fewer monster tracks suggests they know about a danger they do not want to reveal`, score: 1 },
    ],
  },

  {
    text: `A respected judge asks your party to testify about a fight you witnessed in a tavern. One participant struck first according to your memory, but the room was crowded and the fight lasted only seconds. Another witness confidently says the opposite. A third witness agrees with you but admits they were looking away immediately before the first blow. The judge asks which witness is "most credible." What is the best response?`,
    options: [
      { text: `Your own memory should receive the most weight because firsthand observation is inherently more reliable than another person's conflicting recollection`, score: 2 },
      { text: `The confident witness should receive the most weight because confidence is useful evidence when two people remember the same event differently`, score: 1 },
      { text: `The testimony should be separated into what each witness actually observed, because confidence and agreement do not compensate for limited visibility at the crucial moment`, score: 4 },
      { text: `The third witness should be preferred because admitting uncertainty is strong evidence that the rest of their testimony is honest`, score: 2 },
    ],
  },

  {
    text: `A mining company claims that a nearby river became cloudy because of an unusually heavy spring flood. A group of villagers claims the mine is dumping waste. You observe that the river is clear upstream and cloudy downstream from the mine. The company produces records showing that its waste system passed inspection two months ago. The villagers produce photographs showing cloudy water but cannot identify when the photographs were taken. What should receive the greatest weight?`,
    options: [
      { text: `The inspection records should settle the dispute because an officially approved waste system demonstrates that the mine was operating within acceptable limits`, score: 2 },
      { text: `The photographs should settle the dispute because visual evidence of cloudy water is more direct than technical records about a waste system`, score: 1 },
      { text: `The upstream/downstream difference provides a meaningful clue about a localized source, but establishing causation still requires determining whether the mine released anything capable of producing the observed change`, score: 4 },
      { text: `The flood explanation is most reasonable because natural flooding is common and the mine's recent inspection provides evidence against deliberate contamination`, score: 1 },
    ],
  },

  {
    text: `A prisoner tells your party that the dungeon's western wall contains a secret passage. He gives precise directions and correctly identifies several guards' routines. He asks for nothing except that you leave the dungeon without him. A guard captain says the prisoner is manipulating you because he has attempted escape before. When you inspect the wall, you find evidence that stones have recently been moved. The captain says the prisoner probably created the evidence himself. What should you conclude?`,
    options: [
      { text: `The prisoner is probably truthful because providing information that can be independently checked is strong evidence that he is not simply trying to manipulate the party`, score: 2 },
      { text: `The captain is probably truthful because a prisoner with a history of escape attempts has a clear motive to create a false opportunity`, score: 2 },
      { text: `The physical evidence supports the possibility of a passage, but neither the prisoner's motive nor the captain's accusation establishes whether the passage is genuine or safe to use`, score: 4 },
      { text: `The passage is probably a trap because both the prisoner's history and the newly moved stones suggest deliberate preparation for an escape attempt`, score: 1 },
    ],
  },

  {
    text: `A guild offers your party a contract to investigate thefts from its warehouse. The guildmaster says the losses are becoming serious and insists that an employee must be responsible. You discover that the warehouse inventory system was changed three weeks before the losses increased. The guildmaster says the change merely modernized the records. An accountant privately says the new system is difficult to audit but refuses to accuse anyone. What deserves attention first?`,
    options: [
      { text: `The employees deserve investigation because theft from a warehouse normally requires someone with physical access and opportunity to remove the goods`, score: 2 },
      { text: `The guildmaster should be treated as the main suspect because he controls the inventory system and therefore has the greatest opportunity to manipulate the records`, score: 1 },
      { text: `The change in recordkeeping is an important alternative explanation because apparent losses may result from accounting errors rather than physical theft, and it can be tested independently`, score: 4 },
      { text: `The accountant should be questioned aggressively because refusing to accuse anyone despite recognizing a problem suggests they are protecting the person responsible`, score: 1 },
    ],
  },

  {
    text: `A traveler warns your party not to enter a particular valley because "people disappear there." He describes three disappearances in detail. A local priest confirms that three travelers have indeed gone missing but says all three were last seen during winter storms. The traveler insists the storms are merely when the valley's curse becomes active. You learn that the valley contains several unmarked ravines and receives little traffic during winter. What is the strongest interpretation?`,
    options: [
      { text: `The curse remains plausible because three independent disappearances occurred in the same location and the traveler knows details that appear difficult to invent`, score: 1 },
      { text: `The priest's explanation is probably correct because winter storms provide an obvious natural explanation for people disappearing in an area with dangerous terrain`, score: 2 },
      { text: `The disappearances are real, but the evidence does not distinguish supernatural danger from ordinary environmental hazards, so the location is risky without proving the claimed cause`, score: 4 },
      { text: `The traveler is probably exploiting fear because describing disappearances in detail while refusing to accept natural explanations suggests a deliberate attempt to frighten outsiders`, score: 1 },
    ],
  },

  {
    text: `A commander tells your party that an approaching army is much larger than it appears because the enemy is using decoy camps. A scout disagrees and says the commander is exaggerating to justify requesting reinforcements. You inspect the valley and find numerous small fires, but many are arranged in places where soldiers would have difficulty defending themselves. You also find wagon tracks leading away from several camps. What should you infer?`,
    options: [
      { text: `The commander is probably exaggerating because poorly positioned camps and departing wagons suggest the visible force is smaller than reported`, score: 2 },
      { text: `The scout is probably correct because physical evidence of camps that cannot be defended makes the commander's claim about a large army implausible`, score: 2 },
      { text: `The evidence is consistent with deliberate decoys but does not establish their purpose or scale, so the appropriate conclusion is increased uncertainty about the visible camp count`, score: 4 },
      { text: `The camps must be genuine because wagon tracks demonstrate that supplies were delivered and therefore soldiers must have occupied the positions`, score: 1 },
    ],
  },

  {
    text: `A woman approaches your party claiming that her brother was imprisoned unjustly. She gives you his name, explains where he was arrested, and accurately describes the courthouse. She asks you to deliver a message to him. A clerk confirms the brother is imprisoned but says the woman has never visited him. The woman explains that she is afraid of being recognized by the guards. Later, you learn she and her brother have publicly argued for years. What is the most reasonable interpretation?`,
    options: [
      { text: `She is probably lying about caring about her brother because their public arguments and lack of prison visits contradict the emotional story she tells`, score: 1 },
      { text: `The clerk's statement proves she has no legitimate connection to the prisoner because a genuine relative would normally have visited the jail`, score: 1 },
      { text: `Her relationship with her brother may be complicated, but the available evidence does not establish her motive for contacting the party or whether his imprisonment was unjust`, score: 4 },
      { text: `The accurate courthouse details suggest she has secretly visited the prison before, making the clerk's statement evidence that the clerk is protecting someone`, score: 1 },
    ],
  },

  {
    text: `A merchant claims that a competitor has been poisoning his customers. He presents records showing that several customers became ill after purchasing his competitor's goods. The competitor argues that the illnesses were caused by a seasonal fever spreading through the city. A healer confirms that the symptoms match the fever but says some forms of poisoning can look similar. You discover that illness rates among customers of both merchants rose during the same week. What should you conclude?`,
    options: [
      { text: `The competitor is probably innocent because customers of both merchants became ill, making poisoning by one merchant unlikely`, score: 2 },
      { text: `The merchant's records prove the competitor's goods are contaminated because the illnesses occurred after those goods were purchased`, score: 1 },
      { text: `The shared increase weakens the claim that the competitor's goods alone caused the illnesses, while leaving open the possibility that a separate subset of cases had another cause`, score: 4 },
      { text: `The healer's uncertainty means poisoning and fever are equally likely explanations and neither can be investigated further without magical testing`, score: 1 },
    ],
  },

  {
    text: `Your party discovers that a bridge has collapsed shortly before a caravan was expected to cross it. A nearby farmer says he heard an explosion during the night. A guard says the bridge simply failed because it was old. You find no obvious explosive residue, but several support beams have fresh axe marks. The farmer has been feuding with the caravan owner for years. What should receive the greatest attention?`,
    options: [
      { text: `The farmer's testimony should be discounted because his longstanding feud gives him a motive to blame someone else for the bridge's collapse`, score: 2 },
      { text: `The axe marks are the strongest evidence because they provide direct physical evidence that someone recently interfered with the bridge structure`, score: 4 },
      { text: `The absence of explosive residue makes the farmer's account unlikely, so the bridge probably failed naturally despite the axe marks`, score: 1 },
      { text: `The guard's explanation is most credible because old bridges commonly fail and there is no proof that the damage occurred immediately before the collapse`, score: 1 },
    ],
  },

  {
    text: `A healer tells your party that a certain herb improves recovery from wounds. She cites twenty successful patients. A skeptical scholar says the herb is useless because wounds usually heal naturally. You discover that the healer gives the herb only to patients who are already recovering well enough to drink a tonic, while severely injured patients receive standard treatment alone. The healer sincerely believes she has seen a benefit. What is the key problem?`,
    options: [
      { text: `The healer's personal sincerity does not matter because anyone claiming medical effectiveness without formal training should be assumed unreliable`, score: 1 },
      { text: `The scholar is correct because natural healing explains recovery in wounded patients and therefore leaves no room for a useful medicinal effect`, score: 1 },
      { text: `The patients were not selected in a way that separates the herb's effect from differences in their initial condition, so the observations cannot establish that the herb caused better recovery`, score: 4 },
      { text: `The herb probably works because twenty successful cases represent a substantial number of observations, especially when the healer has no obvious reason to lie`, score: 1 },
    ],
  },

  {
    text: `A town begins offering rewards for information about thieves. Within a month, the number of reported thefts rises sharply. The mayor announces that the reward program has uncovered a major crime problem. A merchant says the town has actually become less safe. The watch captain points out that many new reports concern thefts that occurred months earlier. What is the most careful interpretation?`,
    options: [
      { text: `The mayor is correct because a large increase in theft reports indicates that many more thefts are occurring than before the reward program`, score: 1 },
      { text: `The merchant is correct because a rise in reported thefts is evidence that criminal activity has increased even if some reports concern older incidents`, score: 1 },
      { text: `The reward program changed reporting incentives, so the increase in reports cannot automatically be interpreted as an equivalent increase in the number of thefts occurring`, score: 4 },
      { text: `The watch captain is probably minimizing the problem because emphasizing old thefts provides an easy way to make current crime statistics appear better`, score: 1 },
    ],
  },

  {
    text: `A stranger joins your party and quickly proves useful. He knows several obscure roads, notices traps before anyone else, and never asks for a share of minor loot. One night he warns everyone not to enter a particular room because he "has a bad feeling." Inside the room, you later find evidence of a hidden ambush. Another party member begins to suspect the stranger is secretly working for the dungeon's owner because his knowledge is too accurate. What is the best assessment?`,
    options: [
      { text: `His unusual knowledge is evidence that he is probably connected to the dungeon's owner, especially because he predicted the ambush without explaining how`, score: 1 },
      { text: `His repeated helpful behavior strongly establishes that he is trustworthy, so suspicions about his background should be dismissed unless he directly betrays the party`, score: 2 },
      { text: `His behavior provides evidence of useful knowledge but does not determine its source or loyalty, so his information can be evaluated separately from assumptions about his motives`, score: 4 },
      { text: `The hidden ambush proves his warning was genuine and therefore establishes that his previous claims about the dungeon should also be trusted`, score: 1 },
    ],
  },

  {
    text: `A village blacksmith is accused of selling weapons to bandits. The accusation comes from a captured bandit who says the blacksmith supplied every blade. The blacksmith admits selling ordinary tools to travelers but denies selling weapons. You inspect his forge and find several unfinished blades hidden beneath a workbench. He says they are experimental designs he never completed. The village elder says the blacksmith has always been honest. What is the strongest conclusion?`,
    options: [
      { text: `The hidden blades prove the bandit's story because unfinished weapons in the forge demonstrate that the blacksmith was secretly producing arms`, score: 1 },
      { text: `The elder's confidence should carry substantial weight because longstanding familiarity with the blacksmith provides a stronger basis for judging his character than a captured criminal's accusation`, score: 2 },
      { text: `The hidden blades make the accusation more credible but do not establish that they were sold to bandits, so the connection between production and alleged supply still requires evidence`, score: 4 },
      { text: `The bandit's status as a captured criminal makes his accusation too unreliable to consider, especially when the blacksmith has a respected reputation in the village`, score: 1 },
    ],
  },

  {
    text: `A courier arrives carrying a royal seal and says an emergency order requires your party to leave town immediately. The seal appears genuine. The courier knows several details about the royal court and becomes impatient when questioned. You later discover that the kingdom recently changed its official seal design, but the courier's seal matches the older version. The courier says the change has not yet reached every office. What should you do?`,
    options: [
      { text: `Trust the courier because the seal is genuine enough to demonstrate official authorization, while minor administrative changes often take time to reach remote offices`, score: 2 },
      { text: `Reject the order immediately because using an outdated seal proves the courier is an impostor attempting to exploit your party's loyalty to the crown`, score: 1 },
      { text: `Treat the outdated seal as a meaningful authentication problem and seek independent confirmation of the order before acting, rather than assuming either explanation is true`, score: 4 },
      { text: `Trust the courier's knowledge of court details because an impostor would be unlikely to know obscure information about royal officials and procedures`, score: 2 },
    ],
  },

  {
    text: `A farmer reports that someone has been entering his fields at night. He finds footprints near a damaged fence and says they belong to a neighboring family. The neighboring family denies it and points out that the footprints are much larger than any of their boots. You discover that the farmer recently lost a property dispute with them. The footprints are later found to match the boots of a traveling mercenary who has been camping nearby. What should you conclude?`,
    options: [
      { text: `The farmer probably fabricated the accusation because his property dispute provides an obvious reason to blame the neighboring family for a minor trespass`, score: 2 },
      { text: `The neighboring family is probably innocent because the footprints do not match their boots, which removes the strongest physical evidence against them`, score: 2 },
      { text: `The physical evidence weakens the accusation against the neighbors, while the farmer's prior dispute remains relevant to why he identified them despite contradictory evidence`, score: 4 },
      { text: `The mercenary is probably responsible for the damaged fence because matching footprints establish that the mercenary entered the field and therefore caused the damage`, score: 1 },
    ],
  },

  {
    text: `A council is deciding whether to evacuate a town because a seer predicts a dragon attack within three days. The seer has correctly predicted several weather events but has never predicted an attack. A scout reports finding unusually large tracks in the mountains. Another scout reports finding no dragon tracks near the town. The town has limited food and evacuating would impose substantial costs. What is the most rational approach?`,
    options: [
      { text: `Evacuate immediately because the seer's previous accurate predictions and the mountain tracks together make the dragon threat too serious to ignore`, score: 2 },
      { text: `Stay because the seer has never successfully predicted an attack and evacuation would impose real costs based on evidence that remains uncertain`, score: 2 },
      { text: `Treat the dragon threat as uncertain and weigh the probability and consequences of an attack against the costs of evacuation, rather than treating either prediction or uncertainty as decisive`, score: 4 },
      { text: `Wait until a dragon is directly observed because acting before confirming the threat risks imposing unnecessary hardship on the entire town`, score: 1 },
    ],
  },

  {
    text: `A party member begins missing meetings and giving vague explanations. Another member says this proves they are planning to betray the group. You discover that the absent member has quietly sold several valuable possessions but has also been visiting a healer outside town. When confronted, they become defensive and refuse to explain. A friend says the healer is treating someone in their family. What is the most reasonable interpretation?`,
    options: [
      { text: `The member is probably preparing to betray the party because selling possessions, avoiding meetings, and refusing to explain form a coherent pattern of secretive behavior`, score: 1 },
      { text: `The healer visit provides a likely innocent explanation, so the party should stop worrying unless direct evidence of betrayal appears`, score: 2 },
      { text: `The behavior indicates that something significant is being concealed, but the available evidence does not establish whether the reason is betrayal, financial trouble, family circumstances, or another private matter`, score: 4 },
      { text: `The defensive reaction is the strongest evidence because innocent people generally explain themselves when questioned by trusted companions`, score: 1 },
    ],
  },

  {
    text: `A merchant offers your party a shortcut through private land. He says the route is safe and that the landowner has granted permission. The shortcut would save an entire day. At the entrance, you find a locked gate and a sign warning travelers not to enter. The merchant says the sign is outdated and that he has used the path many times. A local shepherd confirms that the path is sometimes opened for caravans but says the owner recently changed the rules. What should you do with the conflicting information?`,
    options: [
      { text: `Trust the merchant because repeated personal use of the route provides stronger evidence than a sign that may simply have become outdated`, score: 2 },
      { text: `Trust the warning sign because written restrictions should always take precedence over verbal claims about private property`, score: 2 },
      { text: `Recognize that the merchant's historical experience may be genuine while the current restriction has changed, making present authorization the unresolved issue that should be verified`, score: 4 },
      { text: `Trust the shepherd because local residents are more likely than outsiders to know the landowner's intentions and therefore the shortcut is probably closed`, score: 2 },
    ],
  },

  {
    text: `A prisoner offers your party information about an upcoming attack. He gives the exact date, location, and number of soldiers involved. The captain says the prisoner is probably trying to cause panic so the town will divert troops away from the prison. You discover that the date and location match information from an independent intercepted message, but the troop count differs. The prisoner insists his number is correct. What is the strongest conclusion?`,
    options: [
      { text: `The prisoner is trustworthy because his date and location match the intercepted message, so the conflicting troop count is probably a minor error`, score: 2 },
      { text: `The captain is correct because prisoners have obvious incentives to manipulate authorities and therefore their information should be treated as deliberately misleading`, score: 1 },
      { text: `The independent agreement increases confidence that an attack is being planned, while the disagreement about troop numbers means the scale of the threat remains uncertain`, score: 4 },
      { text: `The intercepted message should be ignored because intelligence about military movements is often deliberately falsified and therefore cannot independently confirm the prisoner's account`, score: 1 },
    ],
  },

  {
    text: `A town hires your party to determine why a series of fires began after a new bakery opened. Several fires occurred near the bakery, and the owner admits his ovens sometimes run hot. A rival baker says the new shop is careless. The fire marshal finds that the bakery's equipment meets safety standards. You later discover that several fires began in abandoned buildings with no connection to either bakery, but all occurred during a period of unusually dry weather. What should change in your assessment?`,
    options: [
      { text: `The bakery remains the strongest explanation because the timing of the fires after its opening provides a concrete connection that the dry weather does not explain`, score: 2 },
      { text: `The rival baker's accusation becomes more credible because the bakery owner admitted that his ovens sometimes operate at unusually high temperatures`, score: 1 },
      { text: `The broader pattern weakens the bakery-specific explanation and increases support for an environmental factor affecting multiple locations, without completely ruling out individual accidental fires`, score: 4 },
      { text: `The fire marshal's inspection proves the bakery cannot have caused any fires because equipment that meets safety standards cannot produce dangerous conditions`, score: 1 },
    ],
  },

  {
    text: `A famous adventurer recommends a particular route through a dungeon and says it is safer than the alternatives. Your party follows it and avoids two traps. Later, you discover that the route also passes directly through an area controlled by a rival faction. The adventurer says he forgot about the faction because he has not visited the dungeon recently. A local guide says the rival faction has controlled that area for months. What should you make of the recommendation?`,
    options: [
      { text: `The recommendation remains trustworthy because successfully avoiding two traps demonstrates that the adventurer knew the dungeon well enough to identify a genuinely safe route`, score: 2 },
      { text: `The recommendation should be rejected because directing your party toward a rival-controlled area proves the adventurer intentionally sent you there`, score: 1 },
      { text: `The route information may have been accurate when the adventurer learned it, but conditions changed, illustrating that correct historical knowledge does not guarantee current safety`, score: 4 },
      { text: `The local guide should be trusted completely because living near the dungeon gives them more relevant knowledge than a famous adventurer who has not visited recently`, score: 2 },
    ],
  },

  {
    text: `A council member proposes building a wall around the town after several monster sightings. He cites six reports from residents and says the wall will protect everyone. Another council member argues that the sightings are exaggerated because none resulted in an attack. You discover that all six reports came from houses near the same forest edge, and two witnesses later admit they may have seen the same creature. The remaining reports occurred on different nights. What is the most important observation?`,
    options: [
      { text: `The six reports provide substantial evidence of multiple monsters because they came from different residents and occurred over several nights`, score: 1 },
      { text: `The absence of attacks is the strongest evidence that the sightings do not represent a meaningful threat and therefore do not justify defensive action`, score: 2 },
      { text: `The reports should not automatically be counted as six independent sightings because some may describe the same event or creature, which changes how much evidence they provide`, score: 4 },
      { text: `The council member supporting the wall is probably exaggerating because political leaders commonly use isolated frightening reports to justify expensive construction projects`, score: 1 },
    ],
  },

  {
    text: `A scholar claims that an ancient artifact grants visions of the future. She demonstrates by predicting that a candle will go out within the hour, and it does. A skeptical scholar says the demonstration means little because candles frequently extinguish. The first scholar then predicts that a particular messenger will arrive before sunset. The messenger arrives. You later discover that the scholar had been secretly communicating with the messenger earlier that day. What should you infer?`,
    options: [
      { text: `The predictions demonstrate supernatural ability because correctly predicting two unrelated events is unlikely to happen by chance`, score: 1 },
      { text: `The second prediction is strong evidence of magical ability because secretly knowing about the messenger would not explain the exact timing of the arrival`, score: 1 },
      { text: `The evidence for supernatural prediction is weakened because at least one apparently impressive prediction had an ordinary information source, while the candle prediction was already weak evidence`, score: 4 },
      { text: `The skeptical scholar is proven correct because discovering one ordinary explanation means all demonstrations involving the artifact must have been fabricated`, score: 1 },
    ],
  },

  {
    text: `A commander asks your party to investigate reports that his soldiers are stealing from civilians. Several villagers accuse the same patrol. The patrol leader denies it and says the villagers are angry because the soldiers confiscated food during an emergency. The confiscations are documented and authorized. One villager produces a purse allegedly taken by a soldier, but another villager says the purse was actually found abandoned. You discover that the patrol's inventory records contain unexplained shortages. What is the most careful conclusion?`,
    options: [
      { text: `The soldiers are probably guilty because repeated accusations combined with unexplained inventory shortages create a consistent pattern of misconduct`, score: 2 },
      { text: `The villagers are probably exaggerating because the documented emergency confiscations provide a legitimate explanation for their hostility toward the patrol`, score: 2 },
      { text: `There is enough evidence to investigate the patrol's accounting and individual transactions, but not enough to treat every accusation as established simply because the overall pattern is suspicious`, score: 4 },
      { text: `The purse should be treated as decisive evidence because possession of an item allegedly taken from a villager directly connects the soldiers to theft`, score: 1 },
    ],
  },

  {
    text: `A healer asks your party to retrieve a rare flower from a dangerous cliff. She says the flower is needed to save a patient's life. She provides the exact location and warns that the flower blooms only briefly. When you reach the cliff, you find several flowers matching her description. A local herbalist tells you that the plant has no medicinal value but is extremely valuable to alchemists. The healer becomes evasive when asked who the patient is. What is the most appropriate interpretation?`,
    options: [
      { text: `The healer is probably lying because refusing to identify the patient while seeking an extremely valuable plant suggests she intends to sell it rather than use it medically`, score: 2 },
      { text: `The local herbalist is probably correct because local knowledge of plants should outweigh a healer's claim when the two disagree about medicinal properties`, score: 1 },
      { text: `The healer's stated purpose is uncertain, but the flower's alternative value creates a plausible competing motive that should be investigated before risking the party`, score: 4 },
      { text: `The patient's identity should be irrelevant because a healer asking for a specific medicine is entitled to privacy and the existence of another use does not make the request suspicious`, score: 1 },
    ],
  },

  {
    text: `A town's oldest resident tells your party that a particular cave has always been avoided because people who enter rarely return. He remembers several disappearances from his childhood. A young miner says the cave is simply dangerous because its lower tunnels flood unpredictably. The old resident dismisses this as a modern explanation and says the cave is cursed. You discover that the disappearances all occurred during the rainy season and that the cave contains evidence of sudden flooding. What is the strongest interpretation?`,
    options: [
      { text: `The curse remains plausible because generations of villagers independently preserved the warning long before anyone understood the cave's flooding behavior`, score: 1 },
      { text: `The miner's explanation is probably correct because physical evidence of flooding provides a direct mechanism that can account for people disappearing`, score: 3 },
      { text: `The historical warning may accurately preserve a real danger even if its supernatural explanation is wrong, making the distinction between observation and interpretation important`, score: 4 },
      { text: `The old resident should be trusted because personal memories from the period before modern mining began are more reliable than explanations developed afterward`, score: 1 },
    ],
  },

  {
    text: `A guildmaster tells your party that a rival guild is sabotaging his shipments. He presents three damaged wagons and says all were attacked on the same road. A rival representative says the wagons were poorly maintained. You inspect the damage and find that all three wheels failed at nearly identical points, while the road itself is smooth. The guildmaster insists this proves sabotage. A mechanic says identical failures can also occur when the same faulty component is installed repeatedly. What is the most useful next step?`,
    options: [
      { text: `Accept the guildmaster's explanation because repeated identical failures in the same place are unlikely to happen naturally and therefore indicate deliberate interference`, score: 2 },
      { text: `Accept the rival's explanation because faulty maintenance is a common cause of mechanical failures and requires less intentional coordination than sabotage`, score: 2 },
      { text: `Examine the failed components and maintenance records to distinguish a shared mechanical defect from deliberate damage rather than deciding based on which explanation sounds more plausible`, score: 4 },
      { text: `Assume the guildmaster is framing the rival because accusing a competitor of sabotage gives the guildmaster a clear strategic advantage in future trade negotiations`, score: 1 },
    ],
  },

  {
    text: `A messenger tells your party that a bridge ahead has been destroyed and advises taking a longer road. He appears exhausted and says he came directly from the bridge. Another traveler arrives shortly afterward and says the bridge is intact because she crossed it that morning. The messenger explains that the bridge may have been destroyed after she crossed. You learn that a heavy storm passed through the area between their journeys. What is the most reasonable response?`,
    options: [
      { text: `Trust the messenger because he claims to have seen the bridge more recently, making his account more relevant than the earlier crossing`, score: 2 },
      { text: `Trust the traveler because direct successful passage demonstrates that the bridge was functioning and there is no direct evidence that the storm damaged it`, score: 2 },
      { text: `Treat the messenger's report as more current but not automatically certain, and verify the bridge condition if the cost of taking the longer route is significant`, score: 4 },
      { text: `Assume the messenger is trying to redirect travelers for personal gain because exhausted travelers giving vague warnings are commonly attempting to manipulate routes`, score: 1 },
    ],
  },

  {
    text: `A noble asks your party to investigate a servant accused of stealing jewelry. The servant's room contains one missing necklace hidden beneath a floorboard. The servant says someone planted it there. The noble says the servant had access to the jewelry cabinet and has recently been struggling financially. Another servant says the accused often complained about being underpaid. You later discover that the accused's room is cleaned every morning by three other servants. What should happen to your confidence?`,
    options: [
      { text: `The hidden necklace makes the servant's guilt highly likely because possessing stolen property in a private room is strong evidence of deliberate theft`, score: 2 },
      { text: `The servant's financial problems and complaints about pay provide a clear motive, making the discovery of the necklace even more persuasive`, score: 1 },
      { text: `The necklace is important evidence, but the shared access to the room creates an alternative means of placing it there, so the physical discovery does not independently establish who hid it`, score: 4 },
      { text: `The servant is probably innocent because a thief would not hide stolen jewelry somewhere that could be discovered during routine cleaning`, score: 2 },
    ],
  },

  {
    text: `A group of farmers says a new road has caused monsters to move closer to their homes. They point to several sightings since construction began. The road engineer says the sightings are unrelated and notes that construction workers have been clearing forest that previously blocked the farmers' view. You discover that the number of reported sightings increased sharply, but the number of livestock attacks did not. What should you infer?`,
    options: [
      { text: `The farmers are probably mistaken because unchanged livestock attacks demonstrate that monsters have not actually moved closer to the settlement`, score: 2 },
      { text: `The engineer is probably correct because clearing the forest provides a straightforward reason that monsters would become easier to see without becoming more numerous`, score: 3 },
      { text: `The sightings may reflect increased visibility rather than increased monster activity, but the unchanged attacks do not completely rule out a change in behavior or location`, score: 4 },
      { text: `The road probably caused the change because the timing of the sightings after construction provides stronger evidence than the engineer's theoretical explanation about visibility`, score: 1 },
    ],
  },

  {
    text: `A respected captain tells your party that one of his officers is disloyal. He says the officer has been unusually quiet, requested access to old military maps, and recently sent money to relatives across the border. The officer explains that the money supports an elderly parent and that the maps are needed for a legitimate survey. You discover that the officer requested the maps through the normal procedure and that several other officers have done the same. What should you conclude?`,
    options: [
      { text: `The captain's suspicion remains strong because the officer's behavior involves multiple unusual actions that together form a meaningful pattern`, score: 1 },
      { text: `The officer is probably innocent because each individual action has an ordinary explanation and there is no direct evidence of communication with an enemy`, score: 3 },
      { text: `The evidence weakens the captain's interpretation because two supposedly suspicious behaviors have ordinary explanations and the map request was not exceptional within the organization`, score: 4 },
      { text: `The officer is probably guilty because sending money across a border while requesting military maps creates a combination that would be too coincidental to ignore`, score: 1 },
    ],
  },

  {
    text: `A merchant tells your party that a rival has been spreading false rumors about his goods. He produces several customers who say the rival warned them not to buy from him. The rival admits making the warnings but says he was repeating reports that the merchant's goods were defective. You inspect several products and find that some are defective while others are not. The merchant argues that the rival's warnings are still malicious because he exaggerated the problem. What is the most defensible conclusion?`,
    options: [
      { text: `The rival is acting maliciously because repeating concerns about defective goods when some products are safe is an unfair attempt to damage a competitor's reputation`, score: 2 },
      { text: `The merchant is probably innocent because only some products are defective and therefore broad warnings about the goods are factually unjustified`, score: 1 },
      { text: `There is evidence supporting a factual basis for the warnings, but whether the rival accurately characterized the frequency and severity of defects remains a separate question`, score: 4 },
      { text: `The rival should be trusted because admitting that he issued the warnings demonstrates honesty and makes it unlikely that he invented the underlying concerns`, score: 2 },
    ],
  },

  {
    text: `A party discovers a sealed door beneath an abandoned temple. An inscription says, "Only those who enter without greed shall pass." One adventurer argues that the door is a magical test of character. Another says the inscription is probably meant to frighten thieves. A third notices that the door has a conventional locking mechanism hidden beneath the inscription. The party finds valuable treasure visible through a crack beside the door. What is the most useful interpretation?`,
    options: [
      { text: `The inscription should be taken literally because ancient temples commonly used moral tests to determine who was worthy to enter sacred places`, score: 1 },
      { text: `The visible treasure is probably bait because placing valuable objects beside a warning is a classic sign of a magical trap`, score: 2 },
      { text: `The conventional lock provides evidence that at least part of the obstacle is mechanical, while the inscription may still indicate a separate magical or social purpose`, score: 4 },
      { text: `The inscription is probably irrelevant because the discovery of an ordinary locking mechanism demonstrates that the temple's builders did not use magic in the door`, score: 1 },
    ],
  },

  {
    text: `A commander tells your party that a deserter stole military supplies. The deserter admits leaving his post but denies taking anything. A warehouse inventory shows several missing items. The commander says the timing is obvious proof. The deserter says the supplies were already missing when he left and claims other soldiers can confirm it. You discover that the warehouse inventory was not checked for two months before the alleged theft. What is the most important issue?`,
    options: [
      { text: `The deserter's admission that he abandoned his post is strong evidence against him because someone willing to desert is more likely to steal supplies as well`, score: 1 },
      { text: `The commander's timeline should be trusted because the missing supplies were discovered after the deserter left and therefore naturally point toward him`, score: 2 },
      { text: `The inventory gap prevents the missing supplies from being reliably attributed to the deserter, because the theft could have occurred at any point during the two-month period`, score: 4 },
      { text: `The other soldiers should be trusted because their potential testimony provides an alternative account that directly contradicts the commander's accusation`, score: 2 },
    ],
  },

  {
    text: `A village asks your party to determine whether a nearby ruin is haunted. Residents report hearing footsteps, seeing lights, and finding objects moved overnight. A priest says the reports prove spirits are present. A skeptical ranger discovers that the ruin has several partially collapsed ventilation shafts and old mechanical devices. During your investigation, you hear footsteps but cannot see anyone. Later, you find a loose pulley connected to a partially collapsed section of the building. What should you conclude?`,
    options: [
      { text: `The ruin is probably haunted because multiple residents independently reported strange experiences before your party arrived`, score: 1 },
      { text: `The ranger's mechanical explanation is probably correct because discovering one mechanism capable of producing movement makes supernatural explanations unnecessary`, score: 3 },
      { text: `There is evidence that at least some reported phenomena could have ordinary causes, but that does not by itself establish that every unusual event has been explained`, score: 4 },
      { text: `The priest's testimony should be preferred because religious training gives him more authority to identify supernatural activity than a ranger who specializes in physical evidence`, score: 1 },
    ],
  },
]


const ROUND_COUNT = 8

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface PreparedStage {
  text: string
  options: ScenarioOption[]
}

interface PreparedRound {
  stage: PreparedStage
  followUp?: PreparedStage
}

function shuffleStage(stage: ScenarioStage): PreparedStage {
  return { text: stage.text, options: shuffle(stage.options) }
}

function prepareRounds(): PreparedRound[] {
  return shuffle(BANK)
    .slice(0, ROUND_COUNT)
    .map((t) => ({
      stage: shuffleStage(t),
      followUp: t.followUp ? shuffleStage(t.followUp) : undefined,
    }))
}

// Judgment quality (0-4) converts to a 0-100 raw quality. Confidence then adjusts it:
function pointsFor(score: number, confidence: Confidence): number {
  const base = (score / 4) * 90

  const calibrationBonus =
    confidence === 'high'
      ? score === 4 ? 10
        : score === 3 ? 5
          : score === 2 ? 0
            : score === 1 ? -5
              : -10
      : confidence === 'low'
        ? score === 0 ? 10
          : score === 1 ? 5
            : score === 2 ? 0
              : score === 3 ? -5
                : -10
        : 0

  return Math.max(0, Math.min(100, base + calibrationBonus))
}

type Step = 'stage' | 'followUp'

interface InsightScenarioTestProps {
  onComplete: (score0to100: number) => void
}

export default function InsightScenarioTest({ onComplete }: InsightScenarioTestProps) {
  const rounds = useMemo(prepareRounds, [])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState<Step>('stage')
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)
  const pointsRef = useRef<number[]>([])

  const round = rounds[index]
  const activeStage = step === 'stage' ? round.stage : round.followUp!

  const advance = () => {
    setChosenIndex(null)
    if (step === 'stage' && round.followUp) {
      setStep('followUp')
      return
    }
    setStep('stage')
    if (index + 1 >= ROUND_COUNT) {
      const total = pointsRef.current.reduce((a, b) => a + b, 0)
      onComplete(Math.round(total / pointsRef.current.length))
    } else {
      setIndex(index + 1)
    }
  }

  const chooseOption = (i: number) => {
    if (chosenIndex !== null) return
    setChosenIndex(i)
  }

  const chooseConfidence = (confidence: Confidence) => {
    if (chosenIndex === null) return
    pointsRef.current.push(pointsFor(activeStage.options[chosenIndex].score, confidence))
    advance()
  }

  return (
    <div className="insight-test">
      <p className="matrix-progress">
        Scenario {index + 1} of {ROUND_COUNT}
        {step === 'followUp' ? ' — new information' : ''}
      </p>
      <p className="insight-text">{activeStage.text}</p>

      {chosenIndex === null ? (
        <div className="insight-options">
          {activeStage.options.map((opt, i) => (
            <button key={i} className="insight-option" onClick={() => chooseOption(i)}>
              {opt.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="insight-confidence">
          <p className="insight-confidence-prompt">How confident are you in that judgment?</p>
          <div className="insight-confidence-options">
            {(['low', 'medium', 'high'] as Confidence[]).map((c) => (
              <button key={c} className="insight-option" onClick={() => chooseConfidence(c)}>
                {c[0].toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
