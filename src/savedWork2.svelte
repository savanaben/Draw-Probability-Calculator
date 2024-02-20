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
    let InitialDrawSize = 7;
    console.log("Initial InitialDrawSize:", InitialDrawSize);
    let mulliganCount = 0;
    let colorIndex = 0;
    let showPopover = false;


    const presetColors = [
        "#DCEDC8", "#B2DFDB", "#FFE0B2", "#E1BEE7", "#B3E5FC", "#FFCCBC", "#C5CAE9"
    ];
   

 




    $: {
    let firstLinkColors = {}; // Store the first color assigned to each link
    let updatedColors = {};

    groups.forEach((group, index) => {
        let groupKey = group.link.trim() ? group.link.trim() : group.name; // Use link name if it exists

        if (group.link.trim()) {
            if (!firstLinkColors[group.link.trim()]) {
                // If this is the first group with this link, assign a new color
                firstLinkColors[group.link.trim()] = presetColors[colorIndex++ % presetColors.length];
            }
            // Use the first color assigned to this link
            updatedColors[groupKey] = firstLinkColors[group.link.trim()];
        } else {
            if (!updatedColors[groupKey]) {
                // Assign color based on group name if no link name exists
                updatedColors[groupKey] = presetColors[colorIndex++ % presetColors.length];
            }
        }
    });

    groupColors.set(updatedColors);
    dispatch('updateGroups', { groups: sortedGroups, deckSize, InitialDrawSize, mulliganCount });
}







    function addGroup() {
        groups = [...groups, { index: nextIndex, name: `Category ${nextIndex + 1}`, size: 1, cardsToDraw: 1, link: '' }];
        nextIndex++; // Increment the counter after adding a new group
    }

    function removeGroup(index) {
        groups = groups.filter((_, i) => i !== index);
        // After removal, update names to maintain order if needed. This could be an additional feature.
    }


//this has to do with sorting the rows when they are linked

// Reactive statement to track unique links used by more than one group
$: uniqueLinks = new Set(
    groups
        .filter(group => group.link.trim() !== '')
        .map(group => group.link)
        .filter((link, _, array) => array.indexOf(link) !== array.lastIndexOf(link))
);

// Updated sorting logic
$: sortedGroups = groups.slice().sort((a, b) => {
    const aLinkMatch = a.link.trim() && uniqueLinks.has(a.link.trim());
    const bLinkMatch = b.link.trim() && uniqueLinks.has(b.link.trim());

    if (aLinkMatch && bLinkMatch) return a.link.trim().localeCompare(b.link.trim());
    if (aLinkMatch) return -1;
    if (bLinkMatch) return 1;
    return 0;
});



function updateLink(index, newLink) {
    groups = groups.map((group, i) => {
        if (i === index) return { ...group, link: newLink };
        return group;
    });
}

</script>




<div class="parameters">
    <div class="table-wrapper">
    <table>
        <thead>
            <tr>
                <th>Category unique name
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                          <p class="popover-content">Categories are the group of similar cards you want to find the percent chance of drawing. For example, ramp, lands, interaction, etc. </p>
                          <p class="popover-content"><b>Each category must have a unique text name </b> for the tool to work (some day I'll figure out indexing...)</p>
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
                            <p class="popover-content">Percent change you'll get <i>at least</i> this many cards from this category.</p>
                        </div>
                    </Popover>
                </th>
                <th>Linked categories
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                            <p class="popover-content">When categories are linked, the tool displays the percent chance of getting at least the minimum number of desired cards in <i>each</i> category.</p>
                            <p class="popover-content"><b>Categories must have the exact same link name (keyword match) and you can't link more than 4 categories together currently.</b></p>
                        </div>
                    </Popover>
                </th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each sortedGroups as group, index (group.index)}
                <tr>
                    <td>
                        <input 
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="text" 
                            bind:value={group.name} 
                            placeholder="mana, draw, ramp, etc" />
                           
                            <!--
                            {#if index > 0}
                            <button on:click={() => removeGroup(index)}>Remove</button>
                              {/if}
                            -->
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
                            placeholder="Link via keyword matching..." />
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
    </div>
    <div class="controls-container">
        
        <button on:click={addGroup}>Add category</button>
        
        <div class="mulligan-selection">
            <label for="mulliganCount">Mulligans (experimental)

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
            <label for="deckSize">Initial cards drawn:</label>
            <input type="number" class="deckSize" bind:value={InitialDrawSize} min="1" />
        </div>

        <div class="deck-size-container">
            <label for="deckSize">Deck size:</label>
            <input type="number" class="deckSize" bind:value={deckSize} min="1" />
        </div>

    </div>

</div>

<style>
    /* Add your styles here */
    
    .table-wrapper {
    overflow-x: auto; /* Enables horizontal scrolling */
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on touch devices */
    margin: auto;
    max-width: 100%; /* Ensures the wrapper does not exceed the parent width */
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: #888 #e0e0e0; /* For Firefox */
}
    
.table-wrapper::-webkit-scrollbar {
    height: 12px; /* Height of the scrollbar */
}

.table-wrapper::-webkit-scrollbar-track {
    background: #e0e0e0; /* Color of the track */
    border-radius: 30px;
}

.table-wrapper::-webkit-scrollbar-thumb {
    background-color: #a8a8a8; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Rounded corners of the scrollbar thumb */
    border: 4px solid #e0e0e0; /* Creates padding around the scrollbar thumb */
    
}




    table {
        width: auto; /* Allows the table to expand as needed */
    min-width: 100%; /* Ensures the table takes up at least the full width of the wrapper */
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
        padding: 6px;
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
        gap: 12px;
    }

    @media (max-width: 640px) {
  .controls-container {
    flex-wrap: wrap;
  }
}


    .deck-size-container {
        display: flex;
        align-items: center;
    }

    .deckSize {
max-width: 65px;
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
        color: #0066e9;
        padding: 6px 8px 6px 8px;
    }

.moreInfo {
    border-radius: 40px;
    border-style: none;
    padding: 0.2em 0.25em 0.15em 0.25em;
}

.popover-content:first-child {
  margin-top: 0;
}

.popover-content:last-child {
  margin-bottom: 0;
}

    select {
        margin:0;
        background-color: white;
    }



</style>
