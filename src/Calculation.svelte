<script>




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


function multivariateHypergeometricCDF(groupSizes, deckSize, cardsDrawn) {
    let totalProbability = 0;

    // Helper function to recursively calculate probabilities
    function calculate(groupIndex, cardsLeft, accumulatedProbability) {
        if (groupIndex === groupSizes.length) {
            // All groups considered, calculate remaining probability
            return accumulatedProbability * choose(deckSize - sumGroupSizes(groupIndex), cardsLeft) / choose(deckSize, cardsDrawn);
        }

        let groupProb = 0;
        for (let i = 1; i <= Math.min(cardsLeft, groupSizes[groupIndex]); i++) {
            groupProb += calculate(groupIndex + 1, cardsLeft - i, accumulatedProbability * choose(groupSizes[groupIndex], i));
        }
        return groupProb;
    }

    function sumGroupSizes(upToIndex) {
        return groupSizes.slice(0, upToIndex).reduce((sum, size) => sum + size, 0);
    }

    return Math.min(1, calculate(0, cardsDrawn, 1));
}




function calculateLinkedGroups(linkedGroups) {
        const groupResults = [];
        let cardsDrawn = 7; // Initial hand
        const groupSizes = linkedGroups.map(group => group.size);
        const linkName = linkedGroups[0].link;

        for (let turn = 0; turn <= 4; turn++) {
            if (turn > 0) cardsDrawn += 1;
            let probability = multivariateHypergeometricCDF(groupSizes, deckSize, cardsDrawn);
            groupResults.push({ turn, probability });
        }

        results[linkName] = groupResults;
    }








    export let groups = [];
    export let deckSize; // Received from App.svelte
    export let mulliganCount;


    let results = {};

    // Reactive statement to calculate probabilities when groups change
    $: if (groups.length > 0) {
        calculateProbabilities();
    }





       function calculateProbabilities() {
        console.log("Calculating probabilities for groups:", groups);
        results = {};

        // Group by links
        const links = {};
        groups.forEach(group => {
            if (group.link) {
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
    const groupResults = [];
    let cardsDrawn = 7; // Initial hand size
    let deckSizeAfterMulligan = deckSize - mulliganCount; // Adjusting deck size for mulligans
    let turn0Boost = 0;

    for (let turn = 0; turn <= 4; turn++) {
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
        let probability = groupResult && turn < groupResult.length ? Math.round(groupResult[turn].probability * 1000) / 10 : null;
        return { probability, label: group.name };
    });

    // Fill up the remaining cards for the turn with blanks
    while (cards.length < 7 + turn) {
        cards.push({ probability: null, label: '' });
    }

    return cards;
}





const presetColors = [
    "#E1BEE7", // Example colors
    "#B2DFDB",
    "#FFE0B2",
    "#DCEDC8",
    "#B3E5FC",
    "#FFCCBC",
    "#C5CAE9"
];

let groupColors = {};
let colorIndex = 0;

function assignGroupColors(groups) {
    groups.forEach(group => {
        // For linked groups
        if (group.link) {
            if (!groupColors[group.link]) {
                groupColors[group.link] = presetColors[colorIndex % presetColors.length];
                colorIndex++;
            }
            groupColors[group.name] = groupColors[group.link];
        } 
        // For non-linked groups
        else {
            if (!groupColors[group.name]) {
                groupColors[group.name] = presetColors[colorIndex % presetColors.length];
                colorIndex++;
            }
        }
    });
}

$: if (groups.length > 0) {
    assignGroupColors(groups);
    calculateProbabilities();
}





</script>

<div class="output-diagram">
    {#each Array(5) as _, turn}
        <div class="turn-row">
            <div class="turn-label">Turn {turn}:</div>
            <div class="card-rectangles">
                {#each createGroupCards(groups, results, turn) as card}
                    <div class="card-container">
                        <div class="rectangle" style="background-color: {card.probability !== null ? groupColors[card.label] : '#e5e5e5'}">
                            {card.probability !== null ? `${card.probability}%` : ''}
                        </div>
                        <div class="card-label">{card.label}</div>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
    .turn-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }
    .turn-label {
        margin-right: 10px;
        font-weight: bold;
    }
    .card-rectangles {
        display: flex;
    }
    .card-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 5px;
    }
    .rectangle {
        width: 40px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid rgb(142, 142, 142);
        font-size: 0.8em;
        text-align: center;
        border-radius: 4px;
    }
    .card-label {
        margin-top: 5px;
        font-size: 0.7em;
        text-align: center;
    }

    .output-diagram {
        max-width: 55rem;
        margin: auto; /* Centers the container */
    }

</style>