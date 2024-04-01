<script>
    import { groupColors } from './colorStore.js';
// Additional imports for randomness
import { sampleSize } from 'lodash';
import _ from 'lodash';

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



function calculateLinkedGroups(linkedGroups) {
    const groupResults = [];
    const groupSizes = linkedGroups.map(group => group.size);
    const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    const linkName = linkedGroups[0].link;

    let initialProb = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, InitialDrawSize);
    
    // Calculate probability for turn 0 with mulligans taken into account
    let turn0Prob = 1 - Math.pow((1 - initialProb), mulliganCount + 1);
    groupResults.push({ turn: 0, probability: turn0Prob });

    let totalCardsSeen = InitialDrawSize;
    let adjustedDeckSize = deckSize;

    for (let turn = 1; turn <= numberOfTurns; turn++) {
        totalCardsSeen += 1;
        let probAtLeastDesiredA = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, adjustedDeckSize, totalCardsSeen);

        if (mulliganCount > 0) {
            let probNotDrawingCombination = Math.pow((1 - initialProb), mulliganCount); // (1 - P) for each mulligan
            probAtLeastDesiredA = 1 - (probNotDrawingCombination * (1 - probAtLeastDesiredA));
        }

        groupResults.push({ turn, probability: probAtLeastDesiredA });
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



//The parameters for the hypergeometricCDF function are as follows:

//x: The number of successes in the sample (in our case, the number of desired cards we want to draw).
//N: The size of the population (in our case, the total deck size).
//K: The number of successes in the population (in our case, the size of the group of desired cards in the deck).
//n: The size of the sample (in our case, the total number of cards drawn).



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




//the following is the start of mana probability calculations -------------------


        function determineNeededCombinations(lands, requirements, totalManaNeeded) {
            const combinations = getAllCombinations(lands, true, totalManaNeeded);
            return combinations.filter(combination => satisfiesRequirements(combination, requirements, totalManaNeeded));
        }


function satisfiesRequirements(combination, requirements, totalManaNeeded) {
    if (combination.length < totalManaNeeded) return false;

    // Create a list of all possible mana profiles this combination can produce
    let possibleManaProfiles = combination.map(land => Object.keys(land));

    // Generate all possible selections of mana from these profiles
    let allSelections = generateAllSelections(possibleManaProfiles);

    // Check if any selection satisfies the requirements
    return allSelections.some(selection => {
        let manaProfile = selection.reduce((profile, color) => {
            profile[color] = (profile[color] || 0) + 1;
            return profile;
        }, {});
        return Object.entries(requirements).every(([color, amount]) => manaProfile[color] >= amount);
    });
}

function generateAllSelections(possibleManaProfiles, index = 0, currentSelection = []) {
    if (index === possibleManaProfiles.length) {
        return [currentSelection.slice()];
    }

    let allSelections = [];

    for (let color of possibleManaProfiles[index]) {
        currentSelection.push(color);
        allSelections.push(...generateAllSelections(possibleManaProfiles, index + 1, currentSelection));
        currentSelection.pop();
    }

    return allSelections;
}



        function getAllCombinations(lands, allowDuplicates, totalManaNeeded) {
            const combinations = [];
            const landCounts = lands.reduce((counts, land) => {
                const key = JSON.stringify(land);
                counts[key] = (counts[key] || 0) + 1;
                return counts;
            }, {});

            const generateCombinations = (index, currentCombination, currentCounts) => {
                if (currentCombination.length > totalManaNeeded) return;
                if (index === lands.length) {
                    const combinationKey = JSON.stringify(currentCombination.map(land => JSON.stringify(land)).sort());
                    combinations.push(combinationKey);
                    return;
                }
                generateCombinations(index + 1, currentCombination, currentCounts);
                const land = lands[index];
                const landKey = JSON.stringify(land);
                if (!currentCounts[landKey] || currentCounts[landKey] < landCounts[landKey]) {
                    const newCounts = { ...currentCounts, [landKey]: (currentCounts[landKey] || 0) + 1 };
                    generateCombinations(index + 1, [...currentCombination, land], newCounts);
                }
            };
            generateCombinations(0, [], {});

            return Array.from(new Set(combinations)).map(key => JSON.parse(key).map(landStr => JSON.parse(landStr)));
        }

        function combineProfiles(profiles) {
            return profiles.reduce((combinedProfile, profile) => {
                Object.entries(profile).forEach(([color, amount]) => {
                    combinedProfile[color] = (combinedProfile[color] || 0) + amount;
                });
                return combinedProfile;
            }, {});
        }


        function prepareCombinationsForAnalysis(combinations) {
    return combinations.map(combination => {
        const landCounts = combination.reduce((counts, land) => {
            const key = JSON.stringify(land);
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});

        return Object.entries(landCounts).map(([land, count]) => ({
            land: JSON.parse(land),
            count
        }));
    });
}


