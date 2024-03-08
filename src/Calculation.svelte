<script>
    import { groupColors } from './colorStore.js';


    // Function to calculate combinations (n choose k)
    function choose(n, k) {
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result *= (n + 1 - i) / i;
        }
        return result;
    }

    // Function to calculate hypergeometric CDF
    function hypergeometricCDF(x, N, K, n) {
        const Ckx = choose(K, x);
        const CnKxn = choose(N - K, n - x);
        const CnN = choose(N, n);
        return Ckx * CnKxn / CnN;
    }


//multivariateHypergeometricCDF 3 functions below





function multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn) {
    let totalProbability = 0;

    function calculate(groupIndex, cardsLeft, accumulatedProbability) {
        if (groupIndex === groupSizes.length) {
            return accumulatedProbability * choose(deckSize - sumGroupSizes(groupIndex), cardsLeft) / choose(deckSize, cardsDrawn);
        }

        let groupProb = 0;
        for (let i = groupCardsToDraw[groupIndex]; i <= Math.min(cardsLeft, groupSizes[groupIndex]); i++) {
            groupProb += calculate(groupIndex + 1, cardsLeft - i, accumulatedProbability * choose(groupSizes[groupIndex], i));
        }
        return groupProb;
    }

    function sumGroupSizes(upToIndex) {
        return groupSizes.slice(0, upToIndex).reduce((sum, size) => sum + size, 0);
    }

    return Math.min(1, calculate(0, cardsDrawn, 1));
}


function applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulligans, cardsDrawn) {
    let totalProbability = 0;

    for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
        let drawsThisMulligan = cardsDrawn;
        let probThisMulligan = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, drawsThisMulligan);
        totalProbability += (1 - totalProbability) * probThisMulligan;
    }

    return totalProbability;
}

function calculateLinkedGroups(linkedGroups) {
    const groupResults = [];
    const groupSizes = linkedGroups.map(group => group.size);
    const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    const linkName = linkedGroups[0].link;

    let initialProb = applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulliganCount, InitialDrawSize);
    groupResults.push({ turn: 0, probability: initialProb });

    let totalCardsSeen = mulliganCount > 0 ? 0 : InitialDrawSize;
    let adjustedDeckSize = deckSize - (mulliganCount > 0 ? InitialDrawSize : 0);

    let extendedNumberOfTurns = numberOfTurns + 10; // Extend the number of turns to ensure we have enough data to filter

    let allResults = [];

    for (let turn = 1; turn <= extendedNumberOfTurns; turn++) {
        totalCardsSeen += 1;
        let probAtLeastDesiredA = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, adjustedDeckSize, totalCardsSeen);
        if (mulliganCount > 0) {
            probAtLeastDesiredA = 1 - ((1 - initialProb) * (1 - probAtLeastDesiredA));
        }
        allResults.push({ turn, probability: probAtLeastDesiredA });
    }

    // Filter out consecutive duplicate probabilities. this is the same logic issue I faced in calculateSingleGroup. when mulliganing and there are greater groupCardsToDraw (cardsToDraw), I was getting early turn duplication that would increase (more early turns were showing the same probability) with increased groupCardsToDraw value. I could not find a pattern to why this was occuring. so I applied this bandaid fix that just pre-calculates the probabilities and removes duplicates :S. wellll it seems to work! I'd love help on this puzzling issue. 

    let filteredResults = allResults.filter((result, index, array) => {
        return index === 0 || result.probability !== array[index - 1].probability;
    });

    // Add the filtered results to groupResults, adjusting the turn numbers
    filteredResults.forEach((result, index) => {
        if (index < numberOfTurns && (mulliganCount === 0 || index > 0)) { // Skip turn 1 when there are mulligans. this is another bandaid. for some reason the above filter out duplicates logic does not capture turn 0 and turn 1. sooo this just skips turn 1 when there are mulligans, effectively removing the last remaining duplicate. 
            groupResults.push({ turn: index, probability: result.probability });
        }
    });

        // Add an extra turn if we skipped turn 1 due to mulligans. another compensation function to fix the display. without this the final card/turn is blank in the results. 
        if (mulliganCount > 0 && groupResults.length < numberOfTurns + 1) {
        groupResults.push({ turn: numberOfTurns, probability: filteredResults[numberOfTurns].probability });
    }

    results[linkName] = groupResults;
}




    export let groups = [];
    export let deckSize; // Received from App.svelte
    export let mulliganCount;
    export let InitialDrawSize; 



    let results = {};
    let numberOfTurns = 5; // Calculate probabilities up to certain numer of turn



    // Reactive statement to calculate probabilities when groups or numberOfTurns changes
    $: if (groups.length > 0 || numberOfTurns) {
    calculateProbabilities();
}


    function calculateProbabilities() {
    console.log('At start of calculateProbabilities, InitialDrawSize:', InitialDrawSize);
    console.log("Calculating probabilities for groups:", groups);
    results = {};
    console.log('Mulligan count at start of calculateProbabilities:', mulliganCount);


    // Group by links, excluding empty links
    const links = {};
    groups.forEach(group => {
        if (group.link && group.link.trim() !== '') { // Check for non-empty link
            if (!links[group.link]) links[group.link] = [];
            links[group.link].push(group);
        } else {
            calculateSingleGroup(group);
        }
    });

    // Calculate probabilities for linked groups
    for (const link in links) {
        calculateLinkedGroups(links[link]);
    }
}




