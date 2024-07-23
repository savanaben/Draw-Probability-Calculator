

<script>






//THIS version had the most efficient getAllCombinations code, but that code is not
//yielding to the UI. can't find a way to keep this efficiency while periodic
//yield to UI. 













    import { groupColors, neededCombinationsCount, numberOfTurns } from './colorStore.js';
    import { simulationData, monteCarloResults, monteCarloHandResults, simulationRun, cancelSimulation, simulationProgress, combinationProgress, shouldResetSimulation, mulliganConfig, simplifiedRampMana, simulationType } from './colorStore.js';
    // Additional imports for randomness
    import { sampleSize } from 'lodash';
    import _ from 'lodash';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Popover from './Popover.svelte';
    import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

  // Log the value of numberOfTurns
  $: console.log('numberOfTurns:', $numberOfTurns);
  $: console.log('Mulligan Configuration:', $mulliganConfig);


    function selectInput(event) {
    event.target.select(); // Selects all text in the input upon focus
}

    
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
    
        for (let turn = 1; turn <= $numberOfTurns.length; turn++) {
        totalCardsSeen += $numberOfTurns[turn - 1]; // Use the number of cards drawn for each turn
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
        let showPopover = false;

    
    
        // Reactive statement to calculate probabilities when groups or numberOfTurns changes
        $: if (groups.length > 0 || $numberOfTurns) {
        calculateProbabilities();
        console.log('Results after calculateProbabilities:', results);

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
    
    
    
//before I messed with draws PER TURN

    // function calculateSingleGroup(group) {
    //     const groupResults = [];
    //     let totalCardsSeen = InitialDrawSize;
    
    //     // Calculate the probability for turn 0 without mulligans
    //     let initialProb = 0;
    //     for (let k = group.cardsToDraw; k <= Math.min(totalCardsSeen, group.size); k++) {
    //         initialProb += hypergeometricCDF(k, deckSize, group.size, totalCardsSeen);
    //     }
    
    //     // Adjust the initial probability to account for mulligans
    //     let turn0Prob = 1 - Math.pow((1 - initialProb), mulliganCount + 1);
    //     groupResults.push({ turn: 0, probability: turn0Prob });
    
    //     for (let turn = 1; turn <= $numberOfTurns; turn++) {
    //         totalCardsSeen += 1;
    //         let probAtLeastDesiredA = 0;
    //         for (let k = group.cardsToDraw; k <= Math.min(totalCardsSeen, group.size); k++) {
    //             probAtLeastDesiredA += hypergeometricCDF(k, deckSize, group.size, totalCardsSeen);
    //         }
    
    //         if (mulliganCount > 0) {
    //             let probNotDrawingCombination = Math.pow((1 - initialProb), mulliganCount); // (1 - P) for each mulligan
    //             probAtLeastDesiredA = 1 - (probNotDrawingCombination * (1 - probAtLeastDesiredA));
    //         }
    
    //         groupResults.push({ turn, probability: probAtLeastDesiredA });
    //     }
    
    //     results[group.name] = groupResults;
    // }
    
    

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

        console.log(`Turn 0 - Group: ${group.name}, Probability: ${turn0Prob}`);


        for (let turn = 1; turn <= $numberOfTurns.length; turn++) {
            totalCardsSeen += $numberOfTurns[turn - 1]; // Use the number of cards drawn for each turn
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
        console.log(`Group Results for ${group.name}:`, groupResults);

    }
    
    
    //the following is the start of mana probability calculations -------------------
    $: {
    console.log('calculation file Simplified Ramp Mana:', $simplifiedRampMana); // Log the simplified ramp mana
   }
    
// //the following is the old less efficient combination code
// //still undergoing full testing to verify new code is accurate before delete this

//     function determineNeededCombinations(lands, requirements, totalManaNeeded) {
//     let combinedLands = [...lands, ...$simplifiedRampMana];
//     console.log('Combined Lands:', combinedLands); // Log the combined lands
//     const combinations = getAllCombinations(combinedLands, true, totalManaNeeded);
//     return combinations.filter(combination => satisfiesRequirements(combination, requirements, totalManaNeeded));
// }
    
    
//     function satisfiesRequirements(combination, requirements, totalManaNeeded) {
//         if (combination.length < totalManaNeeded) return false;
    
//         // Create a list of all possible mana profiles this combination can produce
//         let possibleManaProfiles = combination.map(land => Object.keys(land));
    
//         // Generate all possible selections of mana from these profiles
//         let allSelections = generateAllSelections(possibleManaProfiles);
    
//         // Check if any selection satisfies the requirements
//         return allSelections.some(selection => {
//             let manaProfile = selection.reduce((profile, color) => {
//                 profile[color] = (profile[color] || 0) + 1;
//                 return profile;
//             }, {});
//             return Object.entries(requirements).every(([color, amount]) => manaProfile[color] >= amount);
//         });
//     }
    
// //BEFORE MASSIVE CHANGES ATTEMPT TO BATCH
// function getAllCombinations(lands, allowDuplicates, totalManaNeeded) {
//     // Reset the progress bar at the start of the simulation
//     combinationProgress.set(0);

//     const combinations = [];
//     const landCounts = lands.reduce((counts, land) => {
//         const key = JSON.stringify(land);
//         counts[key] = (counts[key] || 0) + 1;
//         return counts;
//     }, {});

//     const totalLands = lands.length; // Total number of lands for progress calculation
//     const estimatedTotalCombinations = binomialCoefficient(totalLands, totalManaNeeded); // Estimate total combinations
//     console.log(`Estimated Total Combinations: ${estimatedTotalCombinations}`);
//     let currentIteration = 0; // Track the current iteration


//     const generateCombinations = (index, currentCombination, currentCounts) => {
//       //  console.log(`Index: ${index}, Current Combination: ${JSON.stringify(currentCombination)}, Current Counts: ${JSON.stringify(currentCounts)}`);
        
//         if (currentCombination.length > totalManaNeeded) return;
//         if (index === lands.length) {
//             const combinationKey = JSON.stringify(currentCombination.map(land => JSON.stringify(land)).sort());
//             combinations.push(combinationKey);
//         //  console.log(`Added Combination: ${combinationKey}`);
//         currentIteration++;
//         return;
//         }

//         // Update progress based on the current iteration and estimated total combinations
        
//         const progress = (currentIteration / estimatedTotalCombinations) * 100;
//         combinationProgress.set(progress);
//       //  console.log(`Progress: ${progress}%`);

//         generateCombinations(index + 1, currentCombination, currentCounts);
//         const land = lands[index];
//         const landKey = JSON.stringify(land);
//         if (!currentCounts[landKey] || currentCounts[landKey] < landCounts[landKey]) {
//             const newCounts = { ...currentCounts, [landKey]: (currentCounts[landKey] || 0) + 1 };
//             generateCombinations(index + 1, [...currentCombination, land], newCounts);
//         }
//     };

//     generateCombinations(0, [], {});

//     const finalCombinations = Array.from(new Set(combinations)).map(key => JSON.parse(key).map(landStr => JSON.parse(landStr)));
//     console.log(`Total Combinations Generated: ${combinations.length}`);
//     console.log(`Final Combinations: ${JSON.stringify(finalCombinations)}`);
//     return finalCombinations;
// }

//------------------------------------------------------------------------------------


//the following is updated more efficient combination code. some day maybe try changing this to a bipartite matching approach.
//still undergoing full testing to verify accuracy. Replaced the recursive combination generation with a dynamic programming approach.This approach uses a 2D array (dp) where dp[i] contains sets of combinations of size i. For each land, it iterates backward through dp to update possible combinations efficiently
function determineNeededCombinations(lands, requirements, totalManaNeeded) {
    let combinedLands = [...lands, ...$simplifiedRampMana];
    console.log('Combined Lands:', combinedLands); // Log the combined lands
    const combinations = getAllCombinations(combinedLands, totalManaNeeded);
    return combinations.filter(combination => satisfiesRequirements(combination, requirements));
}

function satisfiesRequirements(combination, requirements) {
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


function getAllCombinations(lands, totalManaNeeded) {
    const dp = Array(totalManaNeeded + 1).fill(null).map(() => new Set());
    dp[0].add(JSON.stringify([]));

    for (let land of lands) {
        const landStr = JSON.stringify(land);
        for (let i = totalManaNeeded; i > 0; i--) {
            for (let combination of dp[i - 1]) {
                const newCombination = JSON.parse(combination).concat(landStr).sort();
                dp[i].add(JSON.stringify(newCombination));
            }
        }
    }

    const finalCombinations = Array.from(dp[totalManaNeeded]).map(key => JSON.parse(key).map(landStr => JSON.parse(landStr)));
    console.log(`Total Combinations Generated: ${finalCombinations.length}`);
    console.log(`Final Combinations: ${JSON.stringify(finalCombinations)}`);
    return finalCombinations;
}


//-------------------------------------------
    

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
    
    
// Function to calculate the binomial coefficient
function binomialCoefficient(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k); // Take advantage of symmetry
    let c = 1;
    for (let i = 0; i < k; i++) {
        c = c * (n - i) / (i + 1);
    }
    return c;
}









// function getAllCombinations(lands, allowDuplicates, totalManaNeeded) {
//     return new Promise((resolve, reject) => {
//         // Reset the progress bar at the start of the simulation
//         combinationProgress.set(0);

//         const combinations = [];
//         const landCounts = lands.reduce((counts, land) => {
//             const key = JSON.stringify(land);
//             counts[key] = (counts[key] || 0) + 1;
//             return counts;
//         }, {});

//         const totalLands = lands.length; // Total number of lands for progress calculation
//         const estimatedTotalCombinations = binomialCoefficient(totalLands, totalManaNeeded); // Estimate total combinations
//         console.log(`Estimated Total Combinations: ${estimatedTotalCombinations}`);
//         let currentIteration = 0; // Track the current iteration

//         const stack = [{ index: 0, currentCombination: [], currentCounts: {} }];
//         const batchSize = 100; // Number of iterations to process before yielding control

//         function processBatch() {
//             let batchCounter = 0;

//             while (stack.length > 0 && batchCounter < batchSize) {
//                 const { index, currentCombination, currentCounts } = stack.pop();

//                 if (currentCombination.length > totalManaNeeded) continue;
//                 if (index === lands.length) {
//                     const combinationKey = JSON.stringify(currentCombination.map(land => JSON.stringify(land)).sort());
//                     combinations.push(combinationKey);
//                     currentIteration++;
//                     continue;
//                 }

//                 // Update progress based on the current iteration and estimated total combinations
//                 const progress = (currentIteration / estimatedTotalCombinations) * 100;
//                 combinationProgress.set(progress);

//                 stack.push({ index: index + 1, currentCombination, currentCounts });
//                 const land = lands[index];
//                 const landKey = JSON.stringify(land);
//                 if (!currentCounts[landKey] || currentCounts[landKey] < landCounts[landKey]) {
//                     const newCounts = { ...currentCounts, [landKey]: (currentCounts[landKey] || 0) + 1 };
//                     stack.push({ index: index + 1, currentCombination: [...currentCombination, land], currentCounts: newCounts });
//                 }

//                 batchCounter++;
//             }

//             if (stack.length > 0) {
//                 setTimeout(processBatch, 0); // Yield control back to the UI
//             } else {
//                 // All batches are complete, resolve the promise with the final combinations
//                 const finalCombinations = Array.from(new Set(combinations)).map(key => JSON.parse(key).map(landStr => JSON.parse(landStr)));
//                 console.log(`Total Combinations Generated: ${combinations.length}`);
//                 console.log(`Final Combinations: ${JSON.stringify(finalCombinations)}`);
//                 resolve(finalCombinations);
//             }
//         }

//         processBatch();
//     });
// }




            
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
    
    
    
    
    // function transformCombinationForLinkedGroups(combination, landGroupSizes) {
    //     return combination.map(landCount => {
    //         const landKey = JSON.stringify(landCount.land);
    //         const groupSize = landGroupSizes.find(group => JSON.stringify(group.land) === landKey).count;
    //         return {
    //             size: groupSize,
    //             cardsToDraw: landCount.count
    //         };
    //     });
    // }
    
    

//ORIGINAL MONTE CARLO SIM BEFORE RAMP Attempts

// function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
//     return new Promise((resolve, reject) => {
//         const probabilitiesByTurn = Array.from({ length: numberOfTurns.length + 1 }, () => 0); // Updated to use numberOfTurns.length
//         const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
//         const numDummyCards = Math.max(deckSize - totalLands, 0);
//         const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
//         let iteration = 0;
        

//         // Calculate the total mana needed to determine the batch size. this
//         // improves performance 

//         const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
//         let batchSize;
//         if (totalManaNeeded <= 2) {
//             batchSize = 50;
//         } else if (totalManaNeeded === 3) {
//             batchSize = 30;
//         } else if (totalManaNeeded === 4) {
//             batchSize = 20;
//         } else if (totalManaNeeded === 5) {
//             batchSize = 20;
//         } else {
//             batchSize = 20;
//         }

//         function runIteration() {
//             if ($cancelSimulation) {
//                 reject(new Error("Simulation canceled by user"));
//                 return;
//             }

//             let batchCounter = 0;
//             while (batchCounter < batchSize && iteration < numIterations) {
//                 let hand = [];
//                 let remainingDeck = _.cloneDeep(completeDeck); // Reset the deck for each iteration
//                 let metRequirementTurn = -1; // Track when requirements are met

//                 // Handle mulligans for turn 0
//                 for (let mulligan = 0; mulligan <= mulliganCount; mulligan++) {
//                     hand = _.sampleSize(remainingDeck, initialDrawSize);
//                     remainingDeck = removeDrawnCardsFromDeck(remainingDeck, hand);
//                     if (handMeetsRequirements(hand, preparedCombinations)) {
//                         probabilitiesByTurn[0]++;
//                         metRequirementTurn = 0;
//                         break;
//                     }
//                 }

//                 // Simulate drawing for subsequent turns if requirements not met in mulligans
//                 if (metRequirementTurn == -1) {
//                     for (let turn = 1; turn <= numberOfTurns.length; turn++) { // Updated to use numberOfTurns.length
//                         const cardsToDraw = numberOfTurns[turn - 1]; // Use the number of cards drawn for each turn
//                         const newCards = _.sampleSize(remainingDeck, cardsToDraw); // Draw multiple cards based on numberOfTurns
//                         hand.push(...newCards);
//                         remainingDeck = removeDrawnCardsFromDeck(remainingDeck, newCards);

//                         if (handMeetsRequirements(hand, preparedCombinations)) {
//                             probabilitiesByTurn[turn]++;
//                             metRequirementTurn = turn;
//                             break; // Stop further drawings for this iteration
//                         }
//                     }
//                 }

//                 // Mark all subsequent turns as meeting requirements once the requirement is met
//                 if (metRequirementTurn != -1) {
//                     for (let turn = metRequirementTurn + 1; turn <= numberOfTurns.length; turn++) { // Updated to use numberOfTurns.length
//                         probabilitiesByTurn[turn]++;
//                     }
//                 }

//                 iteration++;
//                 batchCounter++;
//             }

//             // Update the progress of the simulation
//             simulationProgress.set((iteration / numIterations) * 100);

//             if (iteration < numIterations) {
//                 setTimeout(runIteration, 0); // Schedule the next batch
//             } else {
//                 // Set Monte Carlo results in the dedicated store right before resolving the promise
//                 monteCarloResults.set(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
//                 resolve(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
//             }
//         }

//         runIteration(); // Start the first iteration
//     });
// }

//---------------------------------------------------------------------

// ORIGINAL HAND MEETS REQUIREMENTS - CHECKING HAND NOT AvailableManaThisTurn


// function handMeetsRequirements(hand, preparedCombinations) {
//      //   console.log('Checking hand against requirements:', hand);
//      //   console.log('Prepared combinations:', preparedCombinations);

//         return preparedCombinations.some(combination => {
//             const landCounts = combination.reduce((counts, land) => {
//                 counts[JSON.stringify(land.land)] = land.count;
//                 return counts;
//             }, {});
    
//             const handProfile = hand.reduce((profile, land) => {
//                 const key = JSON.stringify(land);
//                 profile[key] = (profile[key] || 0) + 1;
//                 return profile;
//             }, {});
    
//            // console.log(`Checking hand against requirements:`, handProfile, landCounts);

//             const meetsRequirements = Object.entries(landCounts).every(([land, count]) => {
//                 return handProfile[land] >= count;
//             });
    
//             if (meetsRequirements) {
//               //  console.log(`Hand meets the combination requirements:`, combination);
//             } else {
//               //  console.log(`Hand does not meet the combination requirements:`, combination);
//             }
    
//             return meetsRequirements;
//         });
//     }




function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganConfig, initialDrawSize, numberOfTurns, numIterations, neededCombinations) {
    return new Promise((resolve, reject) => {
        console.log('mulliganConfig:', _.cloneDeep(mulliganConfig)); // Log mulliganConfig to verify it's passed correctly

        const probabilitiesByTurn = Array.from({ length: numberOfTurns.length + 1 }, () => 0); // Updated to use numberOfTurns.length
        const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
        const numDummyCards = Math.max(deckSize - totalLands, 0);
        const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
        let iteration = 0;
        
        let totalAvailableMana = [];
        let totalAvailableRamp = [];

        // Calculate the total mana needed to determine the batch size. this
        // improves performance 
        const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
        let batchSize;
        if (totalManaNeeded <= 2) {
            batchSize = 50;
        } else if (totalManaNeeded === 3) {
            batchSize = 30;
        } else {
            batchSize = 20;
        }

        function runIteration() {

            // Reset totalAvailableMana and totalAvailableRamp for each iteration
            let totalAvailableMana = [];
            let totalAvailableRamp = [];

            let hand = _.sampleSize(completeDeck, initialDrawSize);
            let remainingDeck = removeDrawnCardsFromDeck(completeDeck, hand);

            // Perform mulligans
            const { finalHand, remainingDeck: updatedDeck } = londonMulligan(hand, remainingDeck);
            hand = finalHand;
            remainingDeck = updatedDeck;

            // Reset and update available mana
            let { AvailableManaThisTurn, meetsRequirements } = resetAndUpdateAvailableMana(totalAvailableMana, totalAvailableRamp, 0, neededCombinations);

            // Check 1: If requirements are met, update probabilities and continue
            if (meetsRequirements) {
                probabilitiesByTurn[0]++;
                for (let turn = 1; turn <= numberOfTurns.length; turn++) {
                    probabilitiesByTurn[turn]++;
                }
            } else {
                for (let turn = 1; turn <= numberOfTurns.length; turn++) { // Updated to use numberOfTurns.length
                    const cardsToDraw = numberOfTurns[turn - 1]; // Use the number of cards drawn for each turn
                    const newCards = _.sampleSize(remainingDeck, cardsToDraw); // Draw multiple cards based on numberOfTurns
                    hand.push(...newCards);
                    remainingDeck = removeDrawnCardsFromDeck(remainingDeck, newCards);

                    // Log the card drawn and the hand after drawing
                    console.log(`Turn ${turn} - Draw ${cardsToDraw}`);
                    console.log('Card(s) Drawn:', _.cloneDeep(newCards));
                    console.log('Hand after drawing:', _.cloneDeep(hand));

                    // Play lands based on the new rules
                    playLands(hand, totalAvailableMana);

                    // Log after moving land to mana
                    console.log('After moving land to mana:');
                    console.log('Total played Mana:', _.cloneDeep(totalAvailableMana));
                    console.log('Hand:', _.cloneDeep(hand));

                    // Reset and update AvailableManaThisTurn
                    ({ AvailableManaThisTurn, meetsRequirements } = resetAndUpdateAvailableMana(totalAvailableMana, totalAvailableRamp, turn, neededCombinations));

                    // Log the updated AvailableManaThisTurn
                    console.log('AvailableManaThisTurn:', _.cloneDeep(AvailableManaThisTurn));

                    // Play ramp cards if possible
                    playRampCards(hand, AvailableManaThisTurn, totalAvailableRamp, turn);

                    // Log after playing ramp cards
                    console.log('After playing ramp cards:');
                    console.log('Total played Ramp:', _.cloneDeep(totalAvailableRamp));
                    console.log('AvailableManaThisTurn:', _.cloneDeep(AvailableManaThisTurn));
                    console.log('Hand:', _.cloneDeep(hand));

                    // Check 2: Compare AvailableManaThisTurn against neededCombinations after all ramp is played
                    if (meetsRequirements) {
                        for (let t = turn; t <= numberOfTurns.length; t++) {
                            probabilitiesByTurn[t]++;
                        }
                        break; // Stop further drawings for this iteration
                    }
                }
            }

            iteration++;
        }

        async function runBatch() {
            let batchCounter = 0;
            while (batchCounter < batchSize && iteration < numIterations) {
                if ($cancelSimulation) {
                    reject(new Error("Simulation canceled by user"));
                    return;
                }
                await runIteration();
                batchCounter++;
            }

            // Update the progress of the simulation
            simulationProgress.set((iteration / numIterations) * 100);

            if (iteration < numIterations) {
                setTimeout(runBatch, 0); // Schedule the next batch
            } else {
                // Set Monte Carlo results in the dedicated store right before resolving the promise
                monteCarloResults.set(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
                console.log('Probabilities by Turn:', probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
                resolve({
                    probabilitiesByTurn: probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1))
                });
            }
        }

        runBatch();
    });
}

function monteCarloSimulationHand(preparedCombinations, landGroupSizes, deckSize, mulliganConfig, initialDrawSize, numberOfTurns, numIterations) {
    return new Promise((resolve, reject) => {
        const probabilitiesByTurnHand = Array.from({ length: numberOfTurns.length + 1 }, () => 0); // Track success based on hand
        const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
        const numDummyCards = Math.max(deckSize - totalLands, 0);
        const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
        let iteration = 0;

        // Calculate the total mana needed to determine the batch size. this
        // improves performance 
        const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
        let batchSize;
        if (totalManaNeeded <= 2) {
            batchSize = 50;
        } else if (totalManaNeeded === 3) {
            batchSize = 30;
        } else {
            batchSize = 20;
        }

        function runIteration() {
            let hand = _.sampleSize(completeDeck, initialDrawSize);
            let remainingDeck = removeDrawnCardsFromDeck(completeDeck, hand);

            // Perform mulligans
            const { finalHand, remainingDeck: updatedDeck } = londonMulligan(hand, remainingDeck);
            hand = finalHand;
            remainingDeck = updatedDeck;

            // Check if the hand meets the requirements after mulligans
            let meetsRequirements = handMeetsRequirements(hand, preparedCombinations);
            if (meetsRequirements) {
                for (let turn = 0; turn <= numberOfTurns.length; turn++) {
                    probabilitiesByTurnHand[turn]++;
                }
            } else {
                for (let turn = 1; turn <= numberOfTurns.length; turn++) {
                    const cardsToDraw = numberOfTurns[turn - 1];
                    const newCards = _.sampleSize(remainingDeck, cardsToDraw);
                    hand.push(...newCards);
                    remainingDeck = removeDrawnCardsFromDeck(remainingDeck, newCards);

                    // Log the card drawn and the hand after drawing
                    console.log(`Turn ${turn} - Draw ${cardsToDraw}`);
                    console.log('Card(s) Drawn:', _.cloneDeep(newCards));
                    console.log('Hand after drawing:', _.cloneDeep(hand));

                    if (handMeetsRequirements(hand, preparedCombinations)) {
                        for (let t = turn; t <= numberOfTurns.length; t++) {
                            probabilitiesByTurnHand[t]++;
                        }
                        console.log(`Turn ${turn} - Parallel hand meets requirements`);
                        break; // Stop further drawings for this iteration
                    }
                }
            }

            iteration++;
        }

        function runBatch() {
            let batchCounter = 0;
            while (batchCounter < batchSize && iteration < numIterations) {
                if ($cancelSimulation) {
                    reject(new Error("Simulation canceled by user"));
                    return;
                }
                runIteration();
                batchCounter++;
            }

            // Update the progress of the simulation
            simulationProgress.set((iteration / numIterations) * 100);

            if (iteration < numIterations) {
                setTimeout(runBatch, 0); // Schedule the next batch
            } else {
                // Set Monte Carlo hand results in the dedicated store right before resolving the promise
                monteCarloHandResults.set(probabilitiesByTurnHand.map(prob => (prob / numIterations * 100).toFixed(1)));
                console.log('Probabilities by Turn (Hand):', probabilitiesByTurnHand.map(prob => (prob / numIterations * 100).toFixed(1)));
                resolve({
                    probabilitiesByTurnHand: probabilitiesByTurnHand.map(prob => (prob / numIterations * 100).toFixed(1))
                });
            }
        }

        runBatch();
    });
}


function preprocessRampCards(hand) {
    let processedRampCards = [];

    hand.forEach(card => {
        if (card.ColorsCanProduce && card.CanProduce) {
            for (let i = 0; i < card.CanProduce; i++) {
                let processedCard = {};
                Object.entries(card.ColorsCanProduce).forEach(([color, count]) => {
                    if (count > 0) {
                        processedCard[color] = count;
                    }
                });
                processedRampCards.push(processedCard);
            }
        }
    });

    return processedRampCards;
}

function handMeetsRequirements(hand, preparedCombinations) {
    // Preprocess ramp cards
    const processedRampCards = preprocessRampCards(hand);

    // Combine lands and processed ramp cards
    const combinedHand = hand.filter(card => !card.ColorsCanProduce).concat(processedRampCards);

    // Log the processed ramp cards and combined hand
  //  console.log('Processed Ramp Cards:', processedRampCards);
  //  console.log('Combined Hand:', combinedHand);


    return preparedCombinations.some(combination => {
        const landCounts = combination.reduce((counts, land) => {
            counts[JSON.stringify(land.land)] = land.count;
            return counts;
        }, {});

        const handProfile = combinedHand.reduce((profile, land) => {
            const key = JSON.stringify(land);
            profile[key] = (profile[key] || 0) + 1;
            return profile;
        }, {});

      // Log the hand profile and land counts
    //  console.log('Hand Profile:', handProfile);
    //  console.log('Land Counts:', landCounts);

        return Object.entries(landCounts).every(([land, count]) => {
            return handProfile[land] >= count;
        });
    });
}
//MonTE CARLO SIM BEFORE HAND AND FIELD MERGE ATTEMPT-------------------------------

// function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganConfig, initialDrawSize, numberOfTurns, numIterations, neededCombinations) {
//     return new Promise((resolve, reject) => {
//         console.log('mulliganConfig:', _.cloneDeep(mulliganConfig)); // Log mulliganConfig to verify it's passed correctly

//         const probabilitiesByTurn = Array.from({ length: numberOfTurns.length + 1 }, () => 0); // Updated to use numberOfTurns.length
//         const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
//         const numDummyCards = Math.max(deckSize - totalLands, 0);
//         const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
//         let iteration = 0;
        
//         let totalAvailableMana = [];
//         let totalAvailableRamp = [];

//         // Calculate the total mana needed to determine the batch size. this
//         // improves performance 
//         const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
//         let batchSize;
//         if (totalManaNeeded <= 2) {
//             batchSize = 50;
//         } else if (totalManaNeeded === 3) {
//             batchSize = 30;
//         } else {
//             batchSize = 20;
//         }

//         function runIteration() {

//             // Reset totalAvailableMana and totalAvailableRamp for each iteration
//             let totalAvailableMana = [];
//             let totalAvailableRamp = [];

//             let hand = _.sampleSize(completeDeck, initialDrawSize);
//             let remainingDeck = removeDrawnCardsFromDeck(completeDeck, hand);

//             // Perform mulligans
//             const { finalHand, remainingDeck: updatedDeck } = londonMulligan(hand, remainingDeck);
//             hand = finalHand;
//             remainingDeck = updatedDeck;

//             // Reset and update available mana
//             let { AvailableManaThisTurn, meetsRequirements } = resetAndUpdateAvailableMana(totalAvailableMana, totalAvailableRamp, 0, neededCombinations);

//             // Check 1: If requirements are met, update probabilities and continue
//             if (meetsRequirements) {
//                 probabilitiesByTurn[0]++;
//                 for (let turn = 1; turn <= numberOfTurns.length; turn++) {
//                     probabilitiesByTurn[turn]++;
//                 }
//             } else {
//                 for (let turn = 1; turn <= numberOfTurns.length; turn++) { // Updated to use numberOfTurns.length
//                     const cardsToDraw = numberOfTurns[turn - 1]; // Use the number of cards drawn for each turn
//                     const newCards = _.sampleSize(remainingDeck, cardsToDraw); // Draw multiple cards based on numberOfTurns
//                     hand.push(...newCards);
//                     remainingDeck = removeDrawnCardsFromDeck(remainingDeck, newCards);

//                     // Log the card drawn and the hand after drawing
//                     console.log(`Turn ${turn} - Draw ${cardsToDraw}`);
//                     console.log('Card(s) Drawn:', _.cloneDeep(newCards));
//                     console.log('Hand after drawing:', _.cloneDeep(hand));

//                     // Play lands based on the new rules
//                     playLands(hand, totalAvailableMana);

//                     // Log after moving land to mana
//                     console.log('After moving land to mana:');
//                     console.log('Total played Mana:', _.cloneDeep(totalAvailableMana));
//                     console.log('Hand:', _.cloneDeep(hand));

//                     // Reset and update AvailableManaThisTurn
//                     ({ AvailableManaThisTurn, meetsRequirements } = resetAndUpdateAvailableMana(totalAvailableMana, totalAvailableRamp, turn, neededCombinations));

//                     // Log the updated AvailableManaThisTurn
//                     console.log('AvailableManaThisTurn:', _.cloneDeep(AvailableManaThisTurn));

//                     // Play ramp cards if possible
//                     playRampCards(hand, AvailableManaThisTurn, totalAvailableRamp, turn);

//                     // Log after playing ramp cards
//                     console.log('After playing ramp cards:');
//                     console.log('Total played Ramp:', _.cloneDeep(totalAvailableRamp));
//                     console.log('AvailableManaThisTurn:', _.cloneDeep(AvailableManaThisTurn));
//                     console.log('Hand:', _.cloneDeep(hand));

//                     // Check 2: Compare AvailableManaThisTurn against neededCombinations after all ramp is played
//                     if (meetsRequirements) {
//                         for (let t = turn; t <= numberOfTurns.length; t++) {
//                             probabilitiesByTurn[t]++;
//                         }
//                         break; // Stop further drawings for this iteration
//                     }
//                 }
//             }

//             iteration++;
//         }

//         function runBatch() {
//     let batchCounter = 0;
//     while (batchCounter < batchSize && iteration < numIterations) {
//         if ($cancelSimulation) {
//             reject(new Error("Simulation canceled by user"));
//             return;
//         }
//         runIteration();
//         batchCounter++;
//     }

//             // Update the progress of the simulation
//             simulationProgress.set((iteration / numIterations) * 100);

//             if (iteration < numIterations) {
//                 setTimeout(runBatch, 0); // Schedule the next batch
//             } else {
//                 // Set Monte Carlo results in the dedicated store right before resolving the promise
//                 monteCarloResults.set(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
//                 resolve(probabilitiesByTurn.map(prob => (prob / numIterations * 100).toFixed(1)));
//             }
//         }

//         runBatch(); // Start the first batch
//     });
// }

//---------------------------------------------------

//DEAD END THIS VERSION TRIED TO DO THE COMBINATION CALC DIRECTLY

// function manaPoolMeetsRequirements(availableMana) {
//     const manaRequirements = $simulationData.manaRequirements;
//     console.log('manaPoolMeetsRequirements AvailableManaThisTurn:', _.cloneDeep(availableMana));
//     console.log('manaPoolMeetsRequirements manaRequirements:', _.cloneDeep(manaRequirements));

//     // Convert manaRequirements into an array of single color requirements
//     const requirementArray = Object.entries(manaRequirements).map(([color, count]) => {
//         const reqs = [];
//         for (let i = 0; i < count; i++) {
//             reqs.push({ [color]: 1 });
//         }
//         return reqs;
//     }).flat();

//     // Helper function to generate all combinations of a specific length
//     function generateCombinations(arr, length) {
//         const result = [];
//         const combination = [];

//         function helper(start) {
//             if (combination.length === length) {
//                 result.push(combination.slice());
//                 return;
//             }
//             for (let i = start; i < arr.length; i++) {
//                 combination.push(arr[i]);
//                 helper(i + 1);
//                 combination.pop();
//             }
//         }

//         helper(0);
//         return result;
//     }

//     // Check if a given combination can meet the mana requirements
//     function meetsRequirements(combination, requirements) {
//         console.log('Checking combination:', combination);
//         const usedSources = new Set();
//         const requirementList = requirements.slice();

//         for (const requirement of requirementList) {
//             const [color] = Object.keys(requirement);
//             let found = false;
//             for (let i = 0; i < combination.length; i++) {
//                 if (!usedSources.has(i)) {
//                     const source = combination[i];
//                     if (source[color] > 0) {
//                         usedSources.add(i);
//                         source[color]--;
//                         found = true;
//                         console.log(`Requirement for ${color} met by source ${i}`, source);
//                         break;
//                     }
//                 }
//             }
//             if (!found) {
//                 console.log(`Requirement for ${color} not met`);
//                 return false;
//             }
//         }
//         return true;
//     }

//     // Generate all combinations of available mana sources with length equal to the number of different mana requirements
//     const combinations = generateCombinations(availableMana, requirementArray.length);

//     // Check each combination to see if it meets the mana requirements
//     for (const combination of combinations) {
//         if (meetsRequirements(_.cloneDeep(combination), requirementArray)) {
//             console.log('manaRequirements met: yes');
//             return true;
//         }
//     }

//     console.log('manaRequirements met: no');
//     return false;
// }





//THIS VRESION WAS using the neededCombinations, not trying to calc directly

function manaPoolMeetsRequirements(availableMana, neededCombinations) {
        console.log('AvailableManaThisTurn:', _.cloneDeep(availableMana));
        console.log('neededCombinations:', _.cloneDeep(neededCombinations));

        const result = neededCombinations.some(combination => {
            // Create a copy of availableMana to track used mana
            const availableManaCopy = _.cloneDeep(availableMana);

            // console.log('Checking combination:', combination);

            // Check if every needed mana object in the combination is matched by an available mana object
            const combinationResult = combination.every(needed => {
                const index = availableManaCopy.findIndex(mana => {
                    const match = Object.keys(needed).length === Object.keys(mana).length &&
                                  Object.entries(needed).every(([color, count]) => {
                                      return mana[color] === count;
                                  });
                    // console.log(`Needed: ${JSON.stringify(needed)}, Mana: ${JSON.stringify(mana)}, Match: ${match}`);
                    return match;
                });

                if (index !== -1) {
                    // Remove the matched mana from the copy to prevent reuse
                    // console.log(`Matched and removing: ${JSON.stringify(availableManaCopy[index])}`);
                    availableManaCopy.splice(index, 1);
                    return true;
                }

                return false;
            });

            // console.log(`Combination result: ${combinationResult}`);
            return combinationResult;
        });

        console.log(`neededCombinations met: ${result ? 'yes' : 'no'}`);
        return result;
    }








function londonMulligan(hand, remainingDeck) {
    let mulligansTaken = 0;
    let finalHand = hand;

    // Destructure the mulliganConfig store
    const { maxMulligans, firstMulliganFree, freeMulliganTillLands, minLandsInHand, maxLandsInHand } = $mulliganConfig;

    // Initial draw
    finalHand = _.sampleSize(remainingDeck, InitialDrawSize);
    remainingDeck = removeDrawnCardsFromDeck(remainingDeck, finalHand);

    // Log the initial hand and remaining deck
    console.log(`Initial Draw: Hand`, _.cloneDeep(finalHand));
 //   console.log(`Initial Draw: Remaining Deck`, _.cloneDeep(remainingDeck));

        // Adjust the loop condition to ignore maxMulligans when freeMulliganTillLands is true
        while (freeMulliganTillLands || mulligansTaken <= maxMulligans) {
        // Check if the hand meets the land requirements
        const landCount = finalHand.filter(card => !card.TotalManaCost && !card.dummy).length;
        const meetsLandRequirements = landCount >= minLandsInHand && landCount <= maxLandsInHand;

        // Log the land count and whether the hand meets the land requirements
        console.log(`Mulligan ${mulligansTaken}: Land Count`, landCount);
        console.log(`Mulligan ${mulligansTaken}: Meets Land Requirements`, meetsLandRequirements);

        if (meetsLandRequirements) {
            break;
        }

        if (mulligansTaken > 0 || firstMulliganFree || (freeMulliganTillLands && !meetsLandRequirements)) {
            // Shuffle hand into deck and redraw
            remainingDeck = remainingDeck.concat(finalHand);
            finalHand = _.sampleSize(remainingDeck, InitialDrawSize);
            remainingDeck = removeDrawnCardsFromDeck(remainingDeck, finalHand);

            // Log the new hand and remaining deck after redraw
            console.log(`Mulligan ${mulligansTaken}: Redrawn Hand`, _.cloneDeep(finalHand));
         //   console.log(`Mulligan ${mulligansTaken}: Remaining Deck`, _.cloneDeep(remainingDeck));
        }

        if (!(firstMulliganFree && mulligansTaken === 0) && !(freeMulliganTillLands && !meetsLandRequirements)) {
            // Place cards on the bottom of the deck for each mulligan taken
            for (let i = 0; i < mulligansTaken; i++) {
                const cardToBottom = prioritizeCardToBottom(finalHand);
                remainingDeck.push(cardToBottom);

                // Log the card placed on the bottom
                console.log(`Mulligan ${mulligansTaken}: Card Placed on Bottom`, _.cloneDeep(cardToBottom));
            }
        }

        mulligansTaken++;
    }

    // Log the final hand and remaining deck after mulligans
    console.log('Final Hand after Mulligans', _.cloneDeep(finalHand));
    console.log('Remaining Deck after Mulligans', _.cloneDeep(remainingDeck));

    return { finalHand, remainingDeck };
}

function prioritizeCardToBottom(hand) {
    // Prioritize placing a "dummy" card at the bottom
    const dummyIndex = hand.findIndex(card => card.dummy);
    if (dummyIndex !== -1) {
        return hand.splice(dummyIndex, 1)[0];
    }

    // If no dummy card, prioritize placing a duplicate mana card at the bottom
    const manaCounts = {};
    hand.forEach(card => {
        const key = JSON.stringify(card);
        manaCounts[key] = (manaCounts[key] || 0) + 1;
    });

    for (const key in manaCounts) {
        if (manaCounts[key] > 1) {
            const duplicateIndex = hand.findIndex(card => JSON.stringify(card) === key);
            if (duplicateIndex !== -1) {
                return hand.splice(duplicateIndex, 1)[0];
            }
        }
    }

    // If no dummy or duplicate mana card, place the first card at the bottom
    return hand.pop();
}






function playLands(hand, totalAvailableMana) {
    // Filter out land cards (which do not have TotalManaCost and dummy, and have ANY attribute)
    //this is shakey logic - custom cards could be named ANY or dummy
    const landCards = hand.filter(card => !card.TotalManaCost && !card.dummy && card.ANY !== undefined);

    // Calculate the total required mana for each color from all ramp cards in hand
    const totalRequiredMana = {};
    hand.filter(card => card.TotalManaCost).forEach(card => {
        Object.keys(card.TotalManaCost).forEach(color => {
            if (color !== 'ANY') {
                totalRequiredMana[color] = (totalRequiredMana[color] || 0) + card.TotalManaCost[color];
            }
        });
    });

    // Calculate the total available mana for each color in totalAvailableMana
    const totalAvailableManaCount = {};
    totalAvailableMana.forEach(mana => {
        Object.keys(mana).forEach(color => {
            if (color !== 'ANY') {
                totalAvailableManaCount[color] = (totalAvailableManaCount[color] || 0) + mana[color];
            }
        });
    });

    console.log('Total Required Mana:', totalRequiredMana);
    console.log('Total Available Mana Count:', totalAvailableManaCount);

  // Priority 1: Get the highest priority color for the lowest TotalManaCost ramp card in hand
  const nonLandCards = hand.filter(card => card.TotalManaCost && Object.keys(card.TotalManaCost).some(color => card.TotalManaCost[color] > 0 && color !== 'ANY'));
    nonLandCards.sort((a, b) => getTotalManaCost(a.TotalManaCost) - getTotalManaCost(b.TotalManaCost));
    const highestPriorityCard = nonLandCards[0];
    let highestPriorityColor = getHighestPriorityColor(highestPriorityCard);

    console.log('Hand:', hand);
    console.log('Total Available Mana:', totalAvailableMana);
    console.log('Highest Priority Card:', highestPriorityCard);
    console.log('Highest Priority Color:', highestPriorityColor);

    if (highestPriorityColor !== null) {
        // Check if the highest priority color is already in totalAvailableMana
        const availableColors = new Set();
        totalAvailableMana.forEach(mana => {
            Object.keys(mana).forEach(color => {
                if (mana[color] > 0 && color !== 'ANY') {
                    availableColors.add(color);
                }
            });
        });

        if (availableColors.has(highestPriorityColor)) {
            // Find another color required by the highest priority card that is not in totalAvailableMana
            const otherColors = Object.keys(highestPriorityCard.TotalManaCost).filter(color => highestPriorityCard.TotalManaCost[color] > 0 && color !== 'ANY' && !availableColors.has(color));
            if (otherColors.length > 0) {
                highestPriorityColor = otherColors[0];
            }
        }

        // Find a land that can produce the highest priority color
        for (let i = 0; i < landCards.length; i++) {
            const card = landCards[i];
            if (card[highestPriorityColor] > 0) {
                // Move the land card from hand to totalAvailableMana
                const landCard = hand.splice(hand.indexOf(card), 1)[0];
                totalAvailableMana.push(landCard);

                // Log the land card played and the updated mana
                console.log('Land card played (priority 1):', landCard);
                console.log('Total Available Mana after playing land (priority 1):', _.cloneDeep(totalAvailableMana));
                return; // Exit after playing the land
            }
        }
    }



    // Priority 2: Play a land that can produce a color not currently in totalAvailableMana
    const availableColors = new Set();
    totalAvailableMana.forEach(mana => {
        Object.keys(mana).forEach(color => {
            if (mana[color] > 0 && color !== 'ANY') {
                availableColors.add(color);
            }
        });
    });

    for (const color of colorPriority) {
        if (!availableColors.has(color)) {
            for (let i = 0; i < landCards.length; i++) {
                const card = landCards[i];
                if (card[color] > 0) {
                    // Move the land card from hand to totalAvailableMana
                    const landCard = hand.splice(hand.indexOf(card), 1)[0];
                    totalAvailableMana.push(landCard);

                    // Log the land card played and the updated mana
                    console.log(`Land card played (priority 2, new color ${color}):`, landCard);
                    console.log('Total Available Mana after playing land (priority 2):', _.cloneDeep(totalAvailableMana));
                    return; // Exit after playing the land
                }
            }
        }
    }


  // Priority 3: Play a land that can produce the most colors
  let maxColors = 0;
    let bestLandCard = null;
    for (let i = 0; i < landCards.length; i++) {
        const card = landCards[i];
        const colorCount = Object.keys(card).filter(color => card[color] > 0 && color !== 'ANY').length;
        if (colorCount > maxColors) {
            maxColors = colorCount;
            bestLandCard = card;
        }
    }

    if (bestLandCard) {
        // Move the best land card from hand to totalAvailableMana
        const landCard = hand.splice(hand.indexOf(bestLandCard), 1)[0];
        totalAvailableMana.push(landCard);

        // Log the land card played and the updated mana
        console.log('Land card played (priority 3, most colors):', landCard);
        console.log('Total Available Mana after playing land (priority 3):', _.cloneDeep(totalAvailableMana));
        return; // Exit after playing the land
    }

    // Priority 4: Play a land in the colorPriority order
    for (const color of colorPriority) {
        for (let i = 0; i < landCards.length; i++) {
            const card = landCards[i];
            if (card[color] > 0) {
                // Move the land card from hand to totalAvailableMana
                const landCard = hand.splice(hand.indexOf(card), 1)[0];
                totalAvailableMana.push(landCard);

                // Log the land card played and the updated mana
                console.log(`Land card played (priority 4, color ${color}):`, landCard);
                console.log('Total Available Mana after playing land (priority 4):', _.cloneDeep(totalAvailableMana));
                return; // Exit after playing the land
            }
        }
    }
}





function getHighestPriorityColor(card) {
    if (!card || !card.TotalManaCost) return null; // Return null if card or TotalManaCost is undefined or null
    const colors = Object.keys(card.TotalManaCost).filter(color => card.TotalManaCost[color] > 0 && color !== 'ANY');
    if (colors.length === 0) return null; // Return null if only "ANY" amounts are present
    colors.sort((a, b) => getColorPriority(a) - getColorPriority(b));
    console.log('Highest priority color for card:', card, 'is', colors[0] || null);
    return colors[0] || null; // Return the highest priority color or null if no colors are found
}

const colorPriority = ['G', 'W', 'U', 'B', 'R'];

function getColorPriority(color) {
    return colorPriority.indexOf(color);
}





function playRampCards(hand, AvailableManaThisTurn, totalAvailableRamp, currentTurn) {
    let rampPlayed;
    do {
        rampPlayed = false;

        // Sort hand based on priorities
        hand.sort((a, b) => {
            const aTotalCost = getTotalManaCost(a.TotalManaCost);
            const bTotalCost = getTotalManaCost(b.TotalManaCost);

            // Priority 1: Lowest TotalManaCost and AvailableTurnPlayed: 1
            if (aTotalCost === bTotalCost) {
                if (a.AvailableTurnPlayed === 1 && b.AvailableTurnPlayed !== 1) return -1;
                if (a.AvailableTurnPlayed !== 1 && b.AvailableTurnPlayed === 1) return 1;
            }

            // Priority 2: Lowest TotalManaCost
            if (aTotalCost !== bTotalCost) return aTotalCost - bTotalCost;

            // Priority 3: AvailableTurnPlayed: 1
            if (a.AvailableTurnPlayed === 1 && b.AvailableTurnPlayed !== 1) return -1;
            if (a.AvailableTurnPlayed !== 1 && b.AvailableTurnPlayed === 1) return 1;

            // Priority 4: Any other ramp
            return aTotalCost - bTotalCost;
        });

        for (let i = 0; i < hand.length; i++) {
            const card = hand[i];
            if (card.CanProduce && canPlayRamp(card, AvailableManaThisTurn)) {
                // Remove the ramp card from the hand
                const rampCard = hand.splice(i, 1)[0];
                rampCard.playedTurn = currentTurn; // Track the turn the ramp card was played
                totalAvailableRamp.push(rampCard);

                // Deduct the mana used to play the ramp card
                deductMana(AvailableManaThisTurn, rampCard.TotalManaCost);

                // Log the ramp card played and the updated mana
                console.log('Ramp card played:', rampCard);
                console.log('AvailableManaThisTurn after playing ramp:', _.cloneDeep(AvailableManaThisTurn));

                // Add ramp card's mana production to AvailableManaThisTurn if AvailableTurnPlayed is 1
                if (rampCard.AvailableTurnPlayed === 1) {
                    addRampManaToAvailable(rampCard, AvailableManaThisTurn);
                    // Log the updated AvailableManaThisTurn after adding ramp mana
                    console.log('AvailableManaThisTurn after adding ramp mana:', _.cloneDeep(AvailableManaThisTurn));
                }

                rampPlayed = true;
                break; // Restart the loop to check for more ramp cards
            }
        }
    } while (rampPlayed);

    //  Check 2: Compare AvailableManaThisTurn against preparedCombinations after all ramp is played
    // NOTE THIS MIGHT be better above - check inbetween each ramp played vs after all played in a turn?

    //     if (handMeetsRequirements(AvailableManaThisTurn, $simulationData.preparedCards)) {
    //     return { AvailableManaThisTurn, meetsRequirements: true };
    // }

    // return { AvailableManaThisTurn, meetsRequirements: false };

}


function getTotalManaCost(manaCost) {
    if (!manaCost) return Infinity; // Return a high value if manaCost is undefined or null
    return Object.values(manaCost).reduce((sum, value) => sum + value, 0);
}

function addRampManaToAvailable(rampCard, AvailableManaThisTurn) {
        if (rampCard.CustomRamp === 'signet') {
            // Handle signet logic
            if (removeManaForSignet(AvailableManaThisTurn)) {
                const signetMana = simplifySignetManaProduction(rampCard.ColorsCanProduce);
                AvailableManaThisTurn.push(...signetMana);
            }
        } else {
            // Existing logic for other ramp cards
            const simplifiedMana = simplifyManaProduction(rampCard.ColorsCanProduce, rampCard.CanProduce);
            AvailableManaThisTurn.push(...simplifiedMana);
        }
    }



    function removeManaForSignet(AvailableManaThisTurn) {
        // Prioritize removing mana that produces "C" and "ANY"
        let indexToRemove = AvailableManaThisTurn.findIndex(mana => mana.C && mana.ANY);

        if (indexToRemove === -1) {
            // Calculate the total count of each color (excluding "ANY")
            const colorTotals = {};
            AvailableManaThisTurn.forEach(mana => {
                Object.entries(mana).forEach(([color, value]) => {
                    if (color !== 'ANY') {
                        colorTotals[color] = (colorTotals[color] || 0) + value;
                    }
                });
            });

            console.log('Color Totals:', colorTotals);

            // Find the color with the highest total count
            let maxColor = null;
            let maxCount = 0;
            Object.entries(colorTotals).forEach(([color, count]) => {
                if (count > maxCount) {
                    maxColor = color;
                    maxCount = count;
                }
            });

            console.log('Max Color:', maxColor, 'Max Count:', maxCount);

            // Find the mana to remove based on the most common color and least number of different colors
            let minColors = Infinity;
            AvailableManaThisTurn.forEach((mana, index) => {
                if (mana[maxColor]) {
                    const colorCount = Object.keys(mana).filter(color => color !== 'ANY').length;
                    if (colorCount < minColors) {
                        minColors = colorCount;
                        indexToRemove = index;
                    }
                }
            });
        }

        if (indexToRemove !== -1) {
            console.log('Removing mana for signet:', AvailableManaThisTurn[indexToRemove]);
            AvailableManaThisTurn.splice(indexToRemove, 1);
            return true;
        }

        return false;
    }



function simplifySignetManaProduction(ColorsCanProduce) {
        const simplified = [];
        const strippedColors = Object.fromEntries(Object.entries(ColorsCanProduce).filter(([color, value]) => value > 0 && color !== 'ANY'));

        Object.keys(strippedColors).forEach(color => {
            simplified.push({ [color]: 1, ANY: 1 });
        });

        return simplified;
    }



function simplifyManaProduction(ColorsCanProduce, CanProduce) {
    const simplified = [];
    const strippedColors = Object.fromEntries(Object.entries(ColorsCanProduce).filter(([color, value]) => value > 0));

    for (let i = 0; i < CanProduce; i++) {
        simplified.push({ ...strippedColors });
    }

    return simplified;
}


function canPlayRamp(card, AvailableManaThisTurn) {
    const manaCost = card.TotalManaCost;
    const manaCopy = _.cloneDeep(AvailableManaThisTurn);

    for (const color in manaCost) {
        if (manaCost[color] > 0) {
            let required = manaCost[color];
            for (let i = 0; i < manaCopy.length; i++) {
                if (manaCopy[i][color] > 0) {
                    required -= manaCopy[i][color];
                    if (required <= 0) {
                        manaCopy.splice(i, 1); // Remove the entire mana entry
                        break;
                    }
                }
            }
            if (required > 0) return false; // Not enough mana of this color
        }
    }
    return true;
}

function deductMana(AvailableManaThisTurn, manaCost) {
    // Deduct specific color mana first
    for (const color in manaCost) {
        if (color !== 'ANY' && manaCost[color] > 0) {
            let required = manaCost[color];
            for (let i = 0; i < AvailableManaThisTurn.length; i++) {
                if (AvailableManaThisTurn[i][color] > 0) {
                    const usedMana = Math.min(AvailableManaThisTurn[i][color], required);
                    required -= usedMana;
                    // Remove the entire entry if any part of it is used
                    AvailableManaThisTurn.splice(i, 1);
                    i--; // Adjust index after removal
                    if (required <= 0) break;
                }
            }
        }
    }

    // Deduct ANY mana next
    if (manaCost.ANY > 0) {
        let required = manaCost.ANY;

        // First use mana sources that only have ANY
        for (let i = 0; i < AvailableManaThisTurn.length; i++) {
            if (Object.keys(AvailableManaThisTurn[i]).length === 1 && AvailableManaThisTurn[i].ANY > 0) {
                const usedMana = Math.min(AvailableManaThisTurn[i].ANY, required);
                required -= usedMana;
                // Remove the entire entry if any part of it is used
                AvailableManaThisTurn.splice(i, 1);
                i--; // Adjust index after removal
                if (required <= 0) break;
            }
        }

        // Then use other mana sources that include ANY
        if (required > 0) {
            for (let i = 0; i < AvailableManaThisTurn.length; i++) {
                if (AvailableManaThisTurn[i].ANY > 0) {
                    const usedMana = Math.min(AvailableManaThisTurn[i].ANY, required);
                    required -= usedMana;
                    // Remove the entire entry if any part of it is used
                    AvailableManaThisTurn.splice(i, 1);
                    i--; // Adjust index after removal
                    if (required <= 0) break;
                }
            }
        }
    }
}



function resetAndUpdateAvailableMana(totalAvailableMana, totalAvailableRamp, currentTurn, neededCombinations) {
    let AvailableManaThisTurn = [];
    AvailableManaThisTurn.push(...totalAvailableMana);

    // Add ramp mana to AvailableManaThisTurn based on AvailableTurnPlayed and the turn it was played
    totalAvailableRamp.forEach(rampCard => {
        if (rampCard.AvailableTurnPlayed === 1 || (rampCard.AvailableTurnPlayed === 0 && currentTurn > rampCard.playedTurn)) {
            addRampManaToAvailable(rampCard, AvailableManaThisTurn);
        }
    });

    console.log('AvailableManaThisTurn after update:', _.cloneDeep(AvailableManaThisTurn));

    // Check 1: Compare AvailableManaThisTurn against neededCombinations
    const meetsRequirements = manaPoolMeetsRequirements(AvailableManaThisTurn, neededCombinations);

    return { AvailableManaThisTurn, meetsRequirements };
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
    
    
    //OLD HAND MEETS REQ - prolly delete, does not factor played cards etc anymore

    // function handMeetsRequirements(hand, preparedCombinations) {
    //  //   console.log('Checking hand against requirements:', hand);
    //  //   console.log('Prepared combinations:', preparedCombinations);

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
    
    //        // console.log(`Checking hand against requirements:`, handProfile, landCounts);

    //         const meetsRequirements = Object.entries(landCounts).every(([land, count]) => {
    //             return handProfile[land] >= count;
    //         });
    
    //         if (meetsRequirements) {
    //           //  console.log(`Hand meets the combination requirements:`, combination);
    //         } else {
    //           //  console.log(`Hand does not meet the combination requirements:`, combination);
    //         }
    
    //         return meetsRequirements;
    //     });
    // }
    
    
    
    
    
    
    
    
    
// Inside identifyProfiles function
async function identifyProfiles(numIterations) {
    const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
    const neededCombinations = determineNeededCombinations(preparedCards, manaRequirements, totalManaNeeded);
   
    neededCombinationsCount.set(neededCombinations.length);  // Update the store with the count

   
    const preparedCombinations = prepareCombinationsForAnalysis(neededCombinations);
    const landGroupSizes = calculateLandGroupSizes(preparedCards);


    console.log('Prepared combinations:', preparedCombinations); // Ensure this logs after the update
    console.log('needed combinations:', preparedCombinations); // Ensure this logs after the update


    let rawProbabilities;
        if ($simulationType === 'hand') {
            rawProbabilities = await monteCarloSimulationHand(
                preparedCombinations,
                landGroupSizes,
                deckSize,
                mulliganConfig,
                InitialDrawSize,
                $numberOfTurns,
                numIterations
            );
        } else {
            rawProbabilities = await monteCarloSimulation(
                preparedCombinations,
                landGroupSizes,
                deckSize,
                mulliganConfig,
                InitialDrawSize,
                $numberOfTurns,
                numIterations,
                neededCombinations
            );
        }
        

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
    neededCombinationsCount.set(null); // Set the count to a loading placeholder

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
            simulationProgress.set(0); // Reset progress to 0 after finishing the simulation
        }
    }, 0); // Timeout set to 0 to push to end of execution queue
}






