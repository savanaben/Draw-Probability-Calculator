// colorStore.js
import { writable } from 'svelte/store';

export const groupColors = writable({});

export const simulationData = writable({
    preparedCards: [],
    manaRequirements: {}
});