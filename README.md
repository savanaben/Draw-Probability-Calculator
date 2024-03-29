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
 - Support variable draws per turn? (what if I have a lot of cantrips, scry, early-game draw, etc). I'm imagining a dropdown next to each "draw x" line, which could let you increase that value by 1-3. consider if scry can be supported in a similar way (assume you always pitch a card to the bottom if it's not a desired card?) 
 - support shuffling on any turn (fetch lands, etc, would change probabilities with london mulligan as the cards placed on the bottom sort of "re-enter" the random pool).
 - Some kind of integration with moxfield tags... (I imagine the groupings ppl use on moxfield might also be the groupings they'd want to know probabilities for.. (what are the chances I get x card from "creatures" or "removal")).

## Mulligan challenge
The London mulligan calculations were the most challenging part of this project! I believe the calculations are correct given my outputs match Michael Moore's [guiding exemplar](https://deckulator.blogspot.com/2022/07/mulligans-and-probability-redrawing.html), as well as Kelvin Liu-Huang's [mtg combo calc](https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html).

There are two open aspects:
- My mulligan outputs are sometimes ~0.5% off from Kelvin's. Not sure if there's some rounding aspect that's causing this minor difference. It does not seem to ever reach significance. 
- Kelvin's tool does not support calculations with more than 1 desired card (ex - I have a 10 card group, and I want to get 2 of them). Because of this, I can't confirm that aspect of my calculations are correct. 

The "london" aspect of the london mulligan (placing x cards on the bottom of your deck, where x = number of mulligans) adds some assumptions and considerations:
- It's always assumed the desired card(s) are not in your hand, drawn, or placed on the bottom of the deck. 
- For calculation simplicity I assume it does not matter (between your hand or the bottom of the deck) where these london mulliganed cards go, as in either location, they should not really be factored into the hypergeometric calculation. The calculations assume the cards are still in your hand. My key assumption is that practically, this leads to the same probabilities because if the cards were on the bottom of the deck, they'd be known to be the furthest away.
