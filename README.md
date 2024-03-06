# Draw Probability Calculator
A draw probability calculator customized for card games like Magic the Gathering.

This tool applies hypergeometric distribution calculations to determine probabilities. For magic, this tool supports london mulligans. I have given it my best shot on how this complex math works, and need a mathematician to confirm the logic! You can see the bottom of this readme for more details. 

https://savanaben.github.io/Draw-Probability-Calculator/

 ## Notes/to do
 - Fix category name method so it's index-based, and does not require unique text names. 
 - ~~Figure our accurate london mulligan method for multivariate calculations.~~
 - Extend linking logic so it's not capped at 4 categories.
 - Extend mulligan support (maybe go up to like 5/6 mulligans).
 - ~~Support adding more turns.~~ 

 ### Nice to haves
 - fancier link/multivariate logic, such as OR operator (what are the chances I draw a plains and an island, OR a dual land).
 - Group linked cards in the output visual in some way (connector line, within a box, include link name, even just adjacent)
 - Support variable draws per turn? (what if I have a lot of cantrips, scry, early-game draw, etc). 
 - support shuffling on any turn (fetch lands, etc, would change probabilities with london mulligan as the cards placed on the bottom sort of "re-enter" the random pool).
 - Some kind of integration with moxfield tags... (I imagine the groupings ppl use on moxfield might also be the groupings they'd want to know probabilities for.. (what are the chances I get x card from "creatures" or "removal")).

## Mulligan challenge
The main challenge I've faced with calculating mulligans is how to carry forward the increase in probabilities from turn 0 (the multiple opening hands you see) to your subsequent hands. This involves a complex nested combination of probabilities approach. Ultimately, I need a mathematician or a mulligan tool to confirm my work. 

My current attempt tries to break this apart into two calculations and then combine them:
1. Calculation 1 - the "applyLondonMulligan" and "applyLondonMulliganForLinkedGroups" functions handles turn 0 and mulliganing. they calculate the cumulative probability for each mulligan, if there are mulligans.
2. Calculation 2 -  the "calculateSingleGroup" and "calculateLinkedGroups" functions handle the subsequent turns, where you draw 1 card per turn. If there are no mulligans, they use the standard hypergeometric/multivariate equations. If there are mulligans, they will combine the probability from "applyLondonMulligan/applyLondonMulliganForLinkedGroups" with the subsequent turns probability. There are comments in the code (Calculation.svelte) that go over some assumptions and unfortunate band-aids I added. 

The "london" aspect of the london mulligan (placing x cards on the bottom of your deck, where x = number of mulligans) adds some assumptions and considerations:
- It's always assumed the desired card(s) are not in your hand, drawn, or placed on the bottom of the deck. 
- For calculation simplicity (in the code) I assume it does not matter (between your hand or the bottom of the deck) where these cards go, as in either location, they should not really be factored into the hypergeometric calculation. 
```let adjustedDeckSize = deckSize - (mulliganCount > 0 ? InitialDrawSize : 0);```
This line of code adjusts the "applyLondonMulligan" and "applyLondonMulliganForLinkedGroups". 
  - if no mulligan, don't adjust the deck and let the core hypergeometric calculation do its thing because we don't need to do cumulative probabilities. 
  - if there are mulligans, for subsequent turn calculations, imagine the deck is InitialDrawSize less cards (in magic, 7 cards less). I think we can do this because we now have two separate probabilities we combine:
    - mulligan step, which in-and-of-itself combines probabilities of multiple mulligans. 
    - subsequent turns step, which imagines a smaller deck because your InitialDrawSize hand is either in your hand OR on the bottom of the deck (due to the london mulligan). If it's on the bottom of the deck, we can discount those cards because we assume they are not the desired cards. 
