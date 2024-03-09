
function calculateSingleGroup(group) {
    const groupResults = [];
    let totalCardsSeen = InitialDrawSize;

    // Calculate the probability for turn 0 without mulligans
    let initialProb = 0;
    for (let k = group.cardsToDraw; k <= Math.min(totalCardsSeen, group.size); k++) {
        initialProb += hypergeometricCDF(k, deckSize, group.size, totalCardsSeen);
    }

    // Adjust the initial probability to account for mulligans
    let turn0Prob = 1 - Math.pow((1 - initialProb), mulliganCount + 1);
    groupResults.push({ turn: 0, probability: turn0Prob });

    for (let turn = 1; turn <= numberOfTurns; turn++) {
        totalCardsSeen += 1;
        let probAtLeastDesiredA = 0;
        for (let k = group.cardsToDraw; k <= Math.min(totalCardsSeen, group.size); k++) {
            probAtLeastDesiredA += hypergeometricCDF(k, deckSize, group.size, totalCardsSeen);
        }

        if (mulliganCount > 0) {
            let probNotDrawingCombination = Math.pow((1 - initialProb), mulliganCount); // (1 - P) for each mulligan
            probAtLeastDesiredA = 1 - (probNotDrawingCombination * (1 - probAtLeastDesiredA));
        }

        groupResults.push({ turn, probability: probAtLeastDesiredA });
    }

    results[group.name] = groupResults;
}



---------------------------------------------------------------

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




--------------------------------------------------------------------

function calculateLinkedGroups(linkedGroups) {
    const groupResults = [];
    const groupSizes = linkedGroups.map(group => group.size);
    const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    const linkName = linkedGroups[0].link;

    let initialProb = applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulliganCount, InitialDrawSize);

    console.log('Initial probability (initialProb):', initialProb); // Add this line

    groupResults.push({ turn: 0, probability: initialProb });

    let totalCardsSeen = mulliganCount > 0 ? 0 : InitialDrawSize;
    let adjustedDeckSize = deckSize - (mulliganCount > 0 ? InitialDrawSize : 0);

    let extendedNumberOfTurns = numberOfTurns + 10; // Extend the number of turns to ensure we have enough data to filter

    let allResults = [];

    for (let turn = 1; turn <= extendedNumberOfTurns; turn++) {
        totalCardsSeen += 1;
        
        console.log('Parameters:', groupSizes, groupCardsToDraw, adjustedDeckSize, totalCardsSeen);

        let probAtLeastDesiredA = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, adjustedDeckSize, totalCardsSeen);
        
        console.log(`Probability at least desired before adjustment (Turn ${turn}):`, probAtLeastDesiredA);  // Add this line to log probAtLeastDesiredA before adjustment


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

---------------------------------------------------------------------------

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



---------------------------------------------------------------

function calculateSingleGroup(group) {
    const groupResults = [];
    let initialProb = applyLondonMulligan(group);
    groupResults.push({ turn: 0, probability: initialProb });

    let totalCardsSeen = mulliganCount > 0 ? 0 : InitialDrawSize; // Start from 0 if there are mulligans. 
    let adjustedDeckSize = deckSize - (mulliganCount > 0 ? InitialDrawSize : 0); // Decrease deck size of subseiqent turns if there are mulligans. the deck size is reduced because when mulliganing, the subsequent turns are separate calculations that are combined with the turn 0 mulligans, and we assume the cards in your hand are not the desired cards. also note that this sort of factors the london mulligan aspect of putting x cards on the bottom of your library based on the # of times you mulligan. the assumption is you'd put none-desired cards on the bottom, so for the sake of caluculations, imagining these cards are in your hand (and not in the deck) feels similar to if they are on the bottom (you know the cards above them must have the desired card, so you can discount them i think)
    for (let turn = 1; turn <= numberOfTurns; turn++) {
        totalCardsSeen += 1;

        let probLessThanDesiredAUpToThisTurn = 0;
        for (let k = 0; k < group.cardsToDraw; k++) {
            probLessThanDesiredAUpToThisTurn += hypergeometricCDF(k, adjustedDeckSize, group.size, totalCardsSeen);
        }

        let probAtLeastDesiredA = 1 - probLessThanDesiredAUpToThisTurn;

        if (mulliganCount > 0) {
            // Combine the probability from turn 0 with the probability of drawing additional cards
            probAtLeastDesiredA = 1 - ((1 - initialProb) * (1 - probAtLeastDesiredA));
        }

        groupResults.push({ turn, probability: probAtLeastDesiredA });
    }

    results[group.name] = groupResults;
}



------------------------------------------------------------


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

