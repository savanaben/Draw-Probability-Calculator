<script>
    import { createEventDispatcher } from 'svelte';
    import { groupColors } from './colorStore.js';
    import Popover from './Popover.svelte';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import MonteAccordion from './MonteAccordion.svelte';
    import { trackEvent } from './analytics.js';


    const dispatch = createEventDispatcher();
    let nextIndex = 1; // Initialize the counter for group indexes
    let groups = [{ index: 0, name: '', size: 1, cardsToDraw: 1, link: '' }]; // Initial group with name 'Category 1'
    let deckSize = 99;
    let InitialDrawSize = 7;
    console.log("Initial InitialDrawSize:", InitialDrawSize);
    let mulliganCount = 0;
    let colorIndex = 0;
    let showPopover = false;
    let mulliganCountString = "0"; // Use a string for the binding




// function to handle button clicks and send analytics------------------

function handleSelectChange(value) {
    mulliganCountString = value; // Assuming you have this variable already bound to keep the state

    // Send analytics data
    trackEvent('mulligan_count_change', {
        mulligan_count: value
    });
}



function handleAddGroupClick() {
    addGroup(); // Assuming toggleItem toggles the visibility of accordion item
    trackEvent('add_hypergeo_group', {
        'event_label': 'User clicked add group for hypergeometric'
    });
}

//--------------------------------------------


    // Reactive statement to ensure mulliganCount is always a number
     $: mulliganCount = Number(mulliganCountString);


    const presetColors = [
        "#DCEDC8", "#B2DFDB", "#FFE0B2", "#E1BEE7", "#B3E5FC", "#FFCCBC", "#C5CAE9"
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
        dispatch('updateGroups', { groups, deckSize, InitialDrawSize, mulliganCount });
    }

    function addGroup() {
        groups = [...groups, { index: nextIndex, name: `Group ${nextIndex + 1}`, size: 1, cardsToDraw: 1, link: '' }];
        nextIndex++; // Increment the counter after adding a new group
    }

    function removeGroup(index) {
        groups = groups.filter((_, i) => i !== index);
        // After removal, update names to maintain order if needed. This could be an additional feature.
    }


    function selectInput(event) {
    event.target.select(); // Selects all text in the input upon focus
}
    

</script>



<h2 style="text-align: center;">Deck inputs and card groups</h2>
<div class="parameters">
    <div class="table-wrapper">
    <table>
        <thead>
            <tr>
                <th>Group unique name
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                          <p class="popover-content">In edh groups can be thought of as the similar cards you want to find the percent chance of drawing. For example, ramp, lands, interaction, etc. In 60-card formats this might be more focused around individual cards you have 2-4 of in your deck.</p>
                          <p class="popover-content"><b>Each group must have a unique text name </b> for the tool to work (some day I'll figure out indexing...)</p>
                        </div>
                    </Popover>
                </th>
                <th style="width: 18%;"># Cards in group</th>
                <th style="width: 25%;">Minimum # desired cards
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                            <p class="popover-content">Percent chance you'll draw <i>at least</i> this many cards from this group.</p>
                        </div>
                    </Popover>
                </th>
                <th>Linked groups
                    <Popover bind:show={showPopover} placement="top">
                        <button class="moreInfo"  slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
                            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                        </button>
                        <div slot="content">
                            <p class="popover-content">When groups have the same link name, the tool displays the percent chance of getting at least the minimum number of desired cards in <i>each</i> linked group.</p>
                            <p class="popover-content"><b>Groups must have the exact same link name (keyword match). The tool does not support linking more than 4 groups together currently.</b></p>
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
                            aria-label="Group unique name"
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="text" 
                            bind:value={group.name} 
                            placeholder="draw, ramp, removal, etc" 
                            on:focus="{selectInput}"
                            />
                           
                            <!--
                            {#if index > 0}
                            <button on:click={() => removeGroup(index)}>Remove</button>
                              {/if}
                            -->
              </td>
                    <td>
                        <input 
                            aria-label="Number of cards in group"
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="number" 
                            bind:value={group.size} 
                            min="1" 
                            max="99" 
                            on:focus="{selectInput}"
                            />
                    </td>
                    <td>
                        <input 
                            aria-label="Minimum number of desired cards from group"
                            class="input-group" 
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="number" 
                            bind:value={group.cardsToDraw} 
                            min="1" 
                            max="99" 
                            on:focus="{selectInput}"
                            />
                    </td>
                    <td>
                        <input 
                            aria-label="Linked group name"
                            class="input-group"
                            style="--bg-color: {$groupColors[group.link && group.link.trim() ? group.link : group.name]}"
                            type="text" 
                            bind:value={group.link} 
                            placeholder="Link via keyword matching..." />
                    </td>
                    <td>
                        <button aria-label="Remove group" class="group-remove-button" on:click={() => removeGroup(index)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </td>
                </tr>
            {/each}
            <tr>
                <td colspan="5"> <!-- Span across all columns -->
                    <button on:click={handleAddGroupClick}>Add Group</button>
                </td>
            </tr>
        </tbody>
    </table>

  
    </div>
    
    <MonteAccordion />

    <div class="controls-container">
        
        <div class="mulligan-selection">
            <label for="mulliganCount">Mulligans <Popover bind:show={showPopover} placement="top">
                    <button class="moreInfo"  slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
                        <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
                    </button>
                    <div slot="content">
                        <p class="popover-content">The London mulligan feature derives the cumulative probability of your initial draw, mulligans, and subsequent draw-1 turns.
                        <p class="popover-content">See the FAQs (bottom of this page) and github if you want to help confirm this logic (mulligan calculations have not been confirmed for setups with more than 1 desired card).</p>
                        <p class="popover-content">Special thanks to Michael Moore for helping me understand the mathematics via <a href='https://deckulator.blogspot.com/2022/07/mulligans-and-probability-redrawing.html' target='_blank'>this post</a>.</p>
                    </div>
                </Popover>:</label>
                <select id="mulliganCount" bind:value={mulliganCountString} on:change="{event => handleSelectChange(event.target.value)}">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
        </div>

        <div class="deck-size-container">
            <label for="cardsDrawn">Initial cards drawn:</label>
            <input type="number" class="deckSize" id="cardsDrawn" bind:value={InitialDrawSize} min="1" 
            on:focus="{selectInput}"
            />
        </div>

        <div class="deck-size-container">
            <label for="deckSize">Deck size:</label>
            <input type="number" class="deckSize" id="deckSize" bind:value={deckSize} min="1" 
            on:focus="{selectInput}"
            />
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
    border: 1px solid #ccc;
    border-radius: 6px;
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
        border: 0px solid #ddd;
        padding: 8px;
        text-align: left;
        background-color: white;
    }
    th {
        background-color: #f4f4f4;
    }


    input {
        width: 100%;
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
        justify-content: flex-start;
        margin-top: 12px;
        column-gap: 2rem;
        row-gap: 0.5rem;
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
        margin-right: 5px;
        min-width: 73px;


    }

    button {
        margin: 0;
        color: #0066e9;
        padding: 6px 8px 6px 8px;
    }

    .group-remove-button {
       width: 35px;
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
    option {
        margin:0;
        border-radius: 0px;
    }


</style>
