<script>
    import { groupColors } from './colorStore.js';
    import { simulationData, monteCarloResults, simulationRun, cancelSimulation, simulationProgress } from './colorStore.js';
    // Additional imports for randomness
    import { sampleSize } from 'lodash';
    import _ from 'lodash';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    
    
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
    
    // //Reactive statement to run monte carlo simulation on groups or other changes (live vs button)
    // $: if (groups.length > 0 && deckSize && mulliganCount !== undefined && InitialDrawSize) {
    //     identifyProfiles();
    // }
    
    
    
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
    
    
    //BEFORE CONSOLE LOG TESTING. this is also before the simulation optimization to stop
    // the sim once we get a hand success
    
    // function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
    //     const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);
    
    //     // Create the complete deck with dummy cards
    //     const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
    //     const numDummyCards = Math.max(deckSize - totalLands, 0);
    //     const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
    
    //     for (let iteration = 0; iteration < numIterations; iteration++) {
    //         let hand;
    //         let remainingDeck = _.cloneDeep(completeDeck); // Reset the remaining deck for each iteration
    
    //         // Handle mulligans for turn 0
    //         for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
    //             hand = _.sampleSize(remainingDeck, initialDrawSize);
    //             if (handMeetsRequirements(hand, preparedCombinations)) {
    //                 break;
    //             }
    //             remainingDeck = _.cloneDeep(completeDeck); // Reset the remaining deck for the next mulligan
    //         }
    
    //         // Update probabilities for turn 0
    //         if (handMeetsRequirements(hand, preparedCombinations)) {
    //             probabilitiesByTurn[0]++;
    //         }
    
    //         // Simulate drawing for subsequent turns
    //         for (let turn = 1; turn <= numberOfTurns; turn++) {
    //             // Remove cards drawn in previous turns from the deck
    //             remainingDeck = _.cloneDeep(completeDeck).slice(0, deckSize - initialDrawSize - turn + 1);
    
    //             // Draw additional card for the current turn
    //             const newCard = _.sample(remainingDeck);
    //             hand.push(newCard);
    
    //             if (handMeetsRequirements(hand, preparedCombinations)) {
    //                 probabilitiesByTurn[turn]++;
    //             }
    
    
    //             // Log the deck size and cards drawn after each turn for debugging
    //             // console.log(`Turn ${turn}: Deck size = ${remainingDeck.length}, Cards in hand = ${hand.length}`);
    //         }
    //     }
    
    //     return probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1));
    // }
    
    
    
    // function handMeetsRequirements(hand, preparedCombinations) {
    //     return preparedCombinations.some(combination => {
    //         const landCounts = combination.reduce((counts, land) => {
    //             counts[JSON.stringify(land.land)] = land.count;
    //             return counts;
    //         }, {});
    
    //         const handProfile = hand.reduce((profile, land) => {
    //             const key = JSON.stringify(land);
    //             profile[key] = (profile[key] || 0) + 1;
    //             return profile;
    //         }, {});
    
    //         return Object.entries(landCounts).every(([land, count]) => {
    //             return handProfile[land] >= count;
    //         });
    //     });
    // }
    
    
    
    
    
    
    //monteCarloSimulation before trying to batch sim to increase efficiency
    
//     function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
//     return new Promise((resolve, reject) => {
//         const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);
//         const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
//         const numDummyCards = Math.max(deckSize - totalLands, 0);
//         const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
//         let iteration = 0;


//         function runIteration() {
           
//             if ($cancelSimulation) {
//                 reject(new Error("Simulation canceled by user"));
//                 return;
//             }
           
           
//             if (iteration >= numIterations) {
//                 // Set Monte Carlo results in the dedicated store right before resolving the promise
//                 monteCarloResults.set(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
//                 resolve(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
//                 return;
//             }


//             // Update the progress of the simulation
//             simulationProgress.set((iteration / numIterations) * 100);
             
