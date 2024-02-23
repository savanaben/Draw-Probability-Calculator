# Draw Probability Calculator
A hypergeometric distribution calculator customized for card games like Magic the Gathering. 

 ## Notes/to do
 - Fix category name method so it's index-based, and does not require unique text names. 
 - Figure our accurate london mulligan method.
 - Extend linking logic so it's not capped at 4 categories. 
 - ~~Support adding more turns.~~ 

 ### Nice to haves
 - fancier link/multivariate logic, such as OR operator (what are the chances I draw a plains and an island, OR a dual land).
 - Group linked cards in the output visual in some way (connector line, within a box, even just adjacent)
 - Support variable draws per turn? (what if I have a lot of cantrips, scry, early-game draw, etc). 
 - Some kind of integration with moxfield tags... (auto-group)

## Mulligan challenge
The main challenge I've faced with calculating mulligans is how to carry forward the increase in probabilities from turn 0 (the multiple opening hands you see) to your subsequent hands. This involves factoring in the London mulligan rule (cards are being returned to the bottom of your deck, changing the deck size on subsequent draws), as well as some way to combine the turn 0 probability calculations with subsequent "draw 1" turns. 

Currently the code is somewhat "dumb". I think I'm accurately calculating turn 0, but then I'm just adding the increased probability from multiple turn 0 hands to baseline hypergeometric turn 1, 2, 3, etc calculations. This does not feel accurate. 

To dig deeper, you'd want to focus on the Calculation.svelte file and the applyLondonMulligan, calculateSingleGroup, applyLondonMulliganForLinkedGroups, and calculateLinkedGroups functions. 

To help me, a specific step-by-step description of how the calculations would work (from turn 0 to subsequent turns) might be enough to get gpt to crack it. Or, I imagine this could be done more easily in python, and I could try converting python to js for this. 


Chatgpt helping describe my method:
1. Initial Probability: Start with the probability of drawing the desired combination without any mulligans. This is the base probability.
2. Iterating through Mulligans: For each mulligan taken, calculate the probability of drawing the desired combination in that mulligan scenario. This is done using the multivariateHypergeometricCDF function for linked groups or a similar calculation for single groups.
3. Combining Probabilities: Update the total probability by adding the probability of the current mulligan scenario, adjusted for the probabilities of previous mulligans. This adjustment is important because each mulligan scenario is conditional on not having achieved the desired combination in previous scenarios. Mathematically, this is expressed as:
- totalProbability += (1 - totalProbability) * probabilityThisMulligan;
- Here, probabilityThisMulligan is the probability of achieving the desired combination in the current mulligan scenario. The expression (1 - totalProbability) represents the probability of not having achieved the desired combination in previous scenarios. By multiplying these two probabilities and adding the result to the total probability, we're effectively combining the probabilities of all mulligan scenarios.
4. Final Total Probability: After considering all mulligans, the total probability represents the overall chance of drawing the desired combination after applying the London Mulligan rule.
