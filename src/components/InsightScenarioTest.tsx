import { useMemo, useState } from 'react'

interface ScenarioTemplate {
  text: string
  options: string[]
  correctIndex: number
}

const BANK: ScenarioTemplate[] = [
  {
    text: `A merchant in a roadside market offers you a silver dagger for less than half its apparent value. He says he needs coin for his daughter's medicine, but he does not pressure you and readily agrees when you say you need time to think. The dagger bears a maker's mark you've seen on weapons carried by a nearby noble household, although you cannot identify the exact piece. When you ask whether it is stolen, the merchant answers, "Not to my knowledge." A neighboring merchant watches the exchange without speaking, then later talks privately with a town guard. You have enough money to buy the dagger, but doing so would leave you unable to replace damaged climbing equipment tomorrow. What should weigh most heavily in your decision?`,
    options: [
      `The merchant's calm behavior should carry substantial weight because he does not create urgency, allows you to leave, and appears to have little reason to risk a confrontation over a relatively small sale.`,
      `The maker's mark and the merchant's qualified answer create enough uncertainty about the dagger's origin that purchasing it would be difficult to justify, even if his explanation about his daughter is completely genuine.`,
      `The neighboring merchant's private conversation with the guard is the strongest indication of wrongdoing because an uninvolved observer would have little reason to involve the authorities without seeing something suspicious.`,
      `The climbing equipment should determine the decision because an uncertain opportunity involving a weapon cannot reasonably outweigh equipment that the party already knows it will need tomorrow.`
    ],
    correctIndex: 1,
  },

  {
    text: `A village asks your party to investigate a series of nighttime fires. The mayor claims a traveling gang is responsible because two strangers were seen near the first fire. A stablehand says the fires began after a local dispute over grazing rights. Three villagers support the mayor, while two privately say they suspect the mayor's brother, who owns much of the damaged land. You discover that all three witnesses supporting the mayor work for businesses recently funded by the mayor's family. The two accusing his brother admit they dislike him. You can question one person before leaving for the next fire. Who would provide the most useful information to investigate first?`,
    options: [
      `The mayor, because establishing whether his account changes when confronted with the witnesses' conflicting claims could reveal whether the investigation is being deliberately directed.`,
      `The stablehand, because their account introduces a concrete local motive that is more specific than the mayor's explanation involving unknown travelers.`,
      `One of the mayor's employees, because determining whether their support was independently formed or influenced by their financial relationship would clarify the reliability of several witnesses.`,
      `The mayor's brother, because allowing the accused party to explain his relationship to the damaged land may reveal whether the grazing dispute has been exaggerated.`
    ],
    correctIndex: 2,
  },

  {
    text: `A captured bandit offers to guide your party to a hidden camp in exchange for leniency. His initial directions match landmarks your scouts independently recognize. He answers questions without hesitation and seems eager to cooperate. Near the end of the journey he says the camp has two entrances and proposes splitting the party so both can be covered at once. The other entrance is only a few minutes away, and delaying would mean traveling through the forest after dark. You cannot determine whether he is lying about either entrance. What is the most defensible response?`,
    options: [
      `Follow his proposal but place the strongest members at the more distant entrance, since his accurate information and cooperation so far provide meaningful evidence that he intends to help.`,
      `Reject the proposal and return to the original route, because any prisoner who suggests dividing a party near an unknown enemy position should be assumed to be attempting an ambush.`,
      `Ask him to describe both entrances in greater detail and compare his answers against what your scouts already know before deciding whether the additional information justifies separating the party.`,
      `Agree to split only after securing a promise of leniency from him, since giving him a personal reason to cooperate makes betrayal less likely than it would otherwise be.`
    ],
    correctIndex: 2,
  },

  {
    text: `A healer arrives in a town during an outbreak and claims to have treated similar illnesses elsewhere. The local physician says the healer is a fraud and points out that the healer's medicines have no recognized guild seal. Several patients say they improved after receiving the healer's treatment. You learn that many of those patients were already recovering before the healer arrived, while two who were seriously ill improved afterward. The healer refuses to reveal the recipe but offers to treat more people for free. The physician's guild has recently lost influence in the town. What should you conclude before deciding whether to support either side?`,
    options: [
      `The healer's results are encouraging but do not establish effectiveness by themselves, while the physician's conflict of interest weakens his accusation without proving the healer is legitimate.`,
      `The healer's refusal to reveal the recipe is the most important fact because legitimate medicine should be transparent enough for other healers to verify before it is administered.`,
      `The physician's guild position should receive greater weight because trained practitioners are more likely to recognize dangerous treatments than patients who only observe whether they feel better.`,
      `The two serious patients who improved after treatment provide the strongest evidence because their condition was severe enough that spontaneous recovery would be less plausible.`
    ],
    correctIndex: 0,
  },

  {
    text: `A noble offers your party a contract to escort a shipment through territory where attacks have recently occurred. He provides detailed maps, generous payment, and written guarantees from the city council. A caravan master privately warns you that the noble's shipments have recently been targeted. Another merchant says the attacks stopped after guards began accompanying the caravans. You discover that the noble has already hired two other adventuring groups, neither of which completed the journey. He claims both groups simply abandoned the contract. The shipment is time-sensitive, and delaying would cost you a significant opportunity elsewhere. What is the most important unresolved question?`,
    options: [
      `Whether the noble is personally trustworthy, since his guarantees and willingness to pay generously matter only if his intentions toward the party are legitimate.`,
      `Whether the attacks are actually occurring now, since the difference between a current threat and an outdated reputation changes the value of nearly every other piece of evidence.`,
      `Why the previous adventuring groups abandoned the contract, because their direct experience could reveal information the noble's documents and promises cannot provide.`,
      `Whether the shipment is valuable enough to attract criminals, because understanding the cargo's value would help determine whether the reported attacks are economically plausible.`
    ],
    correctIndex: 2,
  },

  {
    text: `A frightened farmer tells you that a neighboring landowner has been poisoning his livestock. He points to three dead animals and says they all drank from a stream crossing the property line. The neighboring landowner admits the animals died but says several wild animals have also been found dead nearby. You discover an abandoned workshop uphill from both farms. The farmer strongly dislikes the landowner and has previously lost a boundary dispute against him. The landowner offers to let you inspect his property but insists that the workshop is outside his responsibility. What should most influence your next step?`,
    options: [
      `The farmer's prior dispute with the landowner should make his accusation less reliable, so the investigation should begin by determining whether the farmer has another reason to revive the conflict.`,
      `The fact that wild animals are also dying makes deliberate poisoning less likely, so the investigation should focus on natural causes before considering either farmer's accusation.`,
      `The abandoned workshop provides a potentially independent explanation for the deaths, making it more valuable to investigate the shared environmental source before deciding which person's account is credible.`,
      `The landowner's willingness to permit an inspection should increase confidence in his innocence because someone responsible for poisoning animals would have stronger reasons to prevent outsiders from examining the property.`
    ],
    correctIndex: 2,
  },

  {
    text: `Your party is preparing to cross a mountain pass. A veteran guide warns that an avalanche is possible because the previous winter left unusually deep snow. A younger scout says the weather has been warm for three days and the slope appears stable. A merchant who crossed yesterday reports no problems, but traveled during a colder morning. The guide admits he has not crossed this particular slope in five years. The scout has crossed it twice this month. A storm is approaching, and waiting until tomorrow may make the crossing impossible for several days. What should matter most?`,
    options: [
      `The scout's recent experience should carry the most weight because direct observation of the current conditions is more relevant than an older warning based on a different season.`,
      `The guide's avalanche warning should dominate because the potential consequence is severe enough that even uncertain evidence warrants treating the slope as dangerous.`,
      `The merchant's successful crossing should be decisive because it is the most recent independent evidence that the route can currently be traversed safely.`,
      `The approaching storm should determine the decision because the opportunity to cross now may disappear, making the cost of precaution potentially greater than the cost of proceeding.`
    ],
    correctIndex: 1,
  },

  {
    text: `A respected captain accuses one of his soldiers of stealing supplies. The soldier denies it and says the captain has disliked him since he refused an order last month. Two soldiers witnessed the accusation but both serve directly under the captain. The missing supplies were found in a storage room the accused soldier had access to, although several others did as well. The captain proposes punishing the soldier immediately to prevent "discipline from collapsing." The accused asks only that the storage records be checked. What is the most reasonable course?`,
    options: [
      `Delay punishment and inspect the records, because the evidence currently establishes opportunity but does not distinguish the accused from several other people who had the same access.`,
      `Trust the captain's judgment because maintaining discipline is itself a legitimate concern, and commanders usually have access to contextual information that subordinates do not.`,
      `Punish the soldier provisionally while continuing the investigation, because a temporary penalty protects discipline without requiring certainty about the accusation.`,
      `Question the two witnesses first, because their presence during the accusation makes them the most relevant people to determining whether the captain's suspicion is justified.`
    ],
    correctIndex: 0,
  },

  {
    text: `A wealthy patron asks your party to recover an heirloom from an abandoned manor. He provides an old map and says the manor has been empty for decades. A local child claims lights appear in the upper windows at night. A groundskeeper says the child often invents stories. When you inspect the manor from outside, you find fresh footprints near the rear entrance and a recently replaced lock. The patron insists nobody has legal reason to be inside. He offers double payment if the heirloom is recovered before dawn. What should you be most cautious about?`,
    options: [
      `The child's story, because although children can exaggerate, the report of nighttime activity is independently supported by the fresh footprints and replacement lock.`,
      `The patron's urgency and unusual payment, because they create an incentive for him to conceal information about who is currently occupying or using the manor.`,
      `The groundskeeper's dismissal of the child, because his familiarity with the property makes him more likely to know whether the reported activity is unusual.`,
      `The old map, because a decades-old document is unlikely to accurately describe current entrances, occupants, or hazards inside the manor.`
    ],
    correctIndex: 1,
  },

  {
    text: `A village council asks you to decide whether to exile a man accused of starting a recent fire. Seven villagers claim they saw him near the building shortly before it burned. He admits being there but says he was trying to rescue someone. The rescued person cannot currently be found. The man's previous criminal record contains two convictions for theft, but nothing involving arson. The fire destroyed property belonging to a family that publicly opposed him in a recent dispute. The council wants a decision today because tensions are rising. What should be given the greatest weight?`,
    options: [
      `The seven witnesses should carry substantial weight because multiple independent observations are more difficult to dismiss than the accused person's explanation alone.`,
      `His previous convictions should reduce confidence in his explanation because a demonstrated willingness to break laws makes further wrongdoing more plausible.`,
      `The inability to locate the person he claims to have rescued should be treated as the strongest evidence against him because that claim currently lacks independent support.`,
      `The specific evidence connecting him to the fire should be separated from his character and the political dispute, because neither his prior crimes nor his enemies establish that he caused this fire.`
    ],
    correctIndex: 3,
  },

  {
    text: `A priest tells your party that a sacred relic has been stolen and asks you to recover it before sunrise. She says the relic protects the town from an ancient curse. A skeptical scholar says the relic is historically valuable but has no known supernatural properties. The priest is visibly terrified and offers the party everything the temple can afford. The relic was last seen shortly before a series of unrelated accidents began. You have no way to determine whether the curse is real. Recovering the relic would require entering a building that may contain armed thieves. What should guide your immediate decision?`,
    options: [
      `The possibility of a genuine supernatural threat should be treated seriously because the timing of the accidents gives the priest's warning some evidentiary support despite the lack of proof.`,
      `The scholar's skepticism should prevail because there is no established mechanism by which the relic could cause a curse, making the priest's fear insufficient justification for risking the party.`,
      `The existence of a physical theft should be separated from the supernatural claim, so the decision should depend primarily on the known danger of entering the building and the value of recovering the relic.`,
      `The priest's willingness to sacrifice the temple's resources is evidence that she sincerely believes the relic is dangerous, so the party should treat her account as credible enough to justify the risk.`
    ],
    correctIndex: 2,
  },

  {
    text: `A traveling judge arrives in a town and announces that a local magistrate has been accepting bribes. The judge presents copies of financial records showing unusual payments. The magistrate says the records are genuine but represent legitimate repayment of old debts. The judge has recently been assigned authority over several neighboring towns and would gain prestige from exposing corruption. A clerk independently confirms that some payments occurred but cannot explain their purpose. The townspeople are already angry with the magistrate. What would be the most useful next step?`,
    options: [
      `Determine whether the financial records correspond to transactions whose timing and amounts could reasonably match the claimed debts rather than treating the existence of payments as proof of bribery.`,
      `Trust the judge's investigation because exposing corruption is consistent with the authority of the office and the records provide concrete evidence rather than mere accusations.`,
      `Interview the townspeople who oppose the magistrate, since their experiences may reveal additional examples of suspicious behavior that the financial records cannot capture.`,
      `Examine whether the judge personally benefits from the magistrate's removal, because a competing political motive would make the accusation too compromised to rely upon.`
    ],
    correctIndex: 0,
  },

  {
    text: `A companion who has always been generous suddenly refuses to lend you money for an urgent purchase. They explain that they need to preserve their remaining gold for an obligation they cannot discuss. Another companion says this is proof the first has become selfish since acquiring a new position. Later, you learn that the person who refused has recently been sending money to someone in another city. They still refuse to explain why. You have enough information to suspect something has changed but not enough to know what. How should you interpret the refusal?`,
    options: [
      `Treat it as evidence that their priorities may have changed, but avoid assigning a motive until you know what obligation or relationship is consuming their resources.`,
      `Assume the refusal is justified because their previous generosity establishes a stronger pattern of trustworthy behavior than one unexplained decision can overturn.`,
      `Suspect that the new position has changed them because the timing of their behavior and unexplained payments provide independent evidence that their loyalties have shifted.`,
      `Press them for an explanation because withholding information from close companions is itself evidence that whatever they are doing may conflict with the party's interests.`
    ],
    correctIndex: 0,
  },

  {
    text: `A town guard asks your party to help search a warehouse for stolen goods. He says the owner is a known criminal. The owner denies this and points out that the guard previously arrested his business partner. During the search, you find a locked chest containing goods matching items reported stolen. The owner says he bought them from a traveling merchant and has a receipt. The receipt appears genuine, but the merchant's name is unfamiliar. The guard immediately says the receipt is forged. What should you do before treating the chest as proof of guilt?`,
    options: [
      `Accept the chest as strong evidence because possession of recently stolen goods is more concrete than either person's competing account of the transaction.`,
      `Verify the receipt and determine whether the traveling merchant existed and could plausibly have sold the goods, because that evidence could distinguish knowing possession from an innocent purchase.`,
      `Trust the guard's conclusion because he has investigated the theft and is more likely than an outsider to recognize the methods used by local criminals.`,
      `Question the owner about his relationship with the merchant because an honest buyer should be able to provide enough detail to establish that the purchase was legitimate.`
    ],
    correctIndex: 1,
  },

  {
    text: `Your party is asked to escort a diplomat through a crowded festival. Before entering, the diplomat's aide warns you that an assassin may attempt to approach from the eastern gate. A second aide says the western gate is safer. Both appear equally informed. You discover that the first aide secretly owes a large debt to a merchant operating near the eastern gate, while the second aide has family members living near the western gate. Neither admits to having a personal reason for their recommendation. The diplomat wants to leave immediately. What is the best way to handle the conflicting advice?`,
    options: [
      `Follow the second aide because the first has a direct financial connection to the area he recommends, while the second's family connection is less likely to create an incentive to mislead.`,
      `Follow neither recommendation without investigation, because the conflicting incentives make both aides unreliable enough that their warnings should temporarily be disregarded.`,
      `Choose the eastern gate because the first aide's warning contains more specific information, and specific intelligence is generally more valuable than vague caution.`,
      `Choose the western gate because the second aide's family presence gives her a reason to understand the area well, while the first aide's debt makes his recommendation suspicious.`
    ],
    correctIndex: 1,
  },

  {
    text: `A fisherman reports seeing a dragon flying over the eastern hills three nights in a row. His story spreads quickly because livestock have recently disappeared. A respected hunter says the tracks near the missing animals are too small for a dragon. Another villager claims to have found scales but refuses to show them. You later learn that the fisherman has been trying to sell land near the hills, and a dragon rumor would make the property considerably cheaper. The missing livestock are real, but no one has established how they disappeared. What conclusion is most justified?`,
    options: [
      `The dragon story is probably false because the fisherman's financial incentive provides a strong reason to fabricate the sightings.`,
      `The dragon explanation remains plausible because the missing livestock and repeated sightings constitute multiple pieces of evidence even though the witness has a possible motive.`,
      `The livestock disappearances should be investigated independently from the dragon claim because they are established facts while the explanation connecting them remains uncertain.`,
      `The hunter's tracks should outweigh the sightings because physical evidence is inherently more reliable than testimony from someone with a financial interest.`
    ],
    correctIndex: 2,
  },

  {
    text: `A newly appointed commander orders your party to abandon a fortified position and move to a nearby village. She explains that enemy scouts have discovered your location. A veteran soldier says the commander is inexperienced and may be panicking. Another soldier confirms seeing scouts on the ridge. The village has poor defenses but contains civilians who could be evacuated if warned early. Remaining would preserve your strong position but could expose the village to an attack. Moving would protect the village but leave your party in open terrain. What should be considered first?`,
    options: [
      `The commander's lack of experience, because a new leader is more likely to overreact to ambiguous signs of enemy activity than someone with an established record.`,
      `The confirmed sighting of enemy scouts, because it provides concrete evidence that the position may no longer be secure regardless of whether the commander is personally reliable.`,
      `The civilians in the village, because protecting noncombatants should outweigh the tactical advantages of remaining in a position that may already be compromised.`,
      `The veteran soldier's assessment, because his experience gives him a better basis for recognizing whether the commander's interpretation of the scouts is reasonable.`
    ],
    correctIndex: 1,
  },

  {
    text: `A scholar claims that a newly discovered ruin belongs to an ancient civilization previously thought to have never reached this region. She presents inscriptions that appear to support her theory. Another scholar says the inscriptions were copied from a known culture and may have been planted recently. The first scholar has spent ten years studying the civilization and would gain considerable prestige if the discovery were authentic. The second scholar has publicly criticized her work before. Both agree that the physical structure is genuinely ancient. What piece of information would most help distinguish their competing explanations?`,
    options: [
      `Whether the first scholar has previously made successful discoveries involving the same civilization, because a strong record would make her interpretation more credible.`,
      `Whether independent dating and analysis show that the inscriptions were created at the same time as the ancient structure rather than added later.`,
      `Whether the second scholar can provide another example of copied inscriptions, because a demonstrated pattern would weaken the first scholar's interpretation.`,
      `Whether other scholars consider the first researcher trustworthy, because professional reputation can help resolve disputes when direct evidence is difficult to interpret.`
    ],
    correctIndex: 1,
  },

  {
    text: `A member of your party repeatedly volunteers to take the most dangerous position during fights. At first everyone interprets this as bravery. Later, you notice that they become unusually quiet whenever plans are made that would give them a less central role. Another companion says this proves they crave admiration. The person denies it and says they simply dislike watching others take unnecessary risks. You have no evidence that they have deliberately endangered anyone. What is the wisest interpretation?`,
    options: [
      `Their behavior is probably driven by a desire for recognition because volunteering for danger while resisting less visible roles suggests that attention matters to them.`,
      `Their stated explanation should be accepted because there is no evidence that their behavior has harmed anyone, and motives should not be inferred from personality patterns alone.`,
      `There are several plausible motives for the behavior, so the important issue is whether their preference creates recurring strategic problems rather than determining which motive is secretly correct.`,
      `Their willingness to take danger should be encouraged because whatever their motive, the party benefits from having someone willing to accept risks others avoid.`
    ],
    correctIndex: 2,
  },

  {
    text: `A caravan reaches a fork in the road. A sign says the northern route is closed because of landslides. A local farmer insists the sign is outdated and says he used the road yesterday. A merchant says he would never trust the farmer because the farmer's land lies beside the southern route and benefits when travelers avoid the north. Your map shows the northern route as shorter, but it has no recent information. Rain began falling heavily an hour ago. What should your party do?`,
    options: [
      `Take the northern route because the farmer provides recent firsthand evidence, while the merchant's economic interest gives him an obvious reason to discourage travelers from using it.`,
      `Take the southern route because the official sign and current rain together provide stronger evidence of a landslide than one person's report that the road was passable yesterday.`,
      `Delay the journey until the weather clears, because neither route can currently be established as safe enough to justify choosing between conflicting accounts.`,
      `Ask the farmer whether he personally observed a landslide before traveling yesterday, because distinguishing direct observation from hearsay would determine how much weight his report deserves.`
    ],
    correctIndex: 3,
  },

  {
    text: `A child in a village disappears. The parents immediately accuse a traveling stranger who was seen near the house. The stranger admits speaking with the child but says the child ran toward the river afterward. A fisherman independently reports seeing a small figure near the river around the same time. The parents are convinced the stranger is responsible because he cannot explain why he was speaking to the child. You learn that the stranger has been traveling alone for several weeks and has no local connections. What should most influence your investigation?`,
    options: [
      `The fisherman's independent observation should move attention toward the river because it provides evidence about the child's actual movements rather than the stranger's unexplained presence.`,
      `The stranger's inability to explain the conversation should remain central because innocent people should normally be able to explain why they approached a missing child.`,
      `The parents' certainty should be taken seriously because they know their child and are more likely to recognize behavior that would have caused the child to distrust someone.`,
      `The stranger's lack of local connections should make him more suspicious because an outsider has fewer social ties that would discourage harmful behavior.`
    ],
    correctIndex: 0,
  },

  {
    text: `A retired soldier tells your party that a particular inn is dangerous and should be avoided. He gives a detailed account of an ambush that occurred there years ago. The innkeeper says the soldier has a personal grudge against him after being expelled for fighting. Two other travelers report that they stayed there recently without incident. The soldier's account contains details that appear impossible to verify. The innkeeper has no obvious reason to know whether you have heard the soldier's story. What is the most reasonable conclusion?`,
    options: [
      `The inn is probably safe because multiple recent travelers contradict a single old accusation, while the soldier's personal dispute gives him reason to exaggerate.`,
      `The soldier's warning should still be treated as meaningful because firsthand experience of danger can remain relevant even when the witness has an obvious personal motive.`,
      `The conflicting accounts mean the inn's current safety cannot be established, so your decision should depend primarily on how costly it would be to choose another place.`,
      `The innkeeper's past conflict with the soldier is less important than the travelers' recent experiences because current observations should normally outweigh historical testimony.`
    ],
    correctIndex: 2,
  },

  {
    text: `A magical artifact is discovered in a ruined temple. It appears to grant one person a powerful ability but causes exhaustion after each use. A scholar argues that it should be studied before anyone touches it. A desperate village leader wants to use it immediately to defend against raiders expected within two days. Your party has no expertise with the artifact. The raiders may never arrive, but if they do, the village has little chance of surviving without additional help. Destroying the artifact would remove both the potential benefit and the unknown danger. What consideration should dominate?`,
    options: [
      `The possibility of immediate danger should favor using the artifact because refusing a potentially powerful defense could expose innocent people to a preventable disaster.`,
      `The lack of expertise should favor studying the artifact because an unknown magical effect could create consequences worse than the threat it is intended to solve.`,
      `The possibility that the raiders never arrive should favor preserving the artifact because using it now would create a real cost in response to a hypothetical threat.`,
      `The option to destroy the artifact should receive priority because removing an unknown source of danger prevents both the raiders and the artifact from determining the village's fate.`
    ],
    correctIndex: 1,
  },

  {
    text: `A respected guildmaster publicly accuses a young apprentice of stealing rare materials. The apprentice admits taking some materials but says they were discarded items that the guildmaster had told apprentices they could use. Two other apprentices confirm hearing that instruction, although neither witnessed the specific incident. The guild's written policy says discarded materials remain guild property. The guildmaster says the apprentice is being punished because dishonesty must be discouraged. The apprentice has recently criticized the guild's leadership. What is the central issue to resolve?`,
    options: [
      `Whether the apprentice actually took materials without authorization, because the existence of a general guild policy does not establish whether an exception was communicated in this particular case.`,
      `Whether the two apprentices are telling the truth, because their testimony is the only evidence supporting the claim that the apprentice believed the materials were available.`,
      `Whether the apprentice's criticism of the guild influenced the punishment, because a conflict between them could explain why a minor violation has become unusually serious.`,
      `Whether the guildmaster's stated policy is reasonable, because an unfair rule should not be treated as sufficient justification for punishing someone who acted according to common practice.`
    ],
    correctIndex: 0,
  },

  {
    text: `Your party is offered shelter by a family during a dangerous storm. The family seems hospitable and asks only that you remain indoors until morning. Their house contains several locked rooms, and one family member becomes visibly uncomfortable when you ask about them. Later, you hear what sounds like movement behind one of the doors. Your companions want to investigate while the family sleeps. One argues that hiding something is itself suspicious. Another says entering a private room without evidence of danger would be unjustified. The storm makes leaving difficult but not impossible. What is the best immediate approach?`,
    options: [
      `Investigate the locked rooms quietly because the family has already accepted responsibility for your safety, and unexplained activity inside their home creates enough concern to justify checking.`,
      `Leave immediately because the combination of secrecy, locked rooms, and nighttime movement creates a pattern too risky to ignore even without proof of wrongdoing.`,
      `Remain cautious but avoid intrusion unless additional evidence indicates an immediate threat, because discomfort and privacy are ambiguous signals rather than proof of hostile intent.`,
      `Confront the family directly and demand that the rooms be opened, because honest hosts should have nothing to fear from a straightforward request made by their guests.`
    ],
    correctIndex: 2,
  },

  {
    text: `A messenger arrives claiming that an allied army has been defeated. He provides the name of the battlefield, the commanders involved, and a detailed description of the retreat. Your own scouts reported the army was advancing successfully yesterday. The messenger is exhausted and carries a military insignia, but his horse is missing and his clothing has no visible blood or damage. A second messenger arrives twenty minutes later with the same basic report but gives a different account of how the commander died. The enemy is close enough that delaying your response could matter. What should you do first?`,
    options: [
      `Trust the first messenger because his detailed knowledge and military insignia provide stronger evidence than the second report's inconsistency about a single detail.`,
      `Treat the reports as uncertain but immediately adjust your plans for the possibility of defeat, because waiting for certainty may impose greater costs than preparing for a dangerous scenario.`,
      `Reject both reports until a surviving officer confirms them, because contradictory accounts make the messengers too unreliable to justify changing military plans.`,
      `Assume the second messenger is more reliable because arriving later gives him more opportunity to receive updated information about the battle and its aftermath.`
    ],
    correctIndex: 1,
  },

  {
    text: `A farmer asks your party to settle a dispute with a neighbor over a damaged fence. The farmer says his neighbor deliberately broke it to let animals into his crops. The neighbor says the fence collapsed during a storm. You inspect the fence and find that several posts are rotten while one has a fresh axe mark. The farmer owns an axe matching the width of the mark. The neighbor's animals were found inside the field, but the farmer admits he moved them there after discovering the damage. Both men have been feuding for years. What is the most defensible conclusion?`,
    options: [
      `The farmer probably damaged the fence because the axe mark matches his tool and he has a direct conflict with the neighbor.`,
      `The neighbor probably caused the damage because his animals were found inside the field and he benefits from the fence being open.`,
      `The fence was likely already failing, but the fresh axe mark means deliberate interference remains possible and cannot be resolved from the current evidence alone.`,
      `The long-standing feud makes both accounts too biased to trust, so the dispute should be treated as a private matter rather than investigated further.`
    ],
    correctIndex: 2,
  },

  {
    text: `A companion tells you that another member of the party has been secretly taking extra shares of food. The accusation comes with a precise count of missing portions. You check the supplies and find that the count is accurate. The accused person says they have been giving some food to a sick animal outside camp. You later discover evidence that an animal has indeed been eating near the campsite. The accuser insists this is irrelevant because "taking party food without asking is still theft." The accused never told anyone about the animal. What should be separated before judging the situation?`,
    options: [
      `Whether the accused took the food and whether they had permission are distinct questions from whether the food was ultimately used for a sympathetic purpose.`,
      `Whether the animal was genuinely sick should determine the matter because a compassionate reason can justify taking resources that would otherwise be considered stolen.`,
      `Whether the accuser knew about the animal should determine the credibility of the accusation because failing to mention relevant context makes the report potentially malicious.`,
      `Whether the party's food supply can tolerate the missing portions should be the main consideration because intent matters less when the material consequences are small.`
    ],
    correctIndex: 0,
  },

  {
    text: `A city introduces a new law requiring travelers to register magical weapons. A magistrate says the rule is necessary because several recent crimes involved enchanted blades. A merchant argues the law is really intended to weaken independent adventurers. You learn that violent incidents involving magical weapons have increased, but the city has also recently granted the magistrate's family a contract to provide security services. The law applies equally to citizens and visitors. Registration takes ten minutes and costs a small fee. What is the most useful way to assess the situation?`,
    options: [
      `The magistrate's family's financial interest should make the law suspect because a conflict of interest undermines the credibility of the stated safety justification.`,
      `The increase in magical-weapon crimes should make the law reasonable because the city has identified a genuine security problem that the regulation could address.`,
      `The merchant's concern should be taken seriously because restrictions affecting adventurers may have political consequences even when they are presented as neutral safety measures.`,
      `The law's justification and the magistrate's personal incentive should be evaluated separately, including whether registration actually addresses the identified risk rather than assuming either motive settles the question.`
    ],
    correctIndex: 3,
  },

  {
    text: `A scout reports that a bridge ahead has collapsed. He says he saw the damage himself. A second scout says the bridge is intact but admits he viewed it from a distance through heavy rain. The first scout is known for being cautious and has previously delayed parties unnecessarily. The second scout is known for taking risks. Your map shows no alternate crossing for twenty miles. The river is currently swollen. What should your party do?`,
    options: [
      `Trust the first scout because direct observation of the bridge is stronger evidence than a distant observation made under poor conditions.`,
      `Trust the second scout because the first scout's history of excessive caution suggests his report may again exaggerate the danger.`,
      `Approach the bridge carefully enough to verify its condition without committing the party to crossing, provided doing so does not itself create an unacceptable risk.`,
      `Avoid the river entirely because the consequences of a collapsed bridge are severe enough that uncertainty should always favor retreat.`
    ],
    correctIndex: 2,
  },

  {
    text: `A respected elder asks your party to remove a young man from the village because he has become "dangerously unpredictable." The elder cites three recent arguments and says several villagers are afraid of him. The young man admits the arguments but says each began after the elder's family took land belonging to his parents. Two witnesses support the elder, while another says the young man has never threatened anyone physically. You find no evidence of violence. The village wants you to act before the dispute escalates. What should be your primary concern?`,
    options: [
      `Whether the young man's behavior creates a concrete and imminent risk rather than treating social conflict and anger as equivalent to a demonstrated threat of violence.`,
      `Whether the elder's witnesses are telling the truth, because their testimony is necessary to establish whether the young man has actually become dangerous.`,
      `Whether the land dispute is legitimate, because resolving the original grievance may remove the emotional cause of the young man's recent behavior.`,
      `Whether the villagers are frightened enough to justify intervention, because a community's collective perception of danger can itself become destabilizing if ignored.`
    ],
    correctIndex: 0,
  },

  {
    text: `A wizard offers to remove a curse from one of your companions. He explains that the procedure has a 70 percent chance of success and a 10 percent chance of permanently worsening the curse. The remaining cases produce no meaningful change. The companion currently suffers from the curse but can function normally with minor discomfort. A second wizard claims the first is exaggerating the danger because he wants to sell an alternative treatment later. Neither wizard can provide independent evidence for their claims. What should matter most?`,
    options: [
      `The first wizard's stated success rate, because quantified information is more useful than the second wizard's unsupported accusation about his motives.`,
      `The companion's current ability to function, because an intervention with a meaningful chance of permanent harm should require stronger justification when the existing condition is manageable.`,
      `The second wizard's warning, because a competing expert has identified a potential conflict of interest in the first wizard's recommendation.`,
      `The possibility of permanent worsening, because avoiding irreversible harm should take priority over the uncertain possibility of improving a condition that is already tolerable.`
    ],
    correctIndex: 1,
  },

  {
    text: `A caravan master tells you that one of his guards has been stealing from travelers. The guard denies it and says the master wants him gone because he refused to participate in an illegal side business. The master produces three complaints from travelers, but each complaint describes missing goods from a different caravan and none identifies the guard directly. The guard has access to the cargo while traveling. A second guard says he has never seen the accused steal anything but admits the accused has argued with the master. What is the most appropriate interpretation?`,
    options: [
      `The complaints make the guard the most likely culprit because repeated losses combined with access to the cargo create a meaningful pattern even without direct observation.`,
      `The master's accusation should be treated cautiously because the alleged thefts also fit the possibility of a broader problem involving cargo security or other people with access.`,
      `The second guard's inability to provide direct evidence should reduce confidence in the accusation because a fellow guard would likely have noticed repeated theft.`,
      `The guard's claim about illegal business should be investigated first because proving the master's misconduct could establish a motive for fabricating the theft accusation.`
    ],
    correctIndex: 1,
  },

  {
    text: `A group of villagers claims a forest shrine has become haunted because anyone who spends the night nearby experiences nightmares. A ranger says the area is harmless and attributes the stories to fear. You spend one evening there and experience no unusual dreams. Later, you discover that several villagers who reported nightmares had recently been sleeping in a nearby cave where a strange-smelling fungus grows. The ranger had never inspected the cave. What should your experience change?`,
    options: [
      `It should substantially reduce confidence in the haunting because your personal experience provides direct evidence that the claimed effect does not occur reliably.`,
      `It should have limited influence because one person's failure to experience the phenomenon does not explain why several others reported similar symptoms.`,
      `It should support the ranger's explanation because the absence of nightmares during a controlled observation suggests fear is causing the reports.`,
      `It should be treated as evidence against the villagers because firsthand experience is more reliable than secondhand stories about supernatural events.`
    ],
    correctIndex: 1,
  },

  {
    text: `A powerful noble offers your party protection if you publicly support his claim to a disputed piece of land. He says the opposing family has falsified its records and provides several documents that appear authentic. The opposing family says the noble has threatened witnesses. One witness confirms receiving a threat but admits he was already paid by the opposing family before speaking. The land has belonged to the same families for generations, but records from a fire decades ago are missing. Supporting either side could bring significant benefits or retaliation. What should your party seek before taking a public position?`,
    options: [
      `A trusted authority's opinion, because a neutral legal judgment would be more reliable than competing testimony from parties who both have strong incentives to influence you.`,
      `The oldest surviving records, because historical ownership is the central question and documents are less vulnerable to the motives and emotions affecting current witnesses.`,
      `Information that could independently test the disputed claims, because both sides have incentives to present favorable evidence and the cost of choosing incorrectly is unusually high.`,
      `Evidence of threats and payments, because determining which side is behaving improperly would reveal which claimant is more likely to be acting in bad faith.`
    ],
    correctIndex: 2,
  },

  {
    text: `A party member proposes taking a shortcut through an abandoned mine. He says he explored part of it years ago and remembers a dry passage that exits near your destination. Another member warns that old mines often collapse. You find a recent set of footprints entering the mine but none returning. The shortcut would save two days of travel. The longer route passes through territory where bandits have recently been reported, although no attack has occurred in over a month. You must choose before nightfall. Which consideration is most important?`,
    options: [
      `The footprints inside the mine, because they show recent activity and therefore make the shortcut more likely to be navigable despite its age.`,
      `The absence of recent bandit attacks, because the longer route has a known threat that appears to have diminished while the mine's hazards are mostly hypothetical.`,
      `The party member's previous experience, because someone who has personally navigated the mine has more relevant knowledge than general warnings about abandoned tunnels.`,
      `The reversibility of the choices, because entering an unstable mine may create a situation that cannot be safely exited, while delaying or rerouting remains easier to reconsider.`
    ],
    correctIndex: 3,
  },

  {
    text: `A merchant accuses a rival of spreading false rumors about his business. The merchant presents several customers who say they heard the same rumor. The rival denies spreading it but admits telling one customer that the merchant had "questions to answer." You investigate and discover that the rumor began before the rival made that statement. However, the rival's wording may have helped it spread. The merchant wants you to publicly clear his name. What conclusion is best supported?`,
    options: [
      `The rival probably started the rumor because his hostile statement demonstrates that he had a motive to damage the merchant's reputation.`,
      `The rival did not start the rumor because it existed before his statement, so any later contribution to spreading it is a separate and less important issue.`,
      `The rival may have contributed to the rumor's spread without being its originator, so responsibility for creating the claim and responsibility for amplifying it should be distinguished.`,
      `The customers' consistent reports establish that the rumor is widespread enough to require a public response regardless of who originally created it.`
    ],
    correctIndex: 2,
  },

  {
    text: `A healer tells you that a companion's recurring headaches are caused by a magical curse. Another healer says they are caused by exhaustion. The first healer detects a faint magical residue but admits that ordinary enchanted objects can produce similar traces. The second healer notes that the companion has slept poorly for several weeks. The headaches disappear for two days after the companion rests, then return after a difficult journey. The first healer says this proves the curse temporarily weakened. What should most increase or decrease confidence in the curse explanation?`,
    options: [
      `The magical residue should substantially increase confidence because it provides physical evidence that an enchantment exists near the companion.`,
      `The improvement after rest should decrease confidence because it provides a simpler explanation that predicts the observed change without requiring a curse.`,
      `The first healer's admission that ordinary objects can produce the same residue should make the magical evidence irrelevant to the diagnosis.`,
      `The recurrence after travel should increase confidence because ordinary fatigue should not produce symptoms that disappear and return so consistently.`
    ],
    correctIndex: 1,
  },

  {
    text: `A captain asks your party to escort prisoners through a town. He says one prisoner is especially dangerous and should remain chained separately. The prisoner appears calm and cooperative. Another prisoner says the captain has singled him out because they argued earlier. The captain's written report says the prisoner attacked two guards, but the guards involved are not available for questioning. You notice the prisoner has an old scar on his wrist consistent with restraints but no obvious recent injuries. What should you avoid doing?`,
    options: [
      `Avoid assuming the prisoner's calm behavior proves the captain's warning is false, because demeanor alone provides weak evidence about what someone has previously done.`,
      `Avoid treating the captain's written report as conclusive, because it records an allegation from interested parties rather than independently establishing what happened.`,
      `Avoid separating the prisoner from the others, because isolation itself may create unnecessary tension and the prisoner has not demonstrated dangerous behavior in your presence.`,
      `Avoid allowing the other prisoners' account to determine the issue, because they may have reasons to protect one another or undermine the captain.`
    ],
    correctIndex: 2,
  },

  {
    text: `A village has begun refusing entry to travelers after several thefts. The mayor says outsiders are responsible because all reported suspects were unknown to the village. A traveler says the policy is discriminatory and points out that the thefts occurred mostly at night when local guards were understaffed. You examine the reports and discover that two suspects were indeed outsiders, while three reports contain no suspect description at all. The mayor argues that outsiders are therefore the most likely cause. What is the strongest criticism of that reasoning?`,
    options: [
      `The mayor is relying on incomplete information because identifying some outsiders among the suspects does not establish that outsiders caused the thefts with greater frequency than local residents.`,
      `The traveler's criticism is stronger because the guards' staffing problems provide a concrete alternative explanation for the thefts that does not depend on assumptions about outsiders.`,
      `The mayor's policy is probably motivated by fear because blaming outsiders is a common response when communities experience unexplained crime.`,
      `The reports should be disregarded because the lack of descriptions in several cases means none of the remaining reports can reliably identify suspects.`
    ],
    correctIndex: 0,
  },

  {
    text: `A wizard offers to predict whether your expedition will succeed. He asks for a substantial payment and performs a ritual that produces an impressive vision of your party standing outside a ruined fortress. He says the vision proves you will reach the fortress but warns that the final outcome depends on your choices. A skeptical companion says the vision is meaningless theater. Another companion argues that the wizard would not charge so much unless he had genuine ability. The wizard has a reputation for accurate predictions, but you cannot independently verify how often he has been wrong. How should you evaluate the prediction?`,
    options: [
      `The wizard's reputation and demonstrated ritual should increase confidence somewhat, but without knowing the rate of failed predictions the vision provides little basis for estimating its reliability.`,
      `The prediction should be ignored because supernatural forecasting cannot be independently verified and therefore cannot contribute meaningfully to a rational decision.`,
      `The payment should increase confidence because people generally would not risk their reputation and livelihood by charging heavily for a service that consistently fails.`,
      `The vision should be treated as useful evidence because the wizard's reputation provides an established track record even if the exact number of failed predictions is unavailable.`
    ],
    correctIndex: 0,
  },

  {
    text: `Your party finds a wounded enemy soldier after a battle. He says his unit has retreated and that the road ahead is safe. He is carrying a map that marks several defensive positions, but he claims those positions have been abandoned. A party member wants to trust him because he is badly wounded. Another says the map proves he is still trying to mislead you. You have no way to verify the map immediately. The road is the fastest route to your destination. What should guide your decision?`,
    options: [
      `His physical condition should increase confidence because someone who is badly wounded has less practical reason to maintain a military deception.`,
      `The map should be treated as evidence that the road may still be defended, but neither the map nor his statement should be treated as conclusive without considering how each could be misleading.`,
      `His statement should be rejected because enemy soldiers have an obvious reason to deceive you even when their personal circumstances make deception difficult.`,
      `The road should be avoided because any information supplied by an enemy during wartime is too compromised to justify acting on it.`
    ],
    correctIndex: 1,
  },

  {
    text: `A young adventurer repeatedly volunteers to negotiate with strangers because he believes he is particularly good at reading people. Several negotiations have gone well. In one recent case, however, he accepted a contract with unusually vague terms because the other party "felt trustworthy." The contract later caused the party financial losses. He argues that the outcome was unlucky and that refusing the contract would have lost an important opportunity. Another companion says this proves he cannot judge character at all. What is the most useful lesson?`,
    options: [
      `His previous successful negotiations should still carry significant weight because one bad outcome does not invalidate a demonstrated ability to establish rapport with strangers.`,
      `The failed contract shows that intuitive judgments about people are unreliable, so important negotiations should always be handled through written safeguards instead of personal impressions.`,
      `The problem was less likely his ability to read people than his decision to let that impression substitute for examining the contract's concrete risks and ambiguities.`,
      `The other companion's criticism is exaggerated because the contract's outcome depended on external circumstances that cannot fairly be attributed to the adventurer's judgment.`
    ],
    correctIndex: 2,
  },

  {
    text: `A town's grain stores are running low. The steward proposes rationing immediately. A merchant says a large shipment will arrive in three days and claims rationing would cause unnecessary panic. The steward says the merchant is trying to protect his investment because he has already paid for the shipment. Records show that the shipment left its origin, but the road has recently been damaged by floods. The town has enough grain for four days at normal consumption. Rationing would extend supplies for a week but could cause unrest. What should the town consider first?`,
    options: [
      `Whether the merchant's financial interest makes his estimate unreliable, because the town should not base a critical food decision on information supplied by someone who benefits from normal consumption.`,
      `Whether the shipment's expected arrival is reliable enough to justify waiting, because the decision should depend on the probability and consequence of the shipment being delayed rather than on either person's motives.`,
      `Whether rationing would cause unrest, because social instability could create greater harm than temporarily exhausting the grain reserves.`,
      `Whether the steward has previously handled shortages successfully, because an experienced official is more likely to understand the practical consequences of rationing than a merchant.`
    ],
    correctIndex: 1,
  },

  {
    text: `A party member discovers that another companion has been secretly meeting a stranger outside camp. The meetings occur after dark and stop whenever anyone approaches. The companion says the stranger is a source of information but refuses to explain further. Another party member wants to confront them immediately. A third argues that secrecy itself is proof of betrayal. You later learn that the stranger has been providing information about a threat to the party, but you do not yet know why the companion kept it secret. What should your response prioritize?`,
    options: [
      `The fact that the information concerns a genuine threat should excuse the secrecy because the companion's intentions were ultimately beneficial to the party.`,
      `The secrecy should remain a concern because even useful information can create risks when one person controls an undisclosed relationship that affects the group's safety.`,
      `The companion should be confronted publicly because hidden relationships undermine trust even when the immediate information turns out to be accurate.`,
      `The stranger's usefulness should be investigated before judging the secrecy, because a source who provides valuable intelligence may justify keeping the relationship confidential.`
    ],
    correctIndex: 1,
  },

  {
    text: `A village healer asks your party to stop a mob from attacking a suspected witch. The suspected woman lives alone and has been seen performing strange rituals near the graves of several villagers. Three families claim their relatives became sick after arguing with her. The healer says the woman is actually conducting harmless mourning rites. You discover that the woman's rituals began only after the deaths, not before them. One sick villager recovered after leaving the area. Another died. What should most strongly affect your next action?`,
    options: [
      `The number of families making accusations should justify immediate protection of the village because several independent reports suggest the woman poses a real threat.`,
      `The harmless explanation should be accepted because the rituals began after the deaths, making it unlikely that she caused the original illnesses.`,
      `The immediate risk of mob violence should be separated from the unresolved cause of the illnesses, since protecting the woman from an unjust attack does not require deciding whether she is innocent.`,
      `The recovery of one villager after leaving the area should increase suspicion of the woman because it provides evidence connecting proximity to her with illness.`
    ],
    correctIndex: 2,
  },

  {
    text: `A commander tells your party that an enemy army is exhausted and recommends attacking before dawn. A scout reports seeing large numbers of enemy soldiers resting, while another reports that supply wagons have been moving steadily throughout the night. The commander says the wagons are probably carrying wounded soldiers away. The enemy's campfires are fewer than usual. Your own troops are tired from a long march. If you attack now, you may catch the enemy unprepared, but a failed attack could leave your force exposed. What is the most important uncertainty?`,
    options: [
      `Whether the enemy is actually exhausted enough that the potential surprise advantage outweighs the disadvantage of committing your own tired troops to combat.`,
      `Whether the supply wagons are carrying wounded soldiers, because determining their purpose would reveal whether the enemy is retreating or preparing for another movement.`,
      `Whether the reduced campfires indicate fewer soldiers, because the size of the enemy force is the most important factor in determining whether an attack can succeed.`,
      `Whether the commander has reliable intelligence, because a mistaken interpretation from leadership could expose the entire force to an avoidable defeat.`
    ],
    correctIndex: 0,
  },

  {
    text: `A farmer offers your party a rare medicinal herb and says it grows naturally on his land. A botanist traveling with you says the herb normally grows several days north of the region. The farmer explains that birds may have carried the seeds. You find several plants growing near a recently built irrigation channel. The farmer has no obvious reason to lie, but the herb is worth a great deal in the nearest city. He offers to sell you the entire harvest at a price far below the city rate. What should you investigate before deciding whether the offer is legitimate?`,
    options: [
      `Whether the farmer has an incentive to underprice the herbs because he may be unaware of their value or may need money quickly for another reason.`,
      `Whether the irrigation system could have altered local growing conditions, because establishing a plausible mechanism for the plants' presence is more useful than relying on assumptions about the farmer's honesty.`,
      `Whether birds in the region are capable of carrying the herb's seeds, because the farmer's explanation should be verified before treating the plants as naturally occurring.`,
      `Whether the herbs are genuine, because the unusual location and low price create a substantial possibility that the farmer has substituted a similar-looking plant.`
    ],
    correctIndex: 1,
  },

  {
    text: `A respected captain tells your party that a particular road is safe because he has traveled it dozens of times. A younger scout says the road has changed because recent flooding exposed old ruins and created several new paths. The captain dismisses the scout as inexperienced. You inspect the map and discover it is more than a year old. The captain's experience is genuine, but none of his recent journeys occurred after the flooding. The scout has only traveled the road once since then. What should receive the most weight?`,
    options: [
      `The captain's greater experience, because repeated successful travel provides a stronger overall basis for judging the road than one recent observation.`,
      `The scout's recent observation, because information about changed conditions is more relevant than a larger history of experiences under different conditions.`,
      `Neither person's testimony, because the map is outdated and the conflicting accounts mean the road cannot currently be evaluated with sufficient confidence.`,
      `The flooding itself, because once a road has undergone major environmental changes, previous experience becomes largely irrelevant to deciding whether it remains safe.`
    ],
    correctIndex: 1,
  },

  {
    text: `A noble offers your party a large reward to retrieve a prisoner from a remote fortress. He says the prisoner is a dangerous traitor who stole military secrets. A former guard says the prisoner is actually a political dissident who learned something embarrassing about the noble. The guard provides a letter that appears to support this claim. The noble provides an official warrant naming the prisoner a traitor. Both documents could be forged. The prisoner is scheduled to be executed in two days. What is the most responsible immediate goal?`,
    options: [
      `Determine whether the noble's warrant is authentic because official documentation is the strongest available indication of the prisoner's legal status.`,
      `Determine what information the prisoner possesses, because learning the substance of the alleged secrets may reveal whether either side has a plausible motive for manipulating your party.`,
      `Determine whether the former guard is trustworthy, because the entire alternative account currently depends on testimony from someone with an unknown relationship to the prisoner.`,
      `Establish enough independent evidence to distinguish a genuine security threat from a political dispute before helping either side take irreversible action.`
    ],
    correctIndex: 3,
  },

  {
    text: `A party member becomes unusually withdrawn after receiving a letter. Another companion says the letter must contain bad news because the person has stopped joking and has begun volunteering for dangerous tasks. The withdrawn member insists everything is fine. You later learn that the letter concerned a debt owed by their family. They have not asked anyone for help and appear embarrassed when the subject comes up. What is the wisest response?`,
    options: [
      `Respect their claim that everything is fine because pressing someone about private family problems can create unnecessary shame and damage trust.`,
      `Offer practical help without demanding disclosure, because the observed behavior suggests a real problem while the exact nature of that problem remains their information to share.`,
      `Confront them about the dangerous behavior because volunteering for unnecessary risks indicates that their private problem is beginning to endanger the entire party.`,
      `Ask another companion to investigate the debt privately, because understanding the financial problem would allow the party to intervene without forcing the person to admit it.`
    ],
    correctIndex: 1,
  },

  {
    text: `A town guard tells you that a particular alley is dangerous after dark. He recommends taking a longer route. A local shopkeeper says the guard exaggerates because he wants travelers to pass his brother's business on the alternate road. You find that the alley has had three robberies this month, while the alternate road has had none. The guard's brother does own a shop on the alternate road. The robberies occurred on nights when the street lamps were broken. The lamps have since been repaired. What should most affect your choice?`,
    options: [
      `The guard's financial connection should make his recommendation suspect because he benefits directly from travelers using the alternate road.`,
      `The robbery history should favor avoiding the alley because repeated incidents provide stronger evidence of danger than the guard's possible financial incentive provides evidence of deception.`,
      `The repaired lamps should favor the alley because the conditions associated with the previous robberies have changed, reducing the relevance of historical incidents.`,
      `The shopkeeper's claim should be discounted because the guard's brother's business gives the shopkeeper a competing commercial interest in directing travelers elsewhere.`
    ],
    correctIndex: 2,
  },

  {
    text: `A scholar asks you to destroy a collection of books because she says they contain dangerous magical instructions. Another scholar says destroying them would erase valuable historical knowledge. You inspect the collection and find that most books are ordinary histories, while three contain obscure rituals. One ritual appears to describe a way to summon something dangerous, but the instructions are incomplete. The first scholar refuses to explain exactly what she fears. The second wants the collection preserved unchanged. What should be considered first?`,
    options: [
      `Whether the dangerous rituals can be securely isolated or contained, because destroying an entire collection may be unnecessary if the specific risk can be managed.`,
      `Whether the first scholar has previously encountered the magic described, because practical expertise would make her warning more credible than the second scholar's general concern for historical preservation.`,
      `Whether the incomplete ritual could actually function, because destroying material that cannot be used would impose an unnecessary loss of knowledge.`,
      `Whether the collection has unique historical value, because preservation should normally be preferred when the danger is uncertain and the materials are not currently being used.`
    ],
    correctIndex: 0,
  },

  {
    text: `A village elder asks your party to decide whether a bridge should remain open. The bridge is old and has visible cracks. A builder says it is unsafe and recommends immediate closure. Another builder says the cracks are superficial and the bridge could last for years. Both have inspected it. The bridge is the only route to a hospital for several nearby villages. Closing it would require a three-day detour. You cannot obtain a third expert until tomorrow. Heavy rain is expected tonight. What should guide the decision?`,
    options: [
      `Close the bridge because the potential consequences of structural failure are severe enough that uncertainty should favor preventing use until further inspection.`,
      `Keep the bridge open because the hospital route provides an important public benefit and one builder has judged the visible damage noncritical.`,
      `Restrict the bridge to light traffic until another inspection is possible, balancing the medical necessity against the possibility that heavy loads increase the structural risk.`,
      `Follow the builder with the stronger credentials, because technical disagreements should ultimately be resolved by giving greater weight to the more qualified professional.`
    ],
    correctIndex: 2,
  },

  {
    text: `A companion proposes buying information from a thief who claims to know where a missing noble is being held. The thief asks for a large payment and says the information must remain secret. He provides one detail that the party independently confirms: the noble's guards were recently moved from the western district. However, the thief refuses to identify his source. Another contact says the thief has sold false information before. The noble's location is becoming more urgent because an execution may occur soon. What should most influence whether you pay?`,
    options: [
      `The independently confirmed detail should substantially increase confidence because it demonstrates that the thief possesses at least some genuine information about the situation.`,
      `The thief's history of selling false information should outweigh the confirmed detail because a known pattern of deception makes any additional claim unsafe to rely upon.`,
      `The urgency of the situation should justify paying despite uncertainty because the cost of missing a genuine opportunity may be greater than the cost of losing the payment.`,
      `The most important question is whether the payment can be structured so that the thief bears some cost for false information rather than receiving the full reward regardless of accuracy.`
    ],
    correctIndex: 3,
  },

  {
    text: `A soldier tells your party that his commander is secretly selling military supplies. He provides dates and locations where supplies allegedly disappeared. The commander denies it and says the soldier is angry because he was denied promotion. Records confirm that supplies did disappear on two of the dates, but no records identify where they went. The soldier was present during both incidents. The commander has authority over the records. A second soldier says the accused commander is known for being strict but has never personally seen him steal. What should you conclude?`,
    options: [
      `The soldier's accusation is credible because his specific details were independently supported by missing supplies on the dates he identified.`,
      `The commander remains more likely innocent because the soldier has an obvious motive for retaliation and no direct evidence proves that the commander personally took anything.`,
      `The missing supplies make the accusation worth investigating, but they do not yet distinguish between the commander's alleged theft, another form of loss, or the soldier's own involvement.`,
      `The commander should be temporarily removed because his control over the records creates a conflict that prevents a fair investigation while he remains in charge.`
    ],
    correctIndex: 2,
  },

  {
    text: `A party member insists that another adventurer is lying about having been attacked on the road. The story sounds exaggerated, but the injured adventurer has wounds consistent with a fight. A broken wagon is found nearby. The accused party member points out that there are no bodies and no stolen goods. The injured adventurer says the attackers fled when they heard another caravan approaching. A passing merchant confirms seeing a damaged wagon but did not witness the attack. What is the most reasonable conclusion?`,
    options: [
      `The attack probably occurred because physical damage and injuries provide independent evidence that something violent happened even though the exact story remains uncertain.`,
      `The story is probably fabricated because the absence of bodies and stolen goods makes the claimed attack difficult to reconcile with the severity of the injuries.`,
      `The merchant's confirmation proves the adventurer was attacked because an independent witness has verified the damaged wagon associated with the story.`,
      `The accused party member is probably correct that the story is exaggerated because the lack of direct witnesses makes the injured adventurer's account inherently unreliable.`
    ],
    correctIndex: 0,
  },

  {
    text: `A local official tells your party that a recent plague is caused by outsiders bringing disease into the city. He points to the timing of the outbreak, which began shortly after several caravans arrived. A healer says the first known cases actually occurred in a neighborhood with no recent travelers. Records show the outbreak spread fastest in crowded buildings with poor sanitation. The official dismisses the records as incomplete. The city is considering restricting travelers. What should most weaken the official's explanation?`,
    options: [
      `The fact that caravans arrived shortly before the outbreak, because timing alone does not establish that travelers caused the disease rather than coinciding with its emergence.`,
      `The healer's claim about the first cases, because identifying an earlier case in a neighborhood without travelers directly contradicts the official's proposed source.`,
      `The pattern of faster spread in crowded, poorly sanitized buildings, because it provides an alternative mechanism that better explains differences in transmission within the city.`,
      `The incompleteness of the official records, because incomplete evidence cannot reasonably support a policy that restricts an entire group of travelers.`
    ],
    correctIndex: 2,
  },

  {
    text: `A wealthy adventurer offers to fund your party's expedition in exchange for half of anything you recover. He says he wants to support promising explorers and claims the arrangement is generous because he will assume all financial risk. A previous expedition funded by him ended in a dispute over ownership of artifacts. His contract for your party contains vague language about "discoveries associated with the expedition." He says the wording can be clarified later. You have little money of your own and cannot afford the expedition without him. What should concern you most?`,
    options: [
      `The previous dispute, because a repeated conflict over ownership suggests that disagreements are likely to arise again even if the current relationship begins amicably.`,
      `The investor's wealth, because someone who can easily afford the expedition has less reason to impose restrictive terms on adventurers who provide the actual labor.`,
      `The vague ownership language, because the central risk is not whether the patron seems generous but whether the contract allows both parties to interpret the eventual division differently.`,
      `The lack of personal funds, because dependence on the patron means the party has little negotiating power and may be forced to accept unfavorable terms.`
    ],
    correctIndex: 2,
  },

  {
    text: `A watch captain tells your party that a prisoner escaped because one guard fell asleep. The guard admits falling asleep but says the prisoner had already disappeared when he woke. Another guard says the prisoner was still present when the first guard took his post. The cell door shows no damage, and the lock was opened with a proper key. The captain immediately orders the sleeping guard arrested for negligence. You discover that three people possessed keys to the cell. What should the investigation focus on first?`,
    options: [
      `The sleeping guard's negligence, because falling asleep created an obvious opportunity and directly contributed to the prisoner's disappearance.`,
      `The three people with keys, because determining who could have legitimately opened the cell separates the opportunity for escape from the assumption that the sleeping guard caused it.`,
      `The escaped prisoner's abilities, because understanding whether the prisoner could have manipulated the lock without a key may explain why there was no physical damage.`,
      `The captain's decision to arrest the guard, because assigning blame immediately may indicate that leadership is attempting to conceal another person's involvement.`
    ],
    correctIndex: 1,
  },

  {
    text: `A traveler asks your party for directions and says she is trying to reach a monastery before nightfall. She knows the monastery's name, describes the local road accurately, and carries a letter bearing the monastery's seal. However, she asks unusually detailed questions about how many guards are stationed at a nearby bridge. A companion suspects she is scouting the area. The traveler explains that she is transporting medicine and wants to know whether the bridge is safe. You cannot verify the letter before the monastery closes. What is the most proportionate response?`,
    options: [
      `Refuse to provide any information because the unusual questions create enough suspicion that assisting her could expose the party or monastery to unnecessary risk.`,
      `Provide the route but avoid sharing tactical information about guards, because helping with ordinary travel does not require revealing details that would be useful for an attack.`,
      `Trust the letter and answer her questions because the monastery's seal provides independent evidence that she has a legitimate reason to travel there.`,
      `Escort her personally to the monastery because doing so allows the party to protect the traveler while observing whether her story remains consistent.`
    ],
    correctIndex: 1,
  },

  {
    text: `A village has begun holding nightly meetings because people believe someone among them is secretly working for a nearby enemy. The meetings have become increasingly accusatory. A respected elder says the traitor must be identified before the village is attacked. A young villager proposes that everyone report suspicious behavior anonymously. Another villager points out that several people have already been falsely accused after private disagreements. You learn that the enemy has not actually attacked the village or communicated with anyone inside it. What is the greatest immediate danger?`,
    options: [
      `The possibility of an actual traitor, because allowing an enemy agent to remain undiscovered could eventually create consequences that are difficult to reverse.`,
      `The lack of evidence for the suspected infiltration, because the village is escalating suspicion without first establishing that there is an enemy operation to uncover.`,
      `The anonymous reporting system, because it could encourage people to make accusations without accepting responsibility for the consequences of being wrong.`,
      `The elder's influence, because respected leaders can unintentionally turn ordinary disagreements into accusations when people assume their suspicions are informed by hidden knowledge.`
    ],
    correctIndex: 1,
  },

  {
    text: `A merchant caravan refuses to hire a particular guard because several workers say he is "bad luck." They point out that two caravans he guarded were attacked and one suffered a serious wagon accident. The guard says he was the only person who survived the first attack and that the second caravan ignored his warning about a damaged wheel. Records show both attacks occurred on roads that had unusually high crime rates. The caravan master still says customers will distrust the business if the guard is hired. What should most influence your judgment of the guard?`,
    options: [
      `The number of incidents associated with him, because repeated association between a person and disasters is unlikely to be entirely meaningless even if a causal mechanism is unclear.`,
      `The high-risk routes and the guard's account of the damaged wheel, because both incidents have plausible explanations that do not require the guard to cause or attract misfortune.`,
      `The customers' perception, because a guard who damages the caravan's reputation can create practical costs even if the superstition is irrational.`,
      `The guard's survival of the first attack, because surviving when others died suggests he may have known more about the threat than he admits.`
    ],
    correctIndex: 1,
  },

  {
    text: `A powerful mage offers to erase a painful memory from a party member. The mage says the memory is causing the person's current fear and that removing it will allow them to function normally. The party member wants the memory gone. Another companion warns that the memory may contain information about a past betrayal that the party has never fully investigated. The mage says the procedure cannot be undone. The party member insists the betrayal no longer matters. What should receive the greatest weight before consenting?`,
    options: [
      `The person's desire to remove the memory, because the decision concerns their own suffering and they should normally control what happens to their mind.`,
      `The possibility that the memory contains useful information, because preserving knowledge about a past betrayal may protect the party from repeating the same mistake.`,
      `The irreversible nature of the procedure, because removing information permanently is fundamentally different from temporarily treating the distress caused by remembering it.`,
      `The mage's expertise, because a trained practitioner is better positioned to determine whether the memory is harmful enough to justify permanent alteration.`
    ],
    correctIndex: 2,
  },

  {
    text: `A town's harvest fails unexpectedly. The mayor blames a neighboring village for secretly diverting water. The neighboring village denies it and says a landslide changed the river's course. You inspect the river and find evidence of a recent landslide upstream. However, you also find a newly constructed channel near the neighboring village that redirects some water. The neighboring villagers say the channel was built years ago and has always existed. The mayor demands immediate retaliation because the town will run out of food within weeks. What should happen first?`,
    options: [
      `Retaliate against the neighboring village because the new channel provides physical evidence that they are benefiting from the shortage.`,
      `Destroy the diversion channel because even if it predates the current shortage, removing it would restore water to the town while the dispute is investigated.`,
      `Determine whether the channel actually changed the amount and timing of water reaching the town, because its existence alone does not establish that it caused the current shortage.`,
      `Trust the landslide explanation because a natural event provides a simpler explanation for the river's changed course than deliberate interference by another village.`
    ],
    correctIndex: 2,
  },

  {
    text: `A companion claims that a wealthy noble is secretly funding bandits because several bandit attacks occurred near estates owned by the noble's rivals. The companion provides maps showing the locations. The noble says the attacks are harming his own trade and offers a large reward for whoever captures the bandits. You discover that the bandits have never attacked the noble's own caravans. However, the noble's estates are all located on roads used by his rivals. A captured bandit refuses to name their employer but says the attacks are "business." What is the strongest conclusion currently supported?`,
    options: [
      `The noble is probably funding the bandits because the geographic pattern favors his rivals being targeted while his own caravans remain unharmed.`,
      `The noble is probably innocent because the attacks also harm his trade and he has offered a reward for stopping them.`,
      `The evidence establishes a pattern worth investigating but does not yet distinguish deliberate sponsorship from bandits independently choosing profitable targets.`,
      `The captured bandit's statement strongly supports the noble's involvement because "business" suggests the attacks are financially organized rather than random.`
    ],
    correctIndex: 2,
  },

  {
    text: `A party member makes a serious mistake during an expedition and causes the loss of valuable supplies. They immediately admit what happened and explain that they ignored a warning because they believed the route was safe. Another member wants them removed from future decisions. The first member has otherwise made several good judgments during the journey. A third member says keeping them involved would demonstrate that mistakes are acceptable. The lost supplies cannot be recovered. What should determine their future role?`,
    options: [
      `The seriousness of the loss, because someone whose decision caused substantial harm should temporarily lose authority even if the mistake was admitted honestly.`,
      `Their willingness to admit the mistake, because accountability is more important than whether the decision itself turned out badly.`,
      `Whether the reasoning that produced the mistake reveals a recurring weakness that is likely to appear again, rather than treating one bad outcome as proof of general incompetence.`,
      `Their previous successful decisions, because a strong overall record should outweigh a single failure unless the failure demonstrates intentional recklessness.`
    ],
    correctIndex: 2,
  },

  {
    text: `A local guide tells your party that a particular forest path is safe and offers to lead you through it for a fee. A hunter says the path is dangerous because wolves have been seen nearby. The guide says the hunter exaggerates to protect his own hunting grounds. You discover wolf tracks near the path, but also find several fresh human footprints. The guide has traveled the path recently, while the hunter has lived nearby for twenty years. The path would save your party an entire day. What is the best next step?`,
    options: [
      `Trust the guide because recent firsthand knowledge is more relevant than the hunter's general familiarity with the forest.`,
      `Trust the hunter because long-term familiarity gives him better knowledge of recurring dangers than someone who may have traveled the path only once.`,
      `Investigate the fresh human tracks because determining whether the path is currently being used could provide information that distinguishes the competing explanations for the wolf activity.`,
      `Avoid the path because the presence of wolves creates a physical danger that cannot be justified merely by saving one day of travel.`
    ],
    correctIndex: 2,
  },

  {
    text: `A city official asks your party to arrest a popular street performer for inciting unrest. The official says the performer has been encouraging crowds to disobey the law. The performer says he has only been criticizing the city government. Several citizens support the performer, while others say his speeches have become increasingly hostile. You listen to one speech and hear criticism of the mayor but no direct call for violence. The official says the party cannot wait until violence occurs. What should most affect your immediate response?`,
    options: [
      `The official's warning should be taken seriously because preventing unrest may require action before explicit violence occurs.`,
      `The performer's popularity should matter because widespread support suggests his criticism reflects genuine public grievances rather than deliberate incitement.`,
      `The actual content and context of the performer's statements should be examined carefully rather than treating criticism, popularity, or the official's accusation as proof of intent.`,
      `The absence of an explicit call for violence should settle the matter because speech that does not directly advocate violence should not be treated as a threat.`
    ],
    correctIndex: 2,
  },

  {
    text: `A merchant offers your party two contracts. The first pays a large amount immediately but requires you to transport an unknown sealed package. The second pays half as much but clearly describes ordinary goods and allows inspection. The merchant says the sealed package contains valuable personal documents and that opening it would violate his privacy. He becomes defensive when asked why the documents are worth so much. The party needs money soon, but accepting the first contract could create legal or physical risks. What should be prioritized?`,
    options: [
      `The immediate payment, because the party's financial needs are concrete while the danger associated with the sealed package remains speculative.`,
      `The merchant's defensiveness, because his emotional reaction suggests he is concealing information that could make the first contract unsafe.`,
      `The ability to inspect or otherwise establish the package's nature and the party's legal exposure before accepting an obligation whose risks cannot currently be evaluated.`,
      `The safer contract, because when two opportunities differ mainly in uncertainty, the option with fewer unknowns should generally be preferred.`
    ],
    correctIndex: 2,
  },

  {
    text: `A young noble asks your party to secretly escort her out of the city. She says her family intends to force her into a marriage. She provides a forged-looking travel document and claims she cannot obtain a legitimate one without being discovered. A servant privately confirms that the family is arranging a marriage but says the noble is also trying to escape a debt. The noble denies owing money. The family offers your party a large reward to return her safely. The city guards have not issued any public warrant. What should you establish before acting?`,
    options: [
      `Whether the noble genuinely wants to leave, because her consent is the central issue when deciding whether helping her is appropriate.`,
      `Whether the family has a legal claim to return her, because assisting someone who is technically a fugitive could expose the party to consequences regardless of her reasons.`,
      `Whether the servant's account is accurate, because the existence of both marriage pressure and possible debt means the noble may be presenting only the part of the story that benefits her.`,
      `Whether there is an immediate threat to the noble's safety, because a time-sensitive danger could justify temporary assistance even if the larger dispute remains unresolved.`
    ],
    correctIndex: 3,
  },

  {
    text: `A town has hired your party to investigate why several wells have become contaminated. A local alchemist says a rival guild is dumping waste upstream. The rival guild denies this and says the contamination began after a new mine opened. You inspect the river and find unusual sediment near the mine, but the alchemist points out that the mine's drainage flows through an area controlled by the rival guild. The guild's workers insist they have never handled the substance found in the water. A laboratory test will take three days. The town's remaining clean water will last four days. What should the party recommend?`,
    options: [
      `Blame the mine immediately because the unusual sediment provides physical evidence and the remaining water supply makes delay dangerous.`,
      `Blame the rival guild because the drainage passes through its territory, giving it both opportunity and a possible incentive to conceal contamination.`,
      `Wait for the laboratory result because assigning responsibility before identifying the substance could lead to costly retaliation against the wrong party.`,
      `Begin emergency measures to secure alternative water while continuing the investigation, because the immediate health risk and the question of responsibility do not need to be solved by the same decision.`
    ],
    correctIndex: 3,
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

interface PreparedRound {
  text: string
  options: string[]
  correctIndex: number
}

function prepareRounds(): PreparedRound[] {
  const picked = shuffle(BANK).slice(0, ROUND_COUNT)
  return picked.map((t) => {
    const optionOrder = shuffle(t.options.map((_, i) => i))
    return {
      text: t.text,
      options: optionOrder.map((i) => t.options[i]),
      correctIndex: optionOrder.indexOf(t.correctIndex),
    }
  })
}

interface InsightScenarioTestProps {
  onComplete: (correctCount: number) => void
}

export default function InsightScenarioTest({ onComplete }: InsightScenarioTestProps) {
  const rounds = useMemo(prepareRounds, [])
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<number | null>(null)

  const round = rounds[index]

  const handleAnswer = (i: number) => {
    if (feedback !== null) return
    setFeedback(i)
    const isCorrect = i === round.correctIndex
    const nextCount = correctCount + (isCorrect ? 1 : 0)
    setCorrectCount(nextCount)
    setTimeout(() => {
      setFeedback(null)
      if (index + 1 >= ROUND_COUNT) {
        onComplete(nextCount)
      } else {
        setIndex(index + 1)
      }
    }, 1400)
  }

  return (
    <div className="insight-test">
      <p className="matrix-progress">
        Scenario {index + 1} of {ROUND_COUNT}
      </p>
      <p className="insight-text">{round.text}</p>
      <div className="insight-options">
        {round.options.map((opt, i) => (
          <button
            key={i}
            className={`insight-option ${feedback !== null && i === round.correctIndex ? 'insight-option--correct' : ''}`}
            onClick={() => handleAnswer(i)}
            disabled={feedback !== null}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