//             let hand = [];
//             let remainingDeck = _.cloneDeep(completeDeck); // Reset the deck for each iteration
//             let metRequirementTurn = -1; // Track when requirements are met

//             // Handle mulligans for turn 0
//             for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
//                 hand = _.sampleSize(remainingDeck, initialDrawSize);
//                 remainingDeck = removeDrawnCardsFromDeck(remainingDeck, hand);
//                 if (handMeetsRequirements(hand, preparedCombinations)) {
//                     probabilitiesByTurn[0]++;
//                     metRequirementTurn = 0;
//                     break;
//                 }
//             }

//             // Simulate drawing for subsequent turns if requirements not met in mulligans
//             if (metRequirementTurn == -1) {
//                 for (let turn = 1; turn <= numberOfTurns; turn++) {
//                     const newCard = _.sample(remainingDeck);
//                     hand.push(newCard);
//                     remainingDeck = removeDrawnCardsFromDeck(remainingDeck, [newCard]);

//                     if (handMeetsRequirements(hand, preparedCombinations)) {
//                         probabilitiesByTurn[turn]++;
//                         metRequirementTurn = turn;
//                         break; // Stop further drawings for this iteration
//                     }
//                 }
//             }

//             // Mark all subsequent turns as meeting requirements once the requirement is met
//             if (metRequirementTurn != -1) {
//                 for (let turn = metRequirementTurn + 1; turn <= numberOfTurns; turn++) {
//                     probabilitiesByTurn[turn]++;
//                 }
//             }

//             iteration++;
//             setTimeout(runIteration, 0); // Schedule the next iteration
//         }

//         runIteration(); // Start the first iteration
//     });
// }

    function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
    return new Promise((resolve, reject) => {
        const probabilitiesByTurn = Array.from({ length: numberOfTurns + 1 }, () => 0);
        const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
        const numDummyCards = Math.max(deckSize - totalLands, 0);
        const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
        let iteration = 0;
        let batchSize = 4; // Number of iterations to process in each batch

        function runIteration() {
            if ($cancelSimulation) {
                reject(new Error("Simulation canceled by user"));
                return;
            }

            let batchCounter = 0;
            while (batchCounter < batchSize && iteration < numIterations) {
                let hand = [];
                let remainingDeck = _.cloneDeep(completeDeck); // Reset the deck for each iteration
                let metRequirementTurn = -1; // Track when requirements are met

                // Handle mulligans for turn 0
                for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
                    hand = _.sampleSize(remainingDeck, initialDrawSize);
                    remainingDeck = removeDrawnCardsFromDeck(remainingDeck, hand);
                    if (handMeetsRequirements(hand, preparedCombinations)) {
                        probabilitiesByTurn[0]++;
                        metRequirementTurn = 0;
                        break;
                    }
                }

                // Simulate drawing for subsequent turns if requirements not met in mulligans
                if (metRequirementTurn == -1) {
                    for (let turn = 1; turn <= numberOfTurns; turn++) {
                        const newCard = _.sample(remainingDeck);
                        hand.push(newCard);
                        remainingDeck = removeDrawnCardsFromDeck(remainingDeck, [newCard]);

                        if (handMeetsRequirements(hand, preparedCombinations)) {
                            probabilitiesByTurn[turn]++;
                            metRequirementTurn = turn;
                            break; // Stop further drawings for this iteration
                        }
                    }
                }

                // Mark all subsequent turns as meeting requirements once the requirement is met
                if (metRequirementTurn != -1) {
                    for (let turn = metRequirementTurn + 1; turn <= numberOfTurns; turn++) {
                        probabilitiesByTurn[turn]++;
                    }
                }

                iteration++;
                batchCounter++;
            }

            // Update the progress of the simulation
            simulationProgress.set((iteration / numIterations) * 100);

            if (iteration < numIterations) {
                setTimeout(runIteration, 0); // Schedule the next batch
            } else {
                // Set Monte Carlo results in the dedicated store right before resolving the promise
                monteCarloResults.set(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
                resolve(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
            }
        }

        runIteration(); // Start the first iteration
    });
}

    
    
    function removeDrawnCardsFromDeck(deck, drawnCards) {
        let tempDeck = _.cloneDeep(deck);
        drawnCards.forEach(card => {
            let index = tempDeck.findIndex(deckCard => _.isEqual(deckCard, card));
            if (index > -1) {
                tempDeck.splice(index, 1); // Replace found card with dummy if it's not a dummy
            }
        });
        return tempDeck;
    }
    
    
    
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
    
           // console.log(`Checking hand against requirements:`, handProfile, landCounts);
    
            const meetsRequirements = Object.entries(landCounts).every(([land, count]) => {
                return handProfile[land] >= count;
            });
    
            if (meetsRequirements) {
              //  console.log(`Hand meets the combination requirements:`, combination);
            } else {
              //  console.log(`Hand does not meet the combination requirements:`, combination);
            }
    
            return meetsRequirements;
        });
    }
    
    
    
    
    
    
    
    
    
