<script>
    import { writable } from 'svelte/store';
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { numberOfTurns } from './colorStore.js';
    import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    let drawAmounts = Array.from({ length: $numberOfTurns + 1 }, () => 1); // Initialize draw amounts

    const dispatch = createEventDispatcher();

    // Function to handle changes in the draw amount dropdown
    function handleDrawAmountChange(turn, event) {
        const value = parseInt(event.target.value, 10);
        dispatch('drawAmountChange', { turn, value });
    }

    let openItem = false;
    let isHovering = false;

    $: drawAmounts = Array.from({ length: $numberOfTurns + 1 }, () => 1); // Update draw amounts when numberOfTurns changes
</script>

<style>
  h3 {
    margin: 0;
    color: #0066e9;
    font-weight: 500;
    font-size: 16px;
  }

  p {
    margin: 0;
  }

    .accordion {
        max-width: 100%;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 6px;
        margin-top: .5rem;
    }

    .accordion.hovering {
        border-color: #8a8a8a;
        box-shadow: 0px 2px 0px 0px rgb(231, 231, 231);
    }

    .accordion-item {
        padding: 0.7rem;
        border-bottom: 1px solid #ccc;
    }

    .accordion-item:last-child {
        border-bottom: none;
    }

    .answer {
        overflow: hidden;
    }

    .accordion-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        margin: -0.7rem;
        padding: 0.7rem;
    }

    .draw-amounts-container {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        padding-top: 12px;
    }

    .draw-amount {
        display: flex;
        align-items: baseline;
    }

    .draw-amount label {
        margin-right: 4px;
    }

    .draw-amount select {
        width: 50px;
    }
</style>

<div class="accordion {isHovering ? 'hovering' : ''}">
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="accordion-item">
        <div class="accordion-title" 
            on:click={() => openItem = !openItem}
            on:keydown={(event) => event.key === 'Enter' && (openItem = !openItem)}
            on:mouseenter={() => isHovering = true}
            on:mouseleave={() => isHovering = false}
            tabindex="0">
            <h3 style="font-weight:400;">Customize number of cards drawn each turn</h3>  
            
            {#if openItem}
            <FontAwesomeIcon icon={faChevronUp} class="chevron-icon" />
          {:else}
            <FontAwesomeIcon icon={faChevronDown} class="chevron-icon" />
          {/if}  

        </div> 
        <div class="answer" transition:slide|local={{ duration: 250 }} style:height="{openItem ? 'auto' : '0'}">
            <p style="margin-top: 0.5rem;">Change the number of cards you draw on any given turn. You can adjust the initial hand size above.</p> 
            <div class="draw-amounts-container">
                {#each $numberOfTurns as drawAmount, turn}
                <div class="draw-amount">
                    <label for="drawAmount-{turn}">Turn {turn + 1}:</label>                    <select id="drawAmount-{turn}" value={drawAmount} on:change="{(event) => handleDrawAmountChange(turn, event)}">
                        {#each Array.from({ length: 7 }, (_, i) => i) as option}
                            <option value={option} selected={option === drawAmount}>{option}</option>
                        {/each}
                    </select>
                </div>
            {/each}
            </div>
        </div>
    </div>
</div>