function calculateLandGroupSizes(lands) {
    // Assuming each land in `lands` array is directly an object like { U: 1 } without a `land` property and a `count`.
    const landGroupSizes = lands.reduce((sizes, land) => {
        const key = JSON.stringify(land);
        sizes[key] = (sizes[key] || 0) + 1; // Increment count for each unique land
        return sizes;
    }, {});

    return Object.entries(landGroupSizes).map(([land, count]) => ({
        land: JSON.parse(land),
        count
    }));
}




function transformCombinationForLinkedGroups(combination, landGroupSizes) {
    return combination.map(landCount => {
        const landKey = JSON.stringify(landCount.land);
        const groupSize = landGroupSizes.find(group => JSON.stringify(group.land) === landKey).count;
        return {
            size: groupSize,
            cardsToDraw: landCount.count
        };
    });
}


// this function was the original, that just sums the combinations probabilities. 
// the issue is that it's not really accurate in summing. 

function calculateProbabilitiesForCombinations(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns) {
    const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);

    preparedCombinations.forEach(combination => {
        const linkedGroups = transformCombinationForLinkedGroups(combination, landGroupSizes);
        calculateLinkedGroups(linkedGroups, deckSize, mulliganCount, initialDrawSize);

        // Assuming the linkName is the same for all groups in a combination
        const linkName = linkedGroups[0].link;

        for (let turn = 0; turn <= numberOfTurns; turn++) {
            const turnProbability = results[linkName] ? results[linkName][turn].probability : 0;
            probabilitiesByTurn[turn] += turnProbability;
        }
    });

    return probabilitiesByTurn;
}








// function calculateProbabilitiesForCombinations(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns) {
//     const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);

//     // Calculate probabilities for individual combinations
//     preparedCombinations.forEach(combination => {
//         const linkedGroups = transformCombinationForLinkedGroups(combination, landGroupSizes);
//         const groupResults = calculateLinkedGroups(linkedGroups, deckSize, mulliganCount, initialDrawSize);

//         // Assuming the linkName is the same for all groups in a combination
//         const linkName = linkedGroups[0].link;

//         for (let turn = 0; turn <= numberOfTurns; turn++) {
//             const turnProbability = results[linkName] ? results[linkName][turn].probability : 0;
//             probabilitiesByTurn[turn] += turnProbability;
//         }
//     });

//     // Apply inclusion-exclusion principle
//     for (let i = 2; i <= preparedCombinations.length; i++) {
//         const sign = i % 2 === 0 ? -1 : 1;

//         // Generate all possible intersections of i combinations
//         const intersections = generateIntersections(preparedCombinations, i);
//         intersections.forEach(intersection => {
//             const linkedGroups = transformCombinationForLinkedGroups(intersection, landGroupSizes);
//             const groupResults = calculateLinkedGroups(linkedGroups, deckSize, mulliganCount, initialDrawSize);

//             // Assuming the linkName is the same for all groups in an intersection
//             const linkName = linkedGroups[0].link;

//             for (let turn = 0; turn <= numberOfTurns; turn++) {
//                 const turnProbability = results[linkName] ? results[linkName][turn].probability : 0;
//                 probabilitiesByTurn[turn] += sign * turnProbability;
//             }
//         });
//     }

//     return probabilitiesByTurn;
// }


