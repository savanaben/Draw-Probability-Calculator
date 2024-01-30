<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let groups = [{ name: '', size: 1, cardsToDraw: 1, link: '' }];
    let deckSize = 99; // Default deck size
    let mulliganCount = 0; // Default to no mulligan




    $: if (groups.length > 0) {
        groups = groups.map(group => {
            if (group.link) {
                return { ...group, cardsToDraw: 1 };
            }
            return group;
        });
        dispatch('updateGroups', { groups, deckSize, mulliganCount }); // Include deckSize in the dispatched event
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
                <th>Category Name</th>
                <th># Cards in category</th>
                <th># Desired Cards</th>
                <th>Linked Categories*</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each groups as group, index}
                <tr>
                    <td>
                        <input type="text" bind:value={group.name} placeholder="mana, draw, ramp, etc" />
                    </td>
                    <td>
                        <input type="number" bind:value={group.size} min="1" max="99" />
                    </td>
                    <td>
                        <input 
                            type="number" 
                            bind:value={group.cardsToDraw} 
                            min="1" 
                            max="99" 
                            disabled={!!group.link} 
                        />
                    </td>
                    <td>
                        <input type="text" bind:value={group.link} placeholder="combo pieces, synergy 1, etc" />
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
