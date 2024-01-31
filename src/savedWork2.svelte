
<script>
//the following saved work was gpts attempt to make mulligans more accurate by 
//not applying the carry forward method. I don't think it worked upon checking
//against it's python calculations. 


function applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulligans, cardsDrawn) {
    let totalProbability = 0;

    for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
        let probabilityThisMulligan = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn);
        totalProbability += (1 - totalProbability) * probabilityThisMulligan;
    }

    return Math.min(1, totalProbability);
}


function calculateLinkedGroups(linkedGroups) {
    const groupResults = [];
    let cardsDrawn = 7; // Initial hand size
    const groupSizes = linkedGroups.map(group => group.size);
    const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    const linkName = linkedGroups[0].link;

    for (let turn = 0; turn <= 4; turn++) {
        cardsDrawn = 7 + turn; // Adjust for the current turn

        let probability;
        if (turn === 0) {
            probability = applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulliganCount, cardsDrawn);
        } else {
            probability = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn);
        }
        groupResults.push({ turn, probability });
    }

    results[linkName] = groupResults;
}



function calculateSingleGroup(group) {
    const groupResults = [];
    let cardsDrawn = 7; // Adjust for initial hand size

    for (let turn = 0; turn <= 4; turn++) {
        if (turn > 0) cardsDrawn += 1; // Adjust for additional cards in subsequent turns

        let probability = applyLondonMulligan(group, cardsDrawn, deckSize, mulliganCount);
        groupResults.push({ turn, probability });
    }

    results[group.name] = groupResults;
}


function applyLondonMulligan(group, cardsDrawn, deckSize, mulligans) {
    let totalProbability = 0;

    for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
        let probabilityThisMulligan = calculateProbabilityForHand(group, cardsDrawn, deckSize);
        totalProbability += (1 - totalProbability) * probabilityThisMulligan;
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




</script>