// function generateIntersections(combinations, count) {
//     const intersections = [];

//     function combine(currentIndex, currentCombination, remainingCount) {
//         if (remainingCount === 0) {
//             intersections.push(currentCombination);
//             return;
//         }

//         for (let i = currentIndex; i < combinations.length; i++) {
//             const newCombination = mergeCombinations(currentCombination, combinations[i]);
//             combine(i + 1, newCombination, remainingCount - 1);
//         }
//     }

//     combine(0, [], count);
//     return intersections;
// }

// function mergeCombinations(combinationA, combinationB) {
//     const merged = {};

//     combinationA.forEach(land => {
//         const key = JSON.stringify(land.land);
//         merged[key] = (merged[key] || 0) + land.count;
//     });

//     combinationB.forEach(land => {
//         const key = JSON.stringify(land.land);
//         merged[key] = (merged[key] || 0) + land.count;
//     });

//     return Object.entries(merged).map(([land, count]) => ({
//         land: JSON.parse(land),
//         count
//     }));
// }


function createDeck(lands) {
    let deck = [];
    lands.forEach(land => {
        for (let i = 0; i < land.count; i++) {
            deck.push(land.land);
        }
    });
    return deck;
}


// V1 - this code worked but I don't think is factoring in deck size reduction on draws

// function monteCarloSimulation(preparedCombinations, landGroupSizes, deck, mulliganCount, initialDrawSize, numberOfTurns, numIterations, deckSize) {
//     const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);

//     // Calculate the number of dummy cards to fill the rest of the deck
//     const numDummyCards = deckSize - deck.length;

//     // Create the complete deck with dummy cards
//     const completeDeck = deck.concat(Array(numDummyCards).fill({ dummy: 1 }));

//     for (let iteration = 0; iteration < numIterations; iteration++) {
//         let hand;
//         for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
//             hand = _.sampleSize(completeDeck, initialDrawSize);
//             if (handMeetsRequirements(hand, preparedCombinations)) {
//                 break;
//             }
//         }

//         for (let turn = 0; turn <= numberOfTurns; turn++) {
//             if (turn > 0) {
//                 const newCard = _.sampleSize(completeDeck, 1)[0];
//                 hand.push(newCard);
//             }

//             if (handMeetsRequirements(hand, preparedCombinations)) {
//                 probabilitiesByTurn[turn]++;
//             }
//         }
//     }

//     return probabilitiesByTurn.map(prob => (prob / numIterations) * 100);
// }








function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
    const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);

    // Create the complete deck with dummy cards
    const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
    const numDummyCards = Math.max(deckSize - totalLands, 0);
    const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));

    for (let iteration = 0; iteration < numIterations; iteration++) {
        let hand;
        let remainingDeck = _.cloneDeep(completeDeck); // Reset the remaining deck for each iteration

        // Handle mulligans for turn 0
        for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
            hand = _.sampleSize(remainingDeck, initialDrawSize);
            if (handMeetsRequirements(hand, preparedCombinations)) {
                break;
            }
            remainingDeck = _.cloneDeep(completeDeck); // Reset the remaining deck for the next mulligan
        }

        // Update probabilities for turn 0
        if (handMeetsRequirements(hand, preparedCombinations)) {
            probabilitiesByTurn[0]++;
        }

        // Simulate drawing for subsequent turns
        for (let turn = 1; turn <= numberOfTurns; turn++) {
            // Remove cards drawn in previous turns from the deck
            remainingDeck = _.cloneDeep(completeDeck).slice(0, deckSize - initialDrawSize - turn + 1);

            // Draw additional card for the current turn
            const newCard = _.sample(remainingDeck);
            hand.push(newCard);

            if (handMeetsRequirements(hand, preparedCombinations)) {
                probabilitiesByTurn[turn]++;
            }


            // Log the deck size and cards drawn after each turn for debugging
            // console.log(`Turn ${turn}: Deck size = ${remainingDeck.length}, Cards in hand = ${hand.length}`);
        }
    }

    return probabilitiesByTurn.map(prob => (prob / numIterations) * 100);
}



