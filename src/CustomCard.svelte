<script>
    import { createEventDispatcher } from 'svelte';
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    const dispatch = createEventDispatcher();

    export let card = {
        title: '',
        attributes: [],
        amount: 0
    };

    function remove() {
        dispatch('remove');
    }

    function addAttribute() {
        card.attributes = [...card.attributes, ''];
    }

    function removeAttribute(index) {
        card.attributes = card.attributes.filter((_, i) => i !== index);
    }

    function updateAttribute(index, value) {
        card.attributes[index] = value;
    }
</script>


<style>
    .custom-card {
        width: 180px;
        height: auto;
        background-color: #f0f0f0;
        margin: 5px;
        padding: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        border-radius: 4px;
        overflow: hidden;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: baseline;
    }

    .title-input {
        width: 70%;
    }

    .remove-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-left: 5px;
    }

    .attributes-section {
        width: 100%;
        margin: 0.5em 0;
    }

    .attribute-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        gap: 5px;
    }

    .add-attribute-button {
        width: 100%;
        margin-top: 5px;
    }

    .card-footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .amount-label {
        font-size: 14px;
        margin-right: 5px;
    }

    .amount-input {
        width: 70%;
    }

    input, button {
        padding: 6px;
        margin: 0;
        width: 140px;
        box-sizing: border-box;
    }
</style>

<div class="custom-card">
    <div class="card-header">
        <input class="title-input" type="text" placeholder="Title" bind:value={card.title} />
        <button class="remove-button" on:click={remove}>
            <FontAwesomeIcon icon={faTimes} />
        </button>
    </div>
    <div class="attributes-section">
        {#each card.attributes as attribute, index}
            <div class="attribute-row">
                <input type="text" placeholder="Attribute" bind:value={attribute} on:input={e => updateAttribute(index, e.target.value)} />
                {#if index > 0}
                    <button class="remove-attribute-button" on:click={() => removeAttribute(index)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                {/if}
            </div>
        {/each}
        <button class="add-attribute-button" on:click={addAttribute}>Add Attribute</button>
    </div>
    <div class="card-footer">
        <label for="amount" class="amount-label">Amount:</label>
        <input id="amount" class="amount-input" type="number" placeholder="Amount" min="0" bind:value={card.amount} />
    </div>
</div>