function applyLondonMulligan(group) {
    let totalProbability = 0;

    for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
        let drawsThisMulligan = InitialDrawSize;
        let probThisMulligan = 0;
        for (let k = 0; k < group.cardsToDraw; k++) {
            probThisMulligan += hypergeometricCDF(k, deckSize, group.size, drawsThisMulligan);
        }
        totalProbability += (1 - totalProbability) * (1 - probThisMulligan);
    }

    return totalProbability;
}




function calculateSingleGroup(group) {
    const groupResults = [];
    let initialProb = applyLondonMulligan(group);
    groupResults.push({ turn: 0, probability: initialProb });

    let totalCardsSeen = mulliganCount > 0 ? 0 : InitialDrawSize;
    let adjustedDeckSize = deckSize - (mulliganCount > 0 ? InitialDrawSize : 0);
    // Decrease deck size of subseiqent turns if there are mulligans. the deck size is reduced because when mulliganing, the subsequent turns are separate calculations that are combined with the turn 0 mulligans, and we assume the cards in your hand are not the desired cards. also note that this sort of factors the london mulligan aspect of putting x cards on the bottom of your library based on the # of times you mulligan. the assumption is you'd put none-desired cards on the bottom, so for the sake of caluculations, imagining these cards are in your hand (and not in the deck) feels similar to if they are on the bottom (you know the cards above them must have the desired card, so you can discount them i think)


    let extendedNumberOfTurns = numberOfTurns + (mulliganCount > 0 ? group.cardsToDraw - 1 : 0);
    // Extend the loop to compensate for skipped turns when there are mulligans. this is band-aid logic! I don't know why, if I don't have this, early turns (turn 1, 2, 3, etc) will duplicate turn 0 values a number of times equal to the cardsToDraw value). so I'm just skipping early loops to compensate... 


    for (let turn = 1; turn <= extendedNumberOfTurns; turn++) {
        totalCardsSeen += 1;

        let probAtLeastDesiredA = 0;
        for (let k = group.cardsToDraw; k <= Math.min(totalCardsSeen, group.size); k++) {
            probAtLeastDesiredA += hypergeometricCDF(k, adjustedDeckSize, group.size, totalCardsSeen);
        }

        if (mulliganCount > 0) {
            // Combine the probability from turn 0 with the probability of drawing additional cards
            probAtLeastDesiredA = 1 - ((1 - initialProb) * (1 - probAtLeastDesiredA));
        }

        if (mulliganCount === 0 || turn >= group.cardsToDraw) {
            groupResults.push({ turn: turn - (mulliganCount > 0 ? group.cardsToDraw - 1 : 0), probability: probAtLeastDesiredA });
        }
         // Skip adding the first few probabilities when there are mulligans. this is band-aid logic! I don't know why, if I don't have this, early turns (turn 1, 2, 3, etc) will duplicate turn 0 values a number of times equal to the cardsToDraw value). so I'm just skipping early loops to compensate... 

    }

    results[group.name] = groupResults;
}













function createGroupCards(groups, results, turn) {
    let cards = groups.map(group => {
        let groupName = group.link ? group.link : group.name;
        let groupResult = results[groupName];
        let probabilityPercent = groupResult && turn < groupResult.length ? Math.round(groupResult[turn].probability * 1000) / 10 : null;
        
        // Determine the ratio representation
        let ratioText = convertPercentToRatio(probabilityPercent);

        // Access the color from the groupColors store
        let color = $groupColors[groupName] || '#e5e5e5'; // Default color if not set

        return { probability: probabilityPercent, label: group.name, color, ratioText };
    });

    // Fill up the remaining cards for the turn with blanks, adjusting for mulligans
    let adjustedDrawSize = Math.max(InitialDrawSize - mulliganCount, 0); // Ensure it doesn't go below 0
    while (cards.length < adjustedDrawSize + turn) {
        cards.push({ probability: null, label: '', ratioText: '' });
    }

    return cards;
}

function convertPercentToRatio(percent) {
    if (percent === null) return '';

    // Directly map the percentage to a scale of 20
    let number = Math.round((percent / 100) * 20);

    return `${number} out of 20`;
}