//this code is a version of what's working above, but the deck is not modified
// during each iteration. Instead, an array of indices (remainingDeckIndices) 
//is used to keep track of which cards have been drawn. This approach avoids 
//the need for deep copying the deck for each iteration and mulligan, which 
//can improve performance.


// function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
//     const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);
//     const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
//     const numDummyCards = Math.max(deckSize - totalLands, 0);
//     const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));

//     for (let iteration = 0; iteration < numIterations; iteration++) {
//         let hand;
//         let remainingDeckIndices = Array.from({ length: deckSize }, (_, i) => i);

//         for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
//             const sampledIndices = _.sampleSize(remainingDeckIndices, initialDrawSize);
//             hand = sampledIndices.map(index => completeDeck[index]);
//             if (handMeetsRequirements(hand, preparedCombinations)) {
//                 break;
//             }
//             if (mulligan < mulliganCount) {
//                 remainingDeckIndices = Array.from({ length: deckSize }, (_, i) => i); // Reset for next mulligan
//             }
//         }

//         if (handMeetsRequirements(hand, preparedCombinations)) {
//             probabilitiesByTurn[0]++;
//         }

//         for (let turn = 1; turn <= numberOfTurns; turn++) {
//             const additionalCardIndex = _.sample(remainingDeckIndices);
//             hand.push(completeDeck[additionalCardIndex]);
//             remainingDeckIndices = remainingDeckIndices.filter(index => index !== additionalCardIndex);

//             if (handMeetsRequirements(hand, preparedCombinations)) {
//                 probabilitiesByTurn[turn]++;
//             }
//         }
//     }

//     return probabilitiesByTurn.map(prob => (prob / numIterations) * 100);
// }



//--------------------------------------------------------------------------




//this was the monteCarloSimulation function that was trying to
//account for a changing deck size, did not end up working. 

// function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
//     const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);

//     for (let iteration = 0; iteration < numIterations; iteration++) {
//         let completeDeck = createCompleteDeck(landGroupSizes, deckSize);
//         let hand;

//         for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
//             hand = drawHand(completeDeck, initialDrawSize);
//             if (handMeetsRequirements(hand, preparedCombinations)) {
//                 break;
//             }
//         }

//         for (let turn = 0; turn <= numberOfTurns; turn++) {
//             if (turn > 0) {
//                 const newCard = drawCard(completeDeck);
//                 hand.push(newCard);
//             }

//             if (handMeetsRequirements(hand, preparedCombinations)) {
//                 probabilitiesByTurn[turn]++;
//             }
//         }
//     }

//     return probabilitiesByTurn.map(prob => (prob / numIterations) * 100);
// }

// function drawHand(deck, numCards) {
//     return _.sampleSize(deck, numCards).map(card => {
//         _.remove(deck, c => c === card);
//         return card;
//     });
// }

// function drawCard(deck) {
//     const card = _.sample(deck);
//     _.remove(deck, c => c === card);
//     return card;
// }

// function createCompleteDeck(landGroupSizes, deckSize) {
//     const totalLands = landGroupSizes.reduce((total, land) => total + land.count, 0);
//     const numDummyCards = deckSize - totalLands;
//     console.log("Total lands:", totalLands);
//     console.log("Deck size:", deckSize);
//     console.log("Number of dummy cards:", numDummyCards);

//     const dummyCard = { isDummy: true };

//     return [
//         ...landGroupSizes.flatMap(land => Array(land.count).fill(land.land)),
//         ...Array(numDummyCards).fill(dummyCard),
//     ];
// }






function handMeetsRequirements(hand, preparedCombinations) {
    return preparedCombinations.some(combination => {
        const landCounts = combination.reduce((counts, land) => {
            counts[JSON.stringify(land.land)] = land.count;
            return counts;
        }, {});

        const handProfile = hand.reduce((profile, land) => {
            const key = JSON.stringify(land);
            profile[key] = (profile[key] || 0) + 1;
            return profile;
        }, {});

        return Object.entries(landCounts).every(([land, count]) => {
            return handProfile[land] >= count;
        });
    });
}