function createGroupCards(groups, results, probabilitiesByTurn, turn, simulationType = 'full', excludeGroups = false) {
    let cards = [];
    let linkedGroupData = {}; // To hold accumulated data for linked groups

    // Calculate the effective draw size considering mulligans
    const effectiveDrawSize = InitialDrawSize - mulliganCount + turn - 1;

    // If Monte Carlo results are available, use them to calculate blanks
    if (simulationType === 'full' && $monteCarloResults.length > 0 && $monteCarloResults[turn] !== undefined) {
        let turnTotalProbability = parseFloat($monteCarloResults[turn]);
        // Calculate the total number of cards required by manaRequirements
        let totalManaCards = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0) - 1; // Subtract one to account for the top card
        let blanksToAdd = Math.max(effectiveDrawSize - totalManaCards, 0);
        cards.push({
            probability: turnTotalProbability,
            label: 'Field Simulation',
            color: '#fff', // A distinct color for Monte Carlo results
            ratioText: convertPercentToRatio(turnTotalProbability),
            stackedCards: totalManaCards,
            isBlank: Array(totalManaCards).fill(false).concat(Array(blanksToAdd).fill(true)) // Include actual and blank cards
        });
    } else if (simulationType === 'hand' && $monteCarloHandResults.length > 0 && $monteCarloHandResults[turn] !== undefined) {
        let turnTotalProbability = parseFloat($monteCarloHandResults[turn]);
        // Calculate the total number of cards required by manaRequirements
        let totalManaCards = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0) - 1; // Subtract one to account for the top card
        let blanksToAdd = Math.max(effectiveDrawSize - totalManaCards, 0);
        cards.push({
            probability: turnTotalProbability,
            label: 'Hand Simulation',
            color: '#fff', // A distinct color for Hand Simulation results
            ratioText: convertPercentToRatio(turnTotalProbability),
            stackedCards: totalManaCards,
            isBlank: Array(totalManaCards).fill(false).concat(Array(blanksToAdd).fill(true)) // Include actual and blank cards
        });
    }

    // Process all groups if not excluded
  if (!excludeGroups) {
    groups.forEach(group => {
        let groupName = group.link ? group.link : group.name;
        let groupResult = results[groupName];
        let probabilityPercent = groupResult && turn < groupResult.length ? Math.round(groupResult[turn].probability * 1000) / 10 : null;
        let color = $groupColors[groupName] || '#e5e5e5';

        if (group.link) {
            if (!linkedGroupData[group.link]) {
                linkedGroupData[group.link] = {
                    totalCardsToDraw: 0,
                    probability: probabilityPercent,
                    label: group.link,
                    color: color,
                    ratioText: convertPercentToRatio(probabilityPercent)
                };
            }
            // Accumulate total cards to draw for linked groups
            linkedGroupData[group.link].totalCardsToDraw += group.cardsToDraw;
        } else {
            // For individual groups, subtract one to account for the top card
            let actualCardsToDraw = Math.max(group.cardsToDraw - 1, 0);
            let blanksToAdd = Math.max(effectiveDrawSize - actualCardsToDraw, 0);
            cards.push({
                probability: probabilityPercent,
                label: group.name,
                color,
                ratioText: convertPercentToRatio(probabilityPercent),
                stackedCards: actualCardsToDraw,
                isBlank: Array(actualCardsToDraw).fill(false).concat(Array(blanksToAdd).fill(true)) // Include actual and blank cards
            });
        }
    });

    // Process linked groups
    Object.values(linkedGroupData).forEach(group => {
        // Correctly adjust for the top card in linked groups
        let actualCardsToDraw = Math.max(group.totalCardsToDraw - 1, 0);
        let blanksToAdd = Math.max(effectiveDrawSize - actualCardsToDraw, 0);
        cards.push({
            probability: group.probability,
            label: group.label,
            color: group.color,
            ratioText: convertPercentToRatio(group.probability),
            stackedCards: actualCardsToDraw,
            isBlank: Array(actualCardsToDraw).fill(false).concat(Array(blanksToAdd).fill(true)) // Include actual and blank cards
        });
    });
}
    return cards;
}


    
    
    function convertPercentToRatio(percent) {
        if (percent === null) return '';
    
        // Directly map the percentage to a scale of 20
        let number = Math.round((percent / 100) * 20);
    
        return `${number} out<br aria-hidden="true">of 20`;
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
    
     // Reactive statement to check if there's any output to display
     $: hasOutput = generateTurnsArray($numberOfTurns).some(turn => 
    createGroupCards(groups, results, $probabilitiesByTurn, turn).length > 0 || 
    createGroupCards(groups, results, $monteCarloHandResults, turn, 'hand').length > 0
  );
  
// Function to generate turns array
$: generateTurnsArray = () => {
    const array = Array.from({ length: $numberOfTurns.length + 1 }, (_, i) => i);
    console.log('Generated Turns Array:', array);
    return array;
}
    
    //this is a helper function that removes groups redundancy in the output. 
    //prolly a better way to do this!
    function getCombinedResults(groups, results, probabilitiesByTurn, monteCarloHandResults, turn) {
    const fullResults = createGroupCards(groups, results, probabilitiesByTurn, turn);
    const handResults = createGroupCards(groups, results, monteCarloHandResults, turn, 'hand', true); // Exclude groups
    const combinedResults = [...handResults, ...fullResults];

    // Sort to ensure hand simulation results are always first or second
    combinedResults.sort((a, b) => {
        if (a.label === 'Hand Simulation') return -1;
        if (b.label === 'Hand Simulation') return 1;
        return 0;
    });

    return combinedResults;
}


    </script>
    

    <h2 id="probabilities-jump" style="text-align: center; margin-bottom:0;">Probabilities</h2>
    {#if hasOutput}
    <p style="margin-top:0; text-align: center;"><i>Each column of stacked cards represents a separate opening hand and subsequent draws.</i>
        <Popover bind:show={showPopover} placement="top">
            <button class="moreInfo"  slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover} aria-label="Help">
                <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
            </button>
            <div slot="content">
                <p class="popover-content">This tool lets you set up multiple individual probability calculations. It's important to know that not all of the inputs above are linked. Use the "Linked groups" feature or Advanced section to calculate the probability of drawing cards from different groups.</p>
            </div>
        </Popover>
    </p>
    {/if}
    <div class="output-diagram">
        {#if hasOutput}
        {#each generateTurnsArray($numberOfTurns.length) as _, turn}
            {#if createGroupCards(groups, results, $probabilitiesByTurn, turn).length > 0 || createGroupCards(groups, results, $monteCarloHandResults, turn, 'hand').length > 0}
                <div class="turn-row">
                    <div class="turn-label">
                        Turn {turn}:<br>
                        <i>({turn === 0 ? `Draw ${InitialDrawSize}` : `Draw ${$numberOfTurns[turn - 1]}`})</i>
                    </div>
                    <div class="card-rectangles">
                        {#each getCombinedResults(groups, results, $probabilitiesByTurn, $monteCarloHandResults, turn) as card}
                        <div class="card-group">
                            {#if turn === 0}
                                <div class="card-label">{card.label}</div>
                            {/if}
                            <div class="card-container" style="margin-right: {7 + (card.isBlank.length - 1) * 4}px;">
                                <div class="rectangle" style="background-color: {card.color};">
                                    <div class="card-details">
                                        <div class="probability">{card.probability !== null ? `${card.probability}%` : ''}</div>
                                        <div class="card-ratio">{@html card.ratioText}</div>
                                    </div>
                                </div>
                                <div class="stacked-cards">
                                    {#each card.isBlank as isBlank, i}
                                        <div class="stacked-card" style="left: {i * 4}px; z-index: {-(i + 1)}; background-color: {isBlank ? '#f2efe8' : card.color}; border-color: {isBlank ? '#c1c1c1' : '#666666'};"></div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}
                    </div>
                </div>
            {/if}
        {/each}
        {:else}
         <div class="placeholder">
               Add a hypergeometric group or run a monte carlo simulation to show output probabilities.
         </div>
        {/if}
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
        border: 1px solid #c7c7c7;
        border-radius: 4px;
        background-color: #f2efe8;
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
        gap: 2px;
    }
    
    .card-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 5px;
        position: sticky;
    }
    
    .card-group {
    display: flex;
    flex-direction: column;
    align-items: center;
}


    .rectangle {
        position: relative;
        width: 40px;
        height: 60px;
        display: flex;
        justify-content: center;
        flex-direction: column; /* Stack children vertically */
        align-items: center;
        border: 1px solid #666666;
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
        font-size: 1.2em;
        font-weight: bold;
    }
    
    .card-label {
        font-size: 0.7em;
        padding-bottom: 12px;
        text-align: center;
        width: 54px;
        word-wrap: break-word;
        hyphens: auto;
        text-wrap: balance;
        overflow-wrap: break-word;
        height: 2em; /* Set a fixed height */
        align-items: center;
        justify-content: center;
        
    }
  
.popover-content {
  text-align: left;
}   
.popover-content:first-child {
  margin-top: 0;
}

.popover-content:last-child {
  margin-bottom: 0;
}

    .placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    margin: auto;
    background-color: #f0f0f0;
    color: #888;
    padding: 1rem;
    border-radius: 4px;
    font-style: italic;
    flex-wrap: nowrap;
    flex-direction: row;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    white-space: normal;
    }

    </style>