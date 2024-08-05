

<script>
    import { createEventDispatcher } from 'svelte';
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import Popover from './Popover.svelte';
    import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';


    import WIcon from './mana-icons/plains.svg';
    import UIcon from './mana-icons/swamp.svg';
    import BIcon from './mana-icons/island.svg';
    import RIcon from './mana-icons/mountain.svg';
    import GIcon from './mana-icons/forrest.svg';
    import CIcon from './mana-icons/colorless.svg';
    import AnyIcon0 from './mana-icons/any-0.svg';
    import AnyIcon1 from './mana-icons/any-1.svg';
    import AnyIcon2 from './mana-icons/any-2.svg';
    import AnyIcon3 from './mana-icons/any-3.svg';
    import AnyIcon4 from './mana-icons/any-4.svg';
    import AnyIcon5 from './mana-icons/any-5.svg';
    import AnyIcon6 from './mana-icons/any-6.svg';
    import AnyIcon7 from './mana-icons/any-7.svg';
    import AnyIcon8 from './mana-icons/any-8.svg';
    import AnyIcon9 from './mana-icons/any-9plus.svg';

    let showPopover = false;

    const uniqueId = `ramp-card-${Date.now()}`; // Generate a unique ID using current date/time


    const manaIcons = {
        W: { icon: WIcon, label: 'Plains' },
        U: { icon: UIcon, label: 'Swamp' },
        B: { icon: BIcon, label: 'Island' },
        R: { icon: RIcon, label: 'Mountain' },
        G: { icon: GIcon, label: 'Forest' },
        C: { icon: CIcon, label: 'Colorless' },
        ANY: [AnyIcon0, AnyIcon1, AnyIcon2, AnyIcon3, AnyIcon4, AnyIcon5, AnyIcon6, AnyIcon7, AnyIcon8, AnyIcon9]
    };

    const dispatch = createEventDispatcher();

    export let card = {
        title: '',
        TotalManaCost: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ANY: 0 },
        ColorsCanProduce: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ANY: 0 },
        CanProduce: 0,
        AbilityCost: 0,
        AvailableTurnPlayed: 0,
        amount: 0,
        isSignet: false // New property to indicate if the card is a signet
    };

    function remove() {
        dispatch('remove');
    }

    function toggleManaProduce(mana) {
        card.ColorsCanProduce[mana] = card.ColorsCanProduce[mana] === 1 ? 0 : 1;
        card.ColorsCanProduce.ANY = Object.values(card.ColorsCanProduce).some(value => value === 1) ? 1 : 0;
    }

    function selectInput(event) {
        event.target.select(); // Selects all text in the input upon focus
    }

    function getAnyIcon(value) {
        if (value <= 0) return manaIcons.ANY[0];
        if (value === 1) return manaIcons.ANY[1];
        if (value === 2) return manaIcons.ANY[2];
        if (value === 3) return manaIcons.ANY[3];
        if (value === 4) return manaIcons.ANY[4];
        if (value === 5) return manaIcons.ANY[5];
        if (value === 6) return manaIcons.ANY[6];
        if (value === 7) return manaIcons.ANY[7];
        if (value === 8) return manaIcons.ANY[8];
        if (value >= 9) return manaIcons.ANY[9];
        return manaIcons.ANY[0]; // Default to AnyIcon0 if none of the conditions match
    }

    // Update the card object to include CustomRamp: 'signet' if isSignet is true
    $: if (card.isSignet) {
        card.CustomRamp = 'signet';
        Object.keys(card.TotalManaCost).forEach(key => {
            card.TotalManaCost[key] = 0;
        });
        card.TotalManaCost.ANY = 2;
        card.CanProduce = 2;
        card.AvailableTurnPlayed = 1;
    } else {
        delete card.CustomRamp;
    }

</script>
<style>
    .ramp-card {
        width: 100%;
        max-width: 361px;
        height: auto;
        background-color: #f0f0f0;
        margin: 5px;
        padding: 8px;
        row-gap: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: 4px;
        overflow: hidden;
    }

    .ramp-card-header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: baseline;
    }

