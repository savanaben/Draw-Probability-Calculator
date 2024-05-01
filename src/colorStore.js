// colorStore.js
import { writable } from 'svelte/store';

export const groupColors = writable({});

export const simulationData = writable({
    preparedCards: [],
    manaRequirements: {}
});

export const shouldResetSimulation = writable(false);

export const simulationRun = writable(false);
export const simulationProgress = writable(0); // Tracks the progress of the simulation
export const cancelSimulation = writable(false);  // This store manages the cancellation state.
export const monteCarloResults = writable([]); // Store for Monte Carlo results

export const neededCombinationsCount = writable(0);  // Store for the count of needed combinations
