# Draw Probability Calculator
A draw probability calculator customized for card games like Magic the Gathering.

https://savanaben.github.io/Draw-Probability-Calculator/

This tool applies hypergeometric and monte carlo methods of calculation to determine probabilities. For magic, this tool also supports london mulligans. Probably the most unique aspect of this tool is the monte carlo calculation, which can simulate mana sources with multiple colors (a single card with multiple attributes, which hypergeometric math cannot handle) and casting ramp spells based on complex logic.

## The holy grails of backlog
- [mtgoncurve](https://deckulator.blogspot.com/2022/07/mulligans-and-probability-redrawing.html) uses [maximum bipartite matching](https://github.com/mtgoncurve/landlord/blob/master/lib/src/bipartite.rs) logic to handle mana sources with multiple colors. I don't know how this works! My method is more brute-force by calculating all possible combinations, and is much less efficient. A refactor of monte carlo simulation logic to somehow use bipartite matching method would drastically reduce load-times and increase accuracy.
- Support lands that enter tapped for monte simulation.

## bugs
- if the mana/card requirements are higher than the number of lands, app crashes. 

 ## Notes/backlog
 - would like an ability to set a land or ramp as "fetches land". This will improve simulation accuracy as it will factor thinning your deck and removing certain specific lands. Right now all ramp pieces just sort of act like mana rocks. See the comment chain [here](https://www.reddit.com/r/CompetitiveEDH/comments/1ex2bgg/simulate_how_well_your_ramp_package_is_working/).
 - add support for other common types of ramp. The most beneficial I can think of are 1-time use rituals (dark ritual, etc). Cost reducers are also fairly common, but probably not worth it in this tool given it's not supporting complex turns casting multiple spells. 
 - The monte carlo mulligan UX is not intuitive. Other tools will do something like "mulligan down to..x cards". What makes less sense is how my 1 free mulligan toggle sort of is additive, on-top of the Max mulligans.  
 - The hand simulation should maybe factor in "Total mana ramp can produce" when counting if the cards in your hand meet the requirements. for example, if a ramp spell can make BW and "total mana ramp can produce" is 2, perhaps this ramp should be looked at as two BW sources (almost like two lands). This is fuzzy logic... not sure on this. 
 - Inputting your deck via copy/paste. This is a lofty goal, all ramp spells would have to be mapped to simplified logic. 
 - The gray background cards in the output were a cool idea to give a sense of your hand/cards seen, but are not reliable. They don't factor variable draws per turn or playing cards in monte simulations. And they mess with the layout. Probably something to just remove. 
 - Fix hypergeometric group and link naming method so it's index-based, and does not require unique text names. 
 - ~~Figure out accurate london mulligan method for multivariate calculations.~~
 - Custom cards should not be allowed to be named "ANY" or "W", "U", "B", "R", "G", or "C", or else they are calculated as lands. Really, lands arrays should not be "naked" (maybe wrap in a better structure so this kind of problem does not happen).
 - Extend linking logic so it's not capped at 4 categories.
 - Extend hypergeometric mulligan support (maybe go up to like 5/6 mulligans).
 - ~~Support adding more turns.~~ 
 - ~~support advanced mana probability calculations~~

## Mathematical accuracy checks
- hypergeometric and multivatiate math is confirmed
- hypergeometric mulligan math is mostly confirmed, though not in complex situations with linked (multivariate) groups.
- Monte carlo advanced simulation checks:
   - When comparing my outputs to [mtgoncurve](https://mtgoncurve.com/), I sometimes note a 1-2% difference when adding in basic mulligan logic (no free mulligan, set the same max/min lands accepted, set mtgoncurve with a simple theoretical scenario like 25 plains and 74 Dawn Elementals to test a 4 cmc card). Set the monte carlo to 20k ish iterations for best accuracy in this simpler test. I don't know what could cause this, and some situations increase the margin more or less. I wonder if it has to do with the london aspect of london mulligan (confirm mtgoncurve is placing a sort of... non-wanted card on the bottom?).

 ## Known Accessibility to-do
 - Contents within the monte accordion (Advanced mana and...) need to not be in the tab index when the accordion is closed.
 - Focus needs to move to "cancel simulation" when the simulation modal opens. This is partially fixed but the focus visual state is not showing?? 
 - screen reader
   - ~~For some reason, the custom groups title label is not connecting to the input in step 2. Not sure why, as the mana inputs are.~~ 
   - In step 2, the mana labels need to be better (not "W", "plans"). Need to be careful not to mess with this as that value ("W") is used in the simulation too. 
   - more info popovers need toggle/open/closed declaration. 
   - I think the mana and custom cards need sub-grouping. like, a parent focus state that says "custom group name", and then you arrow or tab into that group. I can imagine screen readers would have some trouble connecting/grouping. 
   - when a user clicks "add custom group" or "add mana group", I think either focus should move to that new group, or an alert should be read out so the screen reader person knows to kind of backtrack and look for that group. Maybe both needs to happen. 
   - "click to copy email" in FAQs should prolly have an alert, like "email copied to clipboard". 
   - The probabilities output area feels functional to me, but it could be better. Maybe a table layout would be more understandable. Or focus group each row so it's easier to jump around. 
   
 ### Nice to haves
 - fancier link/multivariate logic, such as OR operator (what are the chances I draw a plains and an island, OR a dual land).
 - ~~Group linked cards in the output visual in some way (connector line, within a box, include link name, even just adjacent)~~
 - support shuffling on any turn (fetch lands, etc, would change probabilities with london mulligan as the cards placed on the bottom sort of "re-enter" the random pool).
 - Some kind of integration with moxfield tags... (I imagine the groupings ppl use on moxfield might also be the groupings they'd want to know probabilities for.. (what are the chances I get x card from "creatures" or "removal")).
 - I had considered supporting "enter tapped" flags and logic for the mana probabilities, but I am less convinced on how helpful this would be. For example, the tool could be expanded to say what the percent change is that you get 1,2,3, etc enter tapped lands. But often enter-tapped lands come with more consideration (can you play them in a way that still allows you to play what you want on a certain turn). Additionally, I think most people avoid tapped lands whenever possible, so a tool that somehow considered their impact might not be too helpful. 

## Mulligan challenge
The London mulligan calculations were the most challenging part of this project! I believe the calculations are correct given my outputs match Michael Moore's [guiding exemplar](https://deckulator.blogspot.com/2022/07/mulligans-and-probability-redrawing.html), as well as Kelvin Liu-Huang's [mtg combo calc](https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html).

There are two open aspects:
- My mulligan outputs are sometimes ~0.5% off from Kelvin's. Not sure if there's some rounding aspect that's causing this minor difference. It does not seem to ever reach significance. 
- Kelvin's tool does not support calculations with more than 1 desired card (ex - I have a 10 card group, and I want to get 2 of them). Because of this, I can't confirm that aspect of my calculations are correct. 

The "london" aspect of the london mulligan (placing x cards on the bottom of your deck, where x = number of mulligans) adds some assumptions and considerations:
- It's always assumed the desired card(s) are not in your hand, drawn, or placed on the bottom of the deck. 
- For calculation simplicity I assume it does not matter (between your hand or the bottom of the deck) where these london mulliganed cards go, as in either location, they should not really be factored into the hypergeometric calculation. The calculations assume the cards are still in your hand. My key assumption is that practically, this leads to the same probabilities because if the cards were on the bottom of the deck, they'd be known to be the furthest away.
