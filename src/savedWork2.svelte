change these functions to test multi "# Desired Cards" support for linked groups. 

first need to fix GroupDefinitions to not disable AND reset "# Desired Cards"


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





function calculateLinkedGroups(linkedGroups) {
    const groupResults = [];
    let cardsDrawn = 7; // Initial hand
    const groupSizes = linkedGroups.map(group => group.size);
    const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    const linkName = linkedGroups[0].link;

    for (let turn = 0; turn <= 4; turn++) {
        if (turn > 0) cardsDrawn += 1;
        let probability = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn);
        groupResults.push({ turn, probability });
    }

    results[linkName] = groupResults;
}
