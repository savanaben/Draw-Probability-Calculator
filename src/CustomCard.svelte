<script>
    import { createEventDispatcher } from 'svelte';
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import Popover from './Popover.svelte';
    import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
   
  const dispatch = createEventDispatcher();
 
  let showPopover = false;

    export let card = {
        title: '',
        attributes: [],
        amount: 0
    };

    function remove() {
        dispatch('remove');
    }

    function addAttribute() {
    const newAttribute = `Attribute ${card.attributes.length + 1}`; // Give a default name to the new attribute
    card.attributes = [...card.attributes, newAttribute];
    dispatch('addattribute', { attribute: newAttribute });
}



function removeAttribute(index) {
    const removedAttribute = card.attributes[index];
    card.attributes = card.attributes.filter((_, i) => i !== index);
    dispatch('removeattribute', { attribute: removedAttribute });
}


function updateAttribute(index, value) {
    const oldValue = card.attributes[index];
    card.attributes[index] = value;
    dispatch('updateattribute', { newAttr: value, oldAttr: oldValue });
}


function selectInput(event) {
    event.target.select(); // Selects all text in the input upon focus
}

</script>


<style>
    .custom-card {
        width: 160px;
        height: auto;
        background-color: #f0f0f0;
        margin: 5px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
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
        margin-top: 5px;
    }

    .card-footer {
        width: 70%;
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
        width: 120px;
        box-sizing: border-box;
    }
    .popover-content:first-child {
  margin-top: 0;
}

.popover-content:last-child {
  margin-bottom: 0;
}


    #moreInfo {
    width: 100%;
    border-radius: 40px;
    border-style: none;
    padding: 0.2em 0.25em 0.15em 0.25em;
    margin: 0;
}

</style>

<div class="custom-card">
    <div class="card-header">
        <input class="title-input" type="text" placeholder="Title" bind:value={card.title} 
        on:focus="{selectInput}"
        />
        <button class="remove-button" on:click={remove}>
            <FontAwesomeIcon icon={faTimes} />
        </button>
    </div>
    <div class="attributes-section">
        {#each card.attributes as attribute, index}
            <div class="attribute-row">
                <input type="text" placeholder="Attribute" bind:value={attribute} on:input={e => updateAttribute(index, e.target.value)} 
                on:focus="{selectInput}"
                />
                    <button class="remove-attribute-button" on:click={() => removeAttribute(index)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>    
            </div>
        {/each}
        <button class="add-attribute-button" on:click={addAttribute}>Add Attribute</button>
        <Popover bind:show={showPopover} placement="top">
            <button id ="moreInfo" class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover} aria-label="Help">
              <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
            </button>
            <div slot="content">
              <p class="popover-content">Attributes allow you to create more custom setups. Think of an attribute like an ability. In land terms, I think of an attribute as a single color that a land can produce. For example, a land that makes islands and plains has two attributes.</p>
              <p class="popover-content"><b>Limitation</b> - Right now, this simulation can only match one card to one desired attribute/card/mana. Let's say you had a card with two attributes (A and B). If you mark below that you desire attribute A and B, the simulation assumes you want two cards to meet those requirements. There is no way to specify that one card can fulfill multiple requirements (a great feature to add, someday).</p>
            </div>
          </Popover>
    </div>
    <div class="card-footer">
        <label for="amount" class="amount-label">Amount:</label>
        <input id="amount" class="amount-input" type="number" placeholder="Amount" min="0" bind:value={card.amount} 
        on:focus="{selectInput}"
        />
    </div>
</div>

