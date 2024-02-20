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


function calculateLinkedGroups(linkedGroups) {
    const groupResults = [];
    let cardsDrawn = InitialDrawSize; // Initial hand
    const groupSizes = linkedGroups.map(group => group.size);
    const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    const linkName = linkedGroups[0].link;
    let turn0Boost = 0;

    for (let turn = 0; turn <= numberOfTurns; turn++) {
        if (turn > 0) cardsDrawn += 1;

        let probability;
        if (turn === 0) {
            let baseProbability = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn);
            probability = applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulliganCount, cardsDrawn);
            turn0Boost = probability - baseProbability;
        } else {
            probability = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize - mulliganCount, cardsDrawn) + turn0Boost;
            probability = Math.min(1, probability);
        }

        groupResults.push({ turn, probability });
    }

    results[linkName] = groupResults;
}


    function logFactorial(n) {
    let result = 0;
    for (let i = 2; i <= n; i++) {
        result += Math.log(i);
    }
    return result;
}

function logChoose(n, k) {
    return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}


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
    let remainingDeckSize = deckSize;

    for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
        let probabilityThisMulligan = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, remainingDeckSize, cardsDrawn);
        totalProbability += (1 - totalProbability) * probabilityThisMulligan;

        remainingDeckSize -= 1; // One card put back for each mulligan
    }

    return Math.min(1, totalProbability);
}








    export let groups = [];
    export let deckSize; // Received from App.svelte
    export let mulliganCount;
    export let InitialDrawSize; 



    let results = {};
    let numberOfTurns = 5; // Calculate probabilities up to certain numer of turn



    // Reactive statement to calculate probabilities when groups change
    $: if (groups.length > 0) {
        calculateProbabilities();
    }




    function calculateProbabilities() {
    console.log('At start of calculateProbabilities, InitialDrawSize:', InitialDrawSize);
    console.log("Calculating probabilities for groups:", groups);
    results = {};

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





    function applyLondonMulligan(group, cardsDrawn, deckSize, mulligans) {
    let totalProbability = 0;
    let remainingDeckSize = deckSize;

    for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
        let probabilityThisMulligan = calculateProbabilityForHand(group, cardsDrawn, remainingDeckSize);
        totalProbability += (1 - totalProbability) * probabilityThisMulligan;

        remainingDeckSize -= 1; // One card put back for each mulligan
    }

    return Math.min(1, totalProbability);
}

function calculateProbabilityForHand(group, cardsDrawn) {
    let probability = 0;
    for (let x = group.cardsToDraw; x <= Math.min(group.size, cardsDrawn); x++) {
        probability += hypergeometricCDF(x, deckSize, group.size, cardsDrawn);
    }
    return probability;
}

function calculateSingleGroup(group) {
   
   
    console.log('Inside calculateSingleGroup, InitialDrawSize:', InitialDrawSize);



    const groupResults = [];
    let cardsDrawn = InitialDrawSize; // Initial hand size
    let deckSizeAfterMulligan = deckSize - mulliganCount; // Adjusting deck size for mulligans
    let turn0Boost = 0;

    for (let turn = 0; turn <= numberOfTurns; turn++) {
        if (turn > 0) cardsDrawn += 1;

        let probability;
        if (turn === 0) {
            let baseProbability = calculateProbabilityForHand(group, cardsDrawn, deckSize);
            probability = applyLondonMulligan(group, cardsDrawn, deckSize, mulliganCount);
            turn0Boost = probability - baseProbability; // Boost gained from mulligan on turn 0
        } else {
            // For subsequent turns, apply the boost gained from turn 0
            probability = calculateProbabilityForHand(group, cardsDrawn, deckSizeAfterMulligan) + turn0Boost;
            probability = Math.min(1, probability); // Ensure probability does not exceed 100%
        }

        groupResults.push({ turn, probability });
        console.log(`Turn ${turn}: Probability = ${probability}, Deck Size After Mulligan = ${deckSizeAfterMulligan}`);
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

    // Fill up the remaining cards for the turn with blanks
    while (cards.length < InitialDrawSize + turn) {
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

<h2 style="text-align: center;">What to expect</h2>
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