function identifyProfiles() {
            const lands = [
                { U: 1},
                { U: 1},
                { B: 1},
                { W: 1},
                { W: 1},
                { B: 1},
                { B: 1},
                { W: 1},
                { U: 1},
                { B: 1},
                { W: 1},
                { W: 1},
                { B: 1},
                { B: 1},
                { W: 1},
                { U: 1},
                { B: 1},
                { W: 1},
                { W: 1},
                { B: 1},
                { B: 1},
                { W: 1},
                { U: 1},
                { U: 1},
                { U: 1},
                { W: 1, B: 1, U: 1},
                { W: 1, B: 1, U: 1},
                { W: 1, B: 1, U: 1},
                { W: 1, B: 1, U: 1},
                { W: 1, B: 1, U: 1},
                { W: 1, B: 1},
                { W: 1, B: 1},
                { W: 1, B: 1},
                { W: 1, U: 1},
                { W: 1, U: 1},
                { W: 1, U: 1},
                { B: 1, U: 1},
                { B: 1, U: 1},
                { B: 1, U: 1},
                { B: 1, U: 1},
            ];

            const manaRequirements = {W: 1, B: 1, U: 1};
            const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
            const neededCombinations = determineNeededCombinations(lands, manaRequirements, totalManaNeeded);
            const preparedCombinations = prepareCombinationsForAnalysis(neededCombinations);
            const landGroupSizes = calculateLandGroupSizes(lands);
            //prolly can remove totalProbability, old sum logic
            const totalProbability = calculateProbabilitiesForCombinations(preparedCombinations, landGroupSizes, deckSize, mulliganCount, InitialDrawSize);
            
            //old sum based logic, can prolly remove
            //probabilitiesByTurn = calculateProbabilitiesForCombinations(preparedCombinations, landGroupSizes, deckSize, mulliganCount, InitialDrawSize, numberOfTurns);


            const flatDeck = lands.reduce((deck, land) => {
        return deck.concat(Array(landGroupSizes.find(group => JSON.stringify(group.land) === JSON.stringify(land)).count).fill(land));
    }, []);

    
    const deck = createDeck(landGroupSizes);



    const probabilitiesByTurn = monteCarloSimulation(
    preparedCombinations,
    landGroupSizes,
    deckSize,
    mulliganCount,
    InitialDrawSize,
    numberOfTurns,
    10000
);



// this version is for the monteCarloSimulation that works but is not accouting
// for the change in deck size V1
//     const probabilitiesByTurn = monteCarloSimulation(
//     preparedCombinations,
//     landGroupSizes,
//     deck,
//     mulliganCount,
//     InitialDrawSize,
//     numberOfTurns,
//     1000,
//     deckSize
// );


//this version is for the monteCarloSimulation function that's trying to account
//for changing deck size

// const probabilitiesByTurn = monteCarloSimulation(
//     preparedCombinations,
//     landGroupSizes,
//     deckSize,
//     mulliganCount,
//     InitialDrawSize,
//     numberOfTurns,
//     100000
// );



            console.log('Land Group Sizes:', landGroupSizes);
         // console.log('Distinct Mana Production Profiles:', [...new Set(lands.map(land => JSON.stringify(land)))].map(profile => JSON.parse(profile)));
            console.log('pre-cleaned Land Combinations:', neededCombinations);
            console.log('Prepared Combinations:', preparedCombinations);
        //  console.log('Total Probability (OLD WRONG):', totalProbability);
            console.log('Probabilities by Turn:', probabilitiesByTurn);

        }


        let probabilitiesByTurn = [];



        identifyProfiles();


//-----------------------------------------




//the following makes the cards output

function createGroupCards(groups, results, probabilitiesByTurn, turn) {
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

    // Add a card for the total probability of getting mana for each turn
    const turnTotalProbability = probabilitiesByTurn[turn];
    cards.push({
        probability: turnTotalProbability,
        label: 'Mana changes',
        color: '#f0f0f0', // Some color for this card
        ratioText: convertPercentToRatio(turnTotalProbability)
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
                {#each createGroupCards(groups, results, probabilitiesByTurn, turn) as card}
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