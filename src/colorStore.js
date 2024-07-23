// colorStore.js
import { writable } from 'svelte/store';

export const groupColors = writable({});
export const InitialDrawSize = writable(7); // Default initial draw size
export const simulationData = writable({
    preparedCards: [],
    manaRequirements: {}
});

export const simplifiedRampMana = writable([]);

export const shouldResetSimulation = writable(false);
export const simulationType = writable('full'); // hand vs field simulation flag

export const simulationRun = writable(false);
export const simulationProgress = writable(0); // Tracks the progress of the simulation
export const combinationProgress = writable(0); // New store for getAllCombinations progress

export const cancelSimulation = writable(false);  // This store manages the cancellation state.
export const monteCarloResults = writable([]); // Store for Monte Carlo results
export const monteCarloHandResults = writable([]); // Store for Monte Carlo results

export const neededCombinationsCount = writable(0);  // Store for the count of needed combinations

export const activePopover = writable(null);

export const numberOfTurns = writable([1, 1, 1, 1, 1]); // Default to drawing 1 card per turn for 5 turns
export const labelChecker = writable(false);

let idCounter = 0;

export function getNextUniqueId() {
  return `popover-${idCounter++}`;
}

// Mulligan configuration store
export const mulliganConfig = writable({
    maxMulligans: 0, // Max amount of mulligans (0 to 7)
    firstMulliganFree: false, // First mulligan is free (true/false)
    freeMulliganTillLands: false, // mulligan until meeting min/max land requirements (true/false)
    minLandsInHand: 2, // Min amount of lands in hand (0 to 7)
    maxLandsInHand: 5, // Max amount of lands in hand (0 to 7)
    allowTwoLandsPlusRamp: false, // Allow 2 lands + playable ramp (true/false)
    mulliganIfLandsCanOnlyMake: '', // Mulligan if lands can only make (color)
    mulliganUnlessOpeningHandCanMake: [], // Mulligan unless opening hand can make (array of colors)
    rampMustBePlayable: false, // If ramp drawn, must be playable (true/false)
    mustHaveRamp: false // Must have ramp (true/false)
});