const presetColors = [
    "#DCEDC8", // Example colors
    "#B2DFDB",
    "#FFE0B2",
    "#E1BEE7",
    "#B3E5FC",
    "#FFCCBC",
    "#C5CAE9"
];

function assignGroupColors(groups) {
        let colorIndex = 0;
        let updatedColors = {};

        // First, assign colors based on unique names or links
        groups.forEach(group => {
            if (!updatedColors[group.name]) {
                updatedColors[group.name] = presetColors[colorIndex % presetColors.length];
                colorIndex++;
            }
        });

        // Next, ensure linked groups share the same color
        groups.forEach(group => {
            if (group.link && group.link.trim() !== '') {
                updatedColors[group.link] = updatedColors[group.name];
            }
        });

        groupColors.set(updatedColors); // Update the store with new color mappings
    }

    $: if (groups.length > 0) {
        assignGroupColors(groups);
        calculateProbabilities();
    }


    function generateTurnsArray(numberOfTurns) {
    return Array.from({ length: numberOfTurns + 1 }, (_, i) => i);
}


</script>

<h2 style="text-align: center;">Probabilities</h2>
<div class="output-diagram">
    {#each generateTurnsArray(numberOfTurns) as _, turn}
        <div class="turn-row">
            <div class="turn-label">
                Turn {turn}:<br>
                <i>({turn === 0 ? `Draw ${InitialDrawSize}` : 'Draw 1'})</i>
            </div>
            <div class="card-rectangles">
                {#each createGroupCards(groups, results, turn) as card}
                    <div class="card-container">
                        <div class="rectangle" style="background-color: {card.color}">
                            <div class="card-details">
                                <div class="probability">{card.probability !== null ? `${card.probability}%` : ''}</div>
                                <div class="card-ratio">{card.ratioText}</div>
                            </div>
                        </div>
                        <div class="card-label">{card.label}</div>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<div class="deck-size-container">
    <label for="deckSize">Number of turns:</label>
    <input type="number" class="deckSize" bind:value={numberOfTurns} min="1" />
</div>

<style>
.output-diagram {
    max-width: 100%; /* Adjust based on your layout */
    overflow-x: auto; /* Enables horizontal scrolling */
    white-space: nowrap; /* Keeps the inner content on a single line */
    -webkit-overflow-scrolling: touch; /* Improves scrolling on touch devices */
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: #888 #e0e0e0; /* For Firefox */
}

.output-diagram::-webkit-scrollbar {
    height: 12px; /* Height of the scrollbar */
}

.output-diagram::-webkit-scrollbar-track {
    background: #e0e0e0; /* Color of the track */
    border-radius: 30px;
}

.output-diagram::-webkit-scrollbar-thumb {
    background-color: #a8a8a8; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Rounded corners of the scrollbar thumb */
    border: 4px solid #e0e0e0; /* Creates padding around the scrollbar thumb */
}

.deck-size-container {
        display: flex;
        align-items: center;
        margin-top: 12px;
        margin-left: 60px;
    }

    .deckSize {
max-width: 65px;
}

input {
        padding: 6px;
        margin: 0px;
        min-width: 45px;
    }



label {
        margin-right: 10px;

    }

.turn-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.turn-label {
    margin-right: 10px;
    font-weight: bold;
    white-space: nowrap;
}

.turn-label i {
    font-style: italic;
    font-weight: 400;
    font-size: 14px;
}

.card-rectangles {
    display: inline-flex; /* Changes from flex to inline-flex */
    flex-wrap: nowrap; /* Prevents wrapping */
}

.card-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 5px;
}

.rectangle {
    position: relative;
    width: 40px;
    height: 60px;
    display: flex;
    justify-content: center;
    flex-direction: column; /* Stack children vertically */
    align-items: center;
    border: 1px solid rgb(142, 142, 142);
    font-size: 0.8em;
    text-align: center;
    border-radius: 4px;
    background-color: rgb(231, 231, 231);
    padding: 6px; /* Add padding for spacing */
}

.card-details {
    display: flex;
    flex-direction: column; /* Stack ratio and probability vertically */
    align-items: center;
    justify-content: space-around; /* Distribute space above and below */
    height: 100%; /* Take full height of parent to align items vertically */
}

.card-ratio {
    font-size: 1em;
    margin-top: 4px; /* Adjust as needed */
    font-style: italic;
    white-space: normal; /* Allows text to wrap */
    word-break: break-word; /* Ensures long words do not overflow */
    text-align: center; /* Keeps the text centered */
}

.probability {
    font-size: 1.1em;
    font-weight: bold;
}

.card-label {
    margin: 5px;
    font-size: 0.7em;
    text-align: center;
}


</style>