.mana-label {
    margin: 0;
}

    .mana-symbol {
        width: 38px; /* Adjusted width */
        height: 38px; /* Adjusted height */
        text-align: center;
        cursor: pointer;
        padding: 2px;
        background-color: white;
        border-radius: 4px;
        border: 2px solid rgb(255, 255, 255); /* Default transparent border */
        margin: 4px;
    }

    .mana-symbol:hover {
        outline-style: solid;
        outline-color: #b3b3b3;
        outline-width: 1px;
    }

    .mana-symbol.active {
        border-color: #1b67e1; 
        border-width: 2px;
        background-color: #eaf2ff;
    }

    .mana-symbols {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start; /* Align items to the start (left) */
        width: 100%;
        font-weight: bold;
        margin: 0.5em 0 0.5em 0;
    }

    .one-line {
        display: flex;
        align-items: center;
        column-gap: 10px;
    }


    .mana-inputs {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .mana-input {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    .mana-input label {
        margin-right: 4px;
        display: flex;
        align-items: flex-end;
    }

    .mana-input input {
        width: 50px;
    }

    .title-input {
        min-width: 133px;
    }

    .mana-icon {
        width: 20px;
        height: 20px;
        vertical-align: middle;
    }

    .mana-icon-large {
        width: 30px;
        height: 30px;
        vertical-align: middle;
    }



    input {
    padding: 6px;
    margin: 0px;
    max-width: 60px;
   }

.popover-content:first-child {
  margin-top: 0;
}

.popover-content:last-child {
  margin-bottom: 0;
}

.amount-section {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 6px;
    text-align: right;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: -0.3rem;
}


</style>



<div class="ramp-card">
    <div class="ramp-card-header">
    <div class="one-line">
        <label for="title-input">Ramp card(s)</label>
        <input aria-label="ramp card title" class="title-input" type="text" placeholder="Optional name..." bind:value={card.title} on:focus="{selectInput}" />

       </div>
      <button aria-label="Remove ramp card" class="remove-button" on:click={remove}>
        <FontAwesomeIcon icon={faTimes} />
    </button>
    </div>

    <div class="mana-section">
        <p class="mana-label">Ramp mana cost (cmc):</p>
        <div class="mana-inputs">
            {#each Object.keys(manaIcons) as mana}
                <div class="mana-input">
                    <label for="{uniqueId}-{mana}-cost">
                        {#if mana === 'ANY'}
                            <img src={getAnyIcon(card.TotalManaCost.ANY)} alt="{mana} mana icon" class="mana-icon" />
                        {:else}
                            <img src={manaIcons[mana].icon} alt="{mana} mana icon" class="mana-icon" />
                        {/if}
                        &nbsp;:
                    </label>
                    <input id="{uniqueId}-{mana}-cost" type="number" min="0" bind:value={card.TotalManaCost[mana]} on:focus="{selectInput}" disabled={card.isSignet && mana !== 'ANY'} /> <!-- Use uniqueId here -->
                </div>
            {/each}
        </div>
    </div>

    <div class="mana-section">
        <p class="mana-label">Colors ramp can produce:</p>
        <div class="mana-input">
        {#each Object.keys(manaIcons).filter(mana => mana !== 'ANY') as mana}
            <button 
                class="mana-symbol {card.ColorsCanProduce[mana] === 1 ? 'active' : ''}"
                on:click={() => toggleManaProduce(mana)} 
                tabindex="0"
                aria-label={manaIcons[mana].label + ' mana'}
                aria-pressed={card.ColorsCanProduce[mana] === 1 ? 'true' : 'false'}> 
                <img src={manaIcons[mana].icon} alt="{mana} mana icon" class="mana-icon-large" />
            </button>
        {/each}
    </div>
    </div>


    <div class="one-line">
        <label for="{uniqueId}-can-produce" class="can-produce-label">Total mana ramp can produce:</label> <!-- Use uniqueId here -->
        <input id="{uniqueId}-can-produce" class="can-produce-input" type="number" min="0" bind:value={card.CanProduce} on:focus="{selectInput}" disabled={card.isSignet} /> <!-- Use uniqueId here -->
    </div>

    <!-- <div class="ability-cost-section">
        <label for="ability-cost" class="ability-cost-label">Ability Cost:</label>
        <input id="ability-cost" class="ability-cost-input" type="number" min="0" bind:value={card.AbilityCost} on:focus="{selectInput}" />
    </div> -->

    <div class="one-line">
        <label for="{uniqueId}-available-turn-played" class="available-turn-played-label">Mana is available turn played:</label> <!-- Use uniqueId here -->
        <input id="{uniqueId}-available-turn-played" type="checkbox" bind:checked={card.AvailableTurnPlayed} on:change={() => card.AvailableTurnPlayed = card.AvailableTurnPlayed ? 1 : 0} disabled={card.isSignet} /> <!-- Use uniqueId here -->
    </div>

    <div class="one-line">
        <label for="{uniqueId}-is-signet" class="is-signet-label">Is signet:</label> 
        <input id="{uniqueId}-is-signet" type="checkbox" bind:checked={card.isSignet} /> 

        <Popover bind:show={showPopover} placement="top">
            <button id ="moreInfo" class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
              <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
            </button>
            <div slot="content">
                <p class="popover-content">Signet's are a complex, as we have to simulate what mana is used to pay the 1 colorless.</p>
                <ol>
                  <li>If there is mana that can only produce colorless available, that will be used to pay the 1.</li>
                  <li>If there is no colorless mana mana available, then the color you can produce the most of is used to pay the 1.</li>
                </ol>
            </div>
          </Popover>

    </div>
<hr class="secondary-divider" style="margin: 0px; background-color:#cecece">
    <div class="amount-section">
        <label for="{uniqueId}-amount" class="amount-label" style="max-width: 200px;">Amount of ramp cards with these same attributes:</label> <!-- Use uniqueId here -->
        <input id="{uniqueId}-amount" class="amount-input" type="number" min="0" bind:value={card.amount} on:focus="{selectInput}" /> <!-- Use uniqueId here -->
</div>
</div>


