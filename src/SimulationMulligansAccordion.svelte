<script>
    import { writable } from 'svelte/store';
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { mulliganConfig } from './colorStore.js';
    import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    const dispatch = createEventDispatcher();


    let openItem = false;
    let isHovering = false;


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
        gap: 12px;
        margin-top: 12px;
        border-radius: 6px;
        padding: 12px;
        background-color: #f5f5f5;
    }

    .draw-amount {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: white;
    padding: 8px;
    border-radius: 6px;
    flex-wrap: wrap;
    text-align: right;
  }


  .draw-amount label {
    flex-shrink: 0; /* Prevent shrinking */
    flex-grow: 1; /* Allow growing */
    min-width: 70px; /* Minimum width */
    max-width: 200px; /* Maximum width */
    word-wrap: break-word; /* Break long words */
  }

  .draw-amount select, .draw-amount input {
    flex-shrink: 0; /* Prevent shrinking */
    flex-grow: 1; /* Allow growing */

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
            <h3 style="font-weight:400;">Add mulligan logic to simulations</h3> 
            {#if openItem}
            <FontAwesomeIcon icon={faChevronUp} class="chevron-icon" />
          {:else}
            <FontAwesomeIcon icon={faChevronDown} class="chevron-icon" />
          {/if}     
        </div> 
        <div class="answer" transition:slide|local={{ duration: 250 }} style:height="{openItem ? 'auto' : '0'}">
            <!-- <p style="margin-top: 0.5rem;">Change the number of cards you draw on any given turn. You can adjust the initial hand size above.</p>  -->
            <div class="draw-amounts-container">

                <div class="draw-amount">
                    <label for="max-mulligans"><b>Max mulligans:</b> (not including free mulligan)</label>
                    <select id="max-mulligans" bind:value={$mulliganConfig.maxMulligans}>
                        {#each Array(8).fill(0).map((_, i) => i) as num}
                            <option value={num}>{num}</option>
                        {/each}
                    </select>
                </div>
                
                <div class="draw-amount">
                    <label for="first-mulligan-free">First Mulligan Free:</label>
                    <input id="first-mulligan-free" type="checkbox" bind:checked={$mulliganConfig.firstMulliganFree} />
                </div>

                <div class="draw-amount">
                    <label for="min-lands">Min Lands to keep:</label>
                    <select id="min-lands" bind:value={$mulliganConfig.minLandsInHand}>
                        {#each Array(8).fill(0).map((_, i) => i) as num}
                            <option value={num}>{num}</option>
                        {/each}
                    </select>
                </div>
                
                <div class="draw-amount">
                    <label for="max-lands">Max Lands to keep:</label>
                    <select id="max-lands" bind:value={$mulliganConfig.maxLandsInHand}>
                        {#each Array(8).fill(0).map((_, i) => i) as num}
                            <option value={num}>{num}</option>
                        {/each}
                    </select>
                </div>
        
                <div class="draw-amount">
                    <label for="playable-ramp">Must have playable ramp:</label>
                    <input id="playable-ramp" type="checkbox" bind:checked={$mulliganConfig.mustHavePlayableRamp} />
                </div>

                <div class="draw-amount">
                    <label for="free-mulligan-lands">Free mulligans until max/min lands are satisfied</label>
                    <input id="free-mulligan-lands" type="checkbox" bind:checked={$mulliganConfig.freeMulliganTillLands} />
                </div>
                
                <div class="draw-amount">
                    <label for="mulligan-colors">Mulligan unless ramp + lands can make at least:</label>
                    <select id="mulligan-colors" bind:value={$mulliganConfig.mulliganIfLandsRampCanOnlyMake}>
                        <option value=""></option>
                        <option value="1">1 color</option>
                        <option value="2">2 colors</option>
                        <option value="3">3 colors</option>
                        <option value="4">4 colors</option>
                        <option value="5">5 colors</option>
                    </select>
                </div>

                <!-- <div class="draw-amount">
                    <label>Allow 2 Lands + Playable Ramp:</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.allowTwoLandsPlusRamp} />
                </div>
                
                <div class="draw-amount">
                    <label>Mulligan Unless Opening Hand Can Make:</label>
                    <select multiple bind:value={$mulliganConfig.mulliganUnlessOpeningHandCanMake}>
                        <option value="B">B</option>
                        <option value="U">U</option>
                        <option value="G">G</option>
                        <option value="R">R</option>
                        <option value="W">W</option>
                        <option value="C">C</option>
                    </select>
                </div> -->
                
                <!-- <div class="draw-amount">                    <label>Ramp Must Be Playable:</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.rampMustBePlayable} />
                </div> -->
                
            </div>
        </div>
    </div>
</div>