// Inside identifyProfiles function
async function identifyProfiles(numIterations) {
    const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
    const neededCombinations = determineNeededCombinations(preparedCards, manaRequirements, totalManaNeeded);
    const preparedCombinations = prepareCombinationsForAnalysis(neededCombinations);
    const landGroupSizes = calculateLandGroupSizes(preparedCards);

    let rawProbabilities = await monteCarloSimulation(
        preparedCombinations,
        landGroupSizes,
        deckSize,
        mulliganCount,
        InitialDrawSize,
        numberOfTurns,
        numIterations
    );

    probabilitiesByTurn.set(rawProbabilities); // Ensure you are using .set() correctly if it's a store
    simulationRun.set(true); // Set simulation run flag to true

    console.log('Simulation results:', $probabilitiesByTurn); // Ensure this logs after the update
    // Call or trigger createGroupCards here if necessary, or ensure it's part of a reactive chain that will catch this update
}



    
    
    // Initialize state
    let preparedCards = [];
    let manaRequirements = {};
    let probabilitiesByTurn = writable([]);
   // let simulationRun = writable(false);
    let currentTurn = writable(0); // Start from turn 0

    
    
    // Reactive statement to update the component's data whenever the store changes
    $: {
        preparedCards = $simulationData.preparedCards;
        manaRequirements = $simulationData.manaRequirements;
        const numIterations = $simulationData.iterations || 8000; // Default to 10000 if undefined
    }
    
    $: if ($simulationData && $simulationData.preparedCards.length > 0 && Object.values($simulationData.manaRequirements).some(value => value > 0)) {
        runSimulation();
    }
    
    
    
    async function runSimulation() {
    simulationRun.set(true);  // Enable the modal
    cancelSimulation.set(false); // Ensure cancellation flag is reset before starting

    // Use setTimeout to defer the simulation start until after the UI has updated
    setTimeout(async () => {
        const numIterations = $simulationData.iterations || 8000;
        try {
            await identifyProfiles(numIterations);
        } catch (error) {
            console.error("Simulation was canceled or an error occurred:", error);
        } finally {
            simulationRun.set(false); // Disable the modal once complete
            cancelSimulation.set(false); // Reset cancellation state
        }
    }, 0); // Timeout set to 0 to push to end of execution queue
}




    //------------------------------------------------------------
    
    
    
    //the following makes the cards output
    function createGroupCards(groups, results, probabilitiesByTurn, turn) {
    console.log("Groups received:", groups);
    console.log("Results received:", results);
    console.log("Probabilities by Turn received:", probabilitiesByTurn);
    console.log("Current turn:", turn);

    let cards = [];

    // Check and use Monte Carlo results if available
    if ($monteCarloResults.length > 0 && $monteCarloResults[turn] !== undefined) {
        let turnTotalProbability = parseFloat($monteCarloResults[turn]);
        let stackedCardsCount = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0) - 1; // Calculate how many cards are in the stack minus the top one
        cards.push({
            probability: turnTotalProbability,
            label: 'Custom',
            color: '#fff',  // Distinct color to differentiate it
            ratioText: convertPercentToRatio(turnTotalProbability),
            stackedCards: Math.max(stackedCardsCount, 0)  // Ensure non-negative
        });
    } else if ($simulationRun) {
        // Fallback to current probabilities if Monte Carlo results are not available
        let turnTotalProbability = parseFloat(probabilitiesByTurn[turn]);
        const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
        cards.push({
            probability: turnTotalProbability,
            label: 'Mana',
            color: '#fff',
            ratioText: convertPercentToRatio(turnTotalProbability),
            stackedCards: Math.max(totalManaNeeded - 1, 0)
        });
    }

    // Process each group and add to the cards array ensuring they do not overwrite the Monte Carlo card
    cards = cards.concat(groups.map(group => {
        let groupName = group.link ? group.link : group.name;
        let groupResult = results[groupName];
        let probabilityPercent = groupResult && turn < groupResult.length ? Math.round(groupResult[turn].probability * 1000) / 10 : null;
        
        // Determine the ratio representation
        let ratioText = convertPercentToRatio(probabilityPercent);

        // Access the color from the groupColors store
        let color = $groupColors[groupName] || '#e5e5e5'; // Default color if not set

        return {
            probability: probabilityPercent,
            label: group.name,
            color,
            ratioText,
            stackedCards: Math.max(group.cardsToDraw - 1, 0) // Subtract 1 because the first card is already displayed
        };   
    }));

    console.log("Cards generated for UI:", cards);

    // Calculate the total number of extra desired cards from hypergeometric groups
    const totalExtraCardsFromGroups = groups.reduce((sum, group) => sum + Math.max(group.cardsToDraw - 1, 0), 0);

    // Calculate the total number of desired cards from mana requirements
    const totalDesiredCardsFromManaRequirements = Math.max(Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0) - 1, 0);

    // Calculate the total number of extra cards, combining groups and mana requirements
    const totalExtraCards = totalExtraCardsFromGroups + totalDesiredCardsFromManaRequirements;

    // Fill up the remaining cards for the turn with blanks, adjusting for mulligans and extra cards
    let adjustedDrawSize = Math.max(InitialDrawSize - mulliganCount - totalExtraCards, 0);
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
                    {#each createGroupCards(groups, results, $probabilitiesByTurn, turn) as card}
                    <div class="card-container" style="margin-right: {7 + (card.stackedCards || 0) * 4}px;">
                        <div class="rectangle" style="background-color: {card.color};">
                            <div class="card-details">
                                <div class="probability">{card.probability !== null ? `${card.probability}%` : ''}</div>
                                <div class="card-ratio">{card.ratioText}</div>
                            </div>
                        </div>
                        <div class="stacked-cards">
                            {#each Array(card.stackedCards || 0).reverse() as _, i}
                            <div class="stacked-card" style="left: {i * 4}px; z-index: {-(i + 1)}; background-color: {card.color};"></div>
                            {/each}
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
    
    .stacked-cards {
        position: absolute;
        left: 4px;
    }
    
    .stacked-card {
        position: absolute;
        width: 52px; /* Same as the width of the main card */
        height: 72px; /* Same as the height of the main card */
        border: 1px solid rgb(142, 142, 142);
        border-radius: 4px;
        background-color: rgb(255, 255, 255);
        top: 0;
        z-index: -1; /* Ensure the stacked cards appear behind the main card */
    }
    
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
        position: relative;
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
        font-size: 0.7em;
        text-align: center;
        width: 54px;
        word-wrap: break-word;
        hyphens: auto;
        text-wrap: balance;
        overflow-wrap: break-word;
    }
    
    
    </style>