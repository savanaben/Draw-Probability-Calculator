<script>

    // Define deckSize at the top level
    const deckSize = 99;


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

    // Iterate through all combinations of drawing at least one card from each group
    for (let i = 1; i <= Math.min(cardsDrawn, groupSizes[0]); i++) {
        for (let j = 1; j <= Math.min(cardsDrawn - i, groupSizes[1]); j++) {
            let probGroup1 = choose(groupSizes[0], i);
            let probGroup2 = choose(groupSizes[1], j);
            let probOtherCards = choose(deckSize - groupSizes[0] - groupSizes[1], cardsDrawn - i - j);
            let probCombination = probGroup1 * probGroup2 * probOtherCards / choose(deckSize, cardsDrawn);

            totalProbability += probCombination;
        }
    }

    return Math.min(1, totalProbability); // Ensure the probability does not exceed 1
}









    export let groups = [];
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

    function calculateSingleGroup(group) {
        const groupResults = [];
        let cardsDrawn = 7; // Initial hand

        for (let turn = 0; turn <= 4; turn++) {
            if (turn > 0) cardsDrawn += 1;
            // Calculate probability for the specified number of cards
            let probability = 0;
            for (let x = group.cardsToDraw; x <= Math.min(group.size, cardsDrawn); x++) {
                probability += hypergeometricCDF(x, deckSize, group.size, cardsDrawn);
            }
            groupResults.push({ turn, probability });
        }

        results[group.name] = groupResults;
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






let groupColors = {};

function assignGroupColors(groups) {
    const getRandomColor = () => `hsl(${Math.random() * 360}, 70%, 75%)`;

    groups.forEach(group => {
        // For linked groups
        if (group.link) {
            if (!groupColors[group.link]) {
                // Assign a new color to the linked group if it doesn't have one
                groupColors[group.link] = getRandomColor();
            }
            // Set group color same as its linked group color
            groupColors[group.name] = groupColors[group.link];
        } 
        // For non-linked groups
        else {
            if (!groupColors[group.name]) {
                // Assign a new color to the group if it doesn't have one
                groupColors[group.name] = getRandomColor();
            }
        }
    });
}

$: if (groups.length > 0) {
    assignGroupColors(groups);
    calculateProbabilities();
}




</script>

<div>
    <h2>Calculation Results</h2>
    {#each Array(5) as _, turn}
        <div class="turn-row">
            <div class="turn-label">Turn {turn}:</div>
            <div class="card-rectangles">
                {#each createGroupCards(groups, results, turn) as card}
                    <div class="card-container">
                        <div class="rectangle" style="background-color: {card.probability !== null ? groupColors[card.label] : 'lightgray'}">
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
        width: 30px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
        font-size: 0.8em;
        text-align: center;
    }
    .card-label {
        margin-top: 5px;
        font-size: 0.7em;
        text-align: center;
    }
</style>