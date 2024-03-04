

function applyLondonMulligan(group) {
    let totalProbability = 0;
    let totalDraws = InitialDrawSize * (mulliganCount +1); // Total cards seen after mulligans

    for (let k = 0; k < group.cardsToDraw; k++) {
        let probForK = hypergeometricCDF(k, deckSize, group.size, totalDraws);
        console.log(`Probability for k=${k}: ${probForK}`);
        totalProbability += probForK;
    }

    return 1 - totalProbability;
}



function calculateSingleGroup(group) {

    const groupResults = [];
    let totalCardsSeen = InitialDrawSize * (mulliganCount + 1); // Total cards seen after mulligans
    let adjustedDeckSize = deckSize - mulliganCount; // Adjust deck size for cards put back after mulligans

    let initialProb = applyLondonMulligan(group);
    groupResults.push({ turn: 0, probability: initialProb });

    for (let turn = 1; turn <= numberOfTurns; turn++) {
        totalCardsSeen += 1;
        adjustedDeckSize -= 0; // Adjust deck size for each card drawn. i don't know why 0 works here.. somehow the subsequent turns are still factoring in loosing a card I think
        console.log(`Turn ${turn}:`);
        console.log(`Adjusted deck size: ${adjustedDeckSize}`);
        console.log(`Total cards seen: ${totalCardsSeen}`);

        let probLessThanDesiredAUpToThisTurn = 0;
        for (let k = 0; k < group.cardsToDraw; k++) {
            let probForK = hypergeometricCDF(k, adjustedDeckSize, group.size, totalCardsSeen);
            console.log(`Probability for k=${k}: ${probForK}`);
            probLessThanDesiredAUpToThisTurn += probForK;
        }

        let probAtLeastDesiredA = 1 - probLessThanDesiredAUpToThisTurn;
        groupResults.push({ turn, probability: probAtLeastDesiredA });
    }

    console.log('First 5 turns for group', group.name, groupResults.slice(0, 6));
    results[group.name] = groupResults;
}









----------------------------------------------------------------


function applyLondonMulligan(group, cardsDrawn, deckSize, mulligans) {
    let totalProbability = 0;
    // Removed: let remainingDeckSize = deckSize; // No longer reducing the deck size for mulligans.

    for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
        // Calculate probability using the full deck size for each mulligan.
        let probabilityThisMulligan = calculateProbabilityForHand(group, cardsDrawn, deckSize);
        totalProbability += (1 - totalProbability) * probabilityThisMulligan;

        // Removed: remainingDeckSize -= 1; // No longer decrementing deck size for mulligans.
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

