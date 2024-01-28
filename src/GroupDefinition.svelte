<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let groups = [{ name: '', size: 1, cardsToDraw: 1, link: '' }];

    $: if (groups.length > 0) {
        dispatch('updateGroups', groups);
    }

    function addGroup() {
        groups = [...groups, { name: '', size: 1, cardsToDraw: 1, link: '' }];
    }

    function removeGroup(index) {
        groups = groups.filter((_, i) => i !== index);
    }
</script>

<div>
    <table>
        <thead>
            <tr>
                <th>Group Name</th>
                <th># Cards in Group</th>
                <th># Desired Cards</th>
                <th>Linked Groups</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each groups as group, index}
                <tr>
                    <td>
                        <input type="text" bind:value={group.name} placeholder="Group Name" />
                    </td>
                    <td>
                        <input type="number" bind:value={group.size} min="1" max="99" />
                    </td>
                    <td>
                        <input type="number" bind:value={group.cardsToDraw} min="1" max="99" />
                    </td>
                    <td>
                        <input type="text" bind:value={group.link} placeholder="Link Name" />
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
    <button on:click={addGroup}>Add Another Group</button>
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
    }
    button {
        margin-top: 10px;
    }
</style>
