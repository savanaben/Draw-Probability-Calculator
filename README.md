# Draw Probability Calculator
A hypergeometric distribution calculator customized for card games like Magic the Gathering. 

https://savanaben.github.io/Draw-Probability-Calculator/

 ## Notes/to do
 - Fix category name method so it's index-based, and does not require unique text names. 
 - Figure our accurate london mulligan method for multivariate calculations.
 - Extend linking logic so it's not capped at 4 categories.
 - ~~Support adding more turns.~~ 

 ### Nice to haves
 - fancier link/multivariate logic, such as OR operator (what are the chances I draw a plains and an island, OR a dual land).
 - Group linked cards in the output visual in some way (connector line, within a box, include link name, even just adjacent)
 - Support variable draws per turn? (what if I have a lot of cantrips, scry, early-game draw, etc). 
 - support shuffling on any turn (fetch lands, etc, would change probabilities with london mulligan as the cards placed on the bottom "re-enter" the sort of random pool).
 - Some kind of integration with moxfield tags... (I imagine the groupings ppl use on moxfield might also be the groupings they'd want to know probabilities for.. (what are the chances I get x card from "creatures" or "removal")).

## Mulligan challenge
The main challenge I've faced with calculating mulligans is how to carry forward the increase in probabilities from turn 0 (the multiple opening hands you see) to your subsequent hands. This involves a somewhat complex nested combination of probabilities approach. Ultimately, I need a mathematician or a mulligan tool confirmed to work to confirm my work. 

My current attempt tries to break this apart into two calculations and the combine them:
1. calculation 1 - the "applyLondonMulligan" function handles turn 0 and mulliganing. It calculates the cumulative probability for each mulligan, if there are mulligans.
2. calculation 2 -  the "calculateSingleGroup" function handles the subsequent turns, where you draw 1 card per turn. If there are no mulligans, it uses the standard hypergeometric equation. If there are mulligans, it will combine the probability from "applyLondonMulligan" with the subsequent turns probability. There are comments in the code (Calculation.svelte) that go over some assumptions. 

The "london" aspect of the london mulligan adds some assumptions and considerations
- It's always assumed the desired card(s) are not in your hand, drawn, or placed on the bottom of the deck. 
- For calculation simplicity (in the code) I assume it does not matter (between your hand or the bottom of the deck) where these cards go, as in either location, they should not really be factored into the hypergeometric calculation. 

