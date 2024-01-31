<script>
    import { createEventDispatcher } from 'svelte';
    import { groupColors } from './colorStore.js';

    const dispatch = createEventDispatcher();
    let groups = [{ name: '', size: 1, cardsToDraw: 1, link: '' }];
    let deckSize = 99;
    let mulliganCount = 0;

    const presetColors = [
        "#E1BEE7", "#B2DFDB", "#FFE0B2", "#DCEDC8", "#B3E5FC", "#FFCCBC", "#C5CAE9"
    ];
    let colorIndex = 0;

    $: {
        let updatedColors = {};
        if (groups.length > 0) {
            // Assign colors to each group
            groups.forEach(group => {
                if (group.link && group.link.trim() !== '') {
                    // If link is present and not empty, assign or use existing color based on link
                    if (!updatedColors[group.link]) {
                        updatedColors[group.link] = presetColors[colorIndex++ % presetColors.length];
                    }
                    updatedColors[group.name] = updatedColors[group.link];
                } else {
                    // If no link, assign a unique color
                    updatedColors[group.name] = presetColors[colorIndex++ % presetColors.length];
                }
            });

            groupColors.set(updatedColors);
            dispatch('updateGroups', { groups, deckSize, mulliganCount });
        }
    }

    function addGroup() {
        groups = [...groups, { name: '', size: 1, cardsToDraw: 1, link: '' }];
    }

    function removeGroup(index) {
        groups = groups.filter((_, i) => i !== index);
    }
</script>




<div class="parameters">

    <table>
        <thead>
            <tr>
                <th>Category unique name</th>
                <th># Cards in category</th>
                <th>Minimum # desired cards</th>
                <th>Linked categories*</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each groups as group, index}
                <tr>
                    <td>
                        <input 
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="text" 
                            bind:value={group.name} 
                            placeholder="mana, draw, ramp, etc" />
                    </td>
                    <td>
                        <input 
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="number" 
                            bind:value={group.size} 
                            min="1" 
                            max="99" />
                    </td>
                    <td>
                        <input 
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="number" 
                            bind:value={group.cardsToDraw} 
                            min="1" 
                            max="99" 
                             />
                    </td>
                    <td>
                        <input 
                            class="input-group"
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="text" 
                            bind:value={group.link} 
                            placeholder="combo pieces, synergy 1, etc" />
                    </td>
                    <td>
                        {#if index > 0}
                            <button on:click={() => removeGroup(index)}>Remove</button>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    
    <div class="controls-container">
        
        <button on:click={addGroup}>Add Another Group</button>
        
        <div class="mulligan-selection">
            <label for="mulliganCount">Number of Mulligans**:</label>
            <select bind:value={mulliganCount}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
        </div>

        <div class="deck-size-container">
            <label for="deckSize">Deck Size:</label>
            <input type="number" id="deckSize" bind:value={deckSize} min="1" />
        </div>

    </div>

</div>

<style>
    /* Add your styles here */
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f4f4f4;
    }
    input {
        width: 95%;
        padding: 5px;
        margin: 0px;
    }

    .input-group {
        background-color: var(--bg-color, #fff); /* Default to white if no color */
    }

    input::placeholder {
        font-style: italic; /* Make the placeholder text italic */
        color: #a0a0a0;     /* Set a gray color for the placeholder text */
    }


    .parameters {
        max-width: 55rem;
        margin: auto; /* Centers the container */
        margin-bottom: 1rem;
        margin-top: 1rem;
    }


    .controls-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
    }

    .deck-size-container {
        display: flex;
        align-items: center;
        width: 150px;
    }

    .mulligan-selection {
        display: flex;
        align-items: center;
    }


    label {
        margin-right: 10px;
        white-space: nowrap; /* Prevents wrapping */

    }

    button {
        margin: 0;
    }

    select {
        margin:0;
    }


</style>
