     function playRampCards(hand, turn, availableMana, availableRamp, totalAvailableMana) {
       
        let playedRampCards = [];
        let manaRemainingThisTurn = [...totalAvailableMana];
    
        console.log(`Turn ${turn}: Starting with availableMana:`, availableMana);
        console.log(`Turn ${turn}: availableRamp:`, availableRamp);
        console.log(`Turn ${turn}: totalAvailableMana:`, totalAvailableMana);
        console.log(`Turn ${turn}: manaRemainingThisTurn:`, manaRemainingThisTurn);
    
        hand.forEach(card => {
            if (card.TotalManaCost && card.ColorsCanProduce && card.CanProduce !== undefined && card.AbilityCost !== undefined) {
                const totalCost = Object.values(card.TotalManaCost).reduce((sum, val) => sum + val, 0);
    
                if (canSatisfyManaCostArray(card.TotalManaCost, manaRemainingThisTurn)) {
                    console.log(`Playing ramp card:`, card);
                    manaRemainingThisTurn = subtractManaCostArray(card.TotalManaCost, manaRemainingThisTurn);
                    addManaProductionArray(card.ColorsCanProduce, availableRamp, card.CanProduce);
                    playedRampCards.push(card);
                    console.log(`Updated manaRemainingThisTurn:`, manaRemainingThisTurn);
                    console.log(`Updated availableRamp:`, availableRamp);
                }
            }
        });
    
        return { playedRampCards, availableMana, availableRamp, totalAvailableMana, manaRemainingThisTurn };
    }
    
    
    
    function canSatisfyManaCostArray(cost, manaArray) {
        let tempManaArray = [...manaArray];
        for (let color in cost) {
            for (let i = 0; i < cost[color]; i++) {
                const index = tempManaArray.findIndex(mana => mana[color] > 0);
                if (index === -1) return false;
                tempManaArray[index][color]--;
            }
        }
        return true;
    }
    
    function subtractManaCostArray(cost, manaArray) {
        let tempManaArray = [...manaArray];
        for (let color in cost) {
            for (let i = 0; i < cost[color]; i++) {
                const index = tempManaArray.findIndex(mana => mana[color] > 0);
                if (index !== -1) {
                    tempManaArray[index][color]--;
                }
            }
        }
        return tempManaArray.filter(mana => Object.values(mana).some(val => val > 0));
    }
    
    function addManaProductionArray(production, rampArray, canProduce) {
        for (let i = 0; i < canProduce; i++) {
            rampArray.push({ ...production });
        }
    }
    
    
    
    function monteCarloSimulation(preparedCombinations, landGroupSizes, deckSize, mulliganCount, initialDrawSize, numberOfTurns, numIterations) {
        return new Promise((resolve, reject) => {
            const probabilitiesByTurn = Array.from({ length: numberOfTurns.length + 1 }, () => 0); // Updated to use numberOfTurns.length
            const totalLands = landGroupSizes.reduce((sum, land) => sum + land.count, 0);
            const numDummyCards = Math.max(deckSize - totalLands, 0);
            const completeDeck = landGroupSizes.flatMap(land => Array(land.count).fill(land.land)).concat(Array(numDummyCards).fill({ dummy: 1 }));
            let iteration = 0;
            let availableRamp = [];
    
            // Calculate the total mana needed to determine the batch size. this
            // improves performance 
    
            const totalManaNeeded = Object.values(manaRequirements).reduce((sum, amount) => sum + amount, 0);
            let batchSize;
            if (totalManaNeeded <= 2) {
                batchSize = 50;
            } else if (totalManaNeeded === 3) {
                batchSize = 30;
            } else if (totalManaNeeded === 4) {
                batchSize = 20;
            } else if (totalManaNeeded === 5) {
                batchSize = 20;
            } else {
                batchSize = 20;
            }
    
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
    
                    // Initialize availableRamp for each iteration
                    availableRamp = [];
    
    
    
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
                        for (let turn = 1; turn <= numberOfTurns.length; turn++) { // Updated to use numberOfTurns.length
                            const cardsToDraw = numberOfTurns[turn - 1]; // Use the number of cards drawn for each turn
                            const newCards = _.sampleSize(remainingDeck, cardsToDraw); // Draw multiple cards based on numberOfTurns
                            hand.push(...newCards);
                            remainingDeck = removeDrawnCardsFromDeck(remainingDeck, newCards);
    
    
    
    
    
    
    
    
    
                            console.log(`Turn ${turn}: Drew cards:`, newCards);
                            console.log(`Turn ${turn}: Hand before playing ramp cards:`, hand);
    
                            // Initialize availableMana
                            let availableMana = [];
    
                            // Add one mana/land from the hand to availableMana each turn
                            for (let i = 0; i < hand.length; i++) {
                                let card = hand[i];
                                if (!card.CanProduce && (card.ANY || card.R || card.B || card.U || card.G || card.W || card.C)) {
                                    availableMana.push(JSON.parse(JSON.stringify(card))); // Deep copy the card to preserve all attributes
                                    hand.splice(i, 1); // Remove the card from the hand
                                    break;
                                }
                            }
    
                            // Calculate totalAvailableMana
                            let totalAvailableMana = [...availableMana, ...availableRamp];
    
                            // Initialize manaRemainingThisTurn to totalAvailableMana at the start of each turn
                            let manaRemainingThisTurn = [...totalAvailableMana];
    
                            console.log(`Turn ${turn}: Starting with availableMana:`, availableMana);
                            console.log(`Turn ${turn}: availableRamp:`, availableRamp);
                            console.log(`Turn ${turn}: totalAvailableMana:`, totalAvailableMana);
                            console.log(`Turn ${turn}: manaRemainingThisTurn:`, manaRemainingThisTurn);
    
                            // Play ramp cards if possible
                            const { playedRampCards, availableMana: updatedMana, availableRamp: updatedRamp, totalAvailableMana: updatedTotalMana, manaRemainingThisTurn: updatedManaRemainingThisTurn } = playRampCards(hand, turn, availableMana, availableRamp, totalAvailableMana);
                            availableMana = updatedMana;
                            availableRamp = updatedRamp;
                            totalAvailableMana = updatedTotalMana;
                            manaRemainingThisTurn = updatedManaRemainingThisTurn;
                            hand = hand.filter(card => !playedRampCards.includes(card));
    
                            console.log(`Turn ${turn}: Played ramp cards:`, playedRampCards);
                            console.log(`Turn ${turn}: Hand after playing ramp cards:`, hand);
                            console.log(`Turn ${turn}: availableMana:`, availableMana);
                            console.log(`Turn ${turn}: availableRamp:`, availableRamp);
                            console.log(`Turn ${turn}: totalAvailableMana:`, totalAvailableMana);
                            console.log(`Turn ${turn}: manaRemainingThisTurn:`, manaRemainingThisTurn);
    
    
    
    
    
                            if (handMeetsRequirements(hand, preparedCombinations)) {
                                probabilitiesByTurn[turn]++;
                                metRequirementTurn = turn;
                                break; // Stop further drawings for this iteration
                            }
                        }
                    }
    
                    // Mark all subsequent turns as meeting requirements once the requirement is met
                    if (metRequirementTurn != -1) {
                        for (let turn = metRequirementTurn + 1; turn <= numberOfTurns.length; turn++) { // Updated to use numberOfTurns.length
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
    
      