<script>
    import { createEventDispatcher } from 'svelte';
    import { groupColors } from './colorStore.js';
    import Popover from './Popover.svelte';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';


    const dispatch = createEventDispatcher();
    let nextIndex = 1; // Initialize the counter for group indexes
    let groups = [{ index: 0, name: '', size: 1, cardsToDraw: 1, link: '' }]; // Initial group with name 'Category 1'
    let deckSize = 99;
    let mulliganCount = 0;
    let colorIndex = 0;
    let showPopover = false;


    const presetColors = [
        "#E1BEE7", "#B2DFDB", "#FFE0B2", "#DCEDC8", "#B3E5FC", "#FFCCBC", "#C5CAE9"
    ];
   



    $: {
        let updatedColors = {};
        groups.forEach(group => {
            let key = group.link && group.link.trim() ? group.link : group.name;
            if (!updatedColors[key]) {
                updatedColors[key] = presetColors[colorIndex++ % presetColors.length];
            }
        });

        groupColors.set(updatedColors);
        dispatch('updateGroups', { groups, deckSize, mulliganCount });
    }

    function addGroup() {
        groups = [...groups, { index: nextIndex, name: `Category ${nextIndex + 1}`, size: 1, cardsToDraw: 1, link: '' }];
        nextIndex++; // Increment the counter after adding a new group
    }

    function removeGroup(index) {
        groups = groups.filter((_, i) => i !== index);
        // After removal, update names to maintain order if needed. This could be an additional feature.
    }


</script>




<div class="parameters">

    <table>
        <thead>
            <tr>
                <th>Category unique name
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                          <p class="popover-content">Categories are the group of similar cards you want to find the percent chance of drawing. For example, draw, ramp, lands, interaction, etc. </p>
                          <p class="popover-content">Each category <b>must</b> have a unique text name for the tool to work (some day I'll figure out indexing...)</p>
                        </div>
                    </Popover>
                </th>
                <th># Cards in category</th>
                <th>Minimum # desired cards
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                            <p class="popover-content">Percent change you'll get <i>at least</i> this many cards.</p>
                        </div>
                    </Popover>
                </th>
                <th>Linked categories
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                            <p class="popover-content">Use this field to link multiple categories together. When categories are linked, the tool displays the percent chance of getting the minimum number of desired cards in <i>each</i> category with the same link name.</p>
                            <p class="popover-content">Linked categories must have the exact same name (keyword match) and you can't link more than 4 categories together currently. </p>
                        </div>
                    </Popover>
                </th>
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
                            placeholder="Category 1 + 2, etc" />
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
        
        <button on:click={addGroup}>Add another category</button>
        
        <div class="mulligan-selection">
            <label for="mulliganCount">Mulligans (Experimental)

                <Popover bind:show={showPopover} placement="top">
                    <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
                        <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                    </button>
                    <div slot="content">
                        <p class="popover-content">London mulligan feature is experimental. Mulligan on turn 0 may be more accurate, and essentially calculates the probability with multiple opening hands in mind and averages.</p>
                         <p class="popover-content">Mulligans on turn 1, turn 2, etc. simply "carry over" the increased probability of multiple opening hands to your first, second, third, etc. draw. This is probably not mathematically accurate, still working on it!</p>
                    </div>
                </Popover>
                
                :</label>
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
        background-color: white;
    }
    th {
        background-color: #f4f4f4;
    }


    input {
        width: 95%;
        padding: 5px;
        margin: 0px;
        min-width: 45px;
    }

    .input-group {
        background-color: var(--bg-color, #fff); /* Default to white if no color */
    }

    input::placeholder {
        font-style: italic; /* Make the placeholder text italic */
        color: #a0a0a0;     /* Set a gray color for the placeholder text */
    }


    .parameters {
        margin: auto; /* Centers the container */
        margin-bottom: 1rem;
        margin-top: 1rem;
    }


    .controls-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        gap: 8px;
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
        min-width: 73px;


    }

    button {
        margin: 0;
    }

.moreInfo {
    border-radius: 40px;
    border-style: none;
}

.popover-content:first-child {
  margin-top: 0;
}

.popover-content:last-child {
  margin-bottom: 0;
}

    select {
        margin:0;
    }



</style>
