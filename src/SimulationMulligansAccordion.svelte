<script>
    import { writable } from 'svelte/store';
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { mulliganConfig } from './colorStore.js';


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
            <h3 style="font-weight:400;">Add mulligan logic to simulations</h3>    
        </div> 
        <div class="answer" transition:slide|local={{ duration: 250 }} style:height="{openItem ? 'auto' : '0'}">
            <!-- <p style="margin-top: 0.5rem;">Change the number of cards you draw on any given turn. You can adjust the initial hand size above.</p>  -->
            <div class="draw-amounts-container">

                <div>
                    <label>Max Mulligans:</label>
                    <select bind:value={$mulliganConfig.maxMulligans}>
                        {#each Array(8).fill(0).map((_, i) => i) as num}
                            <option value={num}>{num}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label>Min Lands in Hand:</label>
                    <select bind:value={$mulliganConfig.minLandsInHand}>
                        {#each Array(8).fill(0).map((_, i) => i) as num}
                            <option value={num}>{num}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label>Max Lands in Hand:</label>
                    <select bind:value={$mulliganConfig.maxLandsInHand}>
                        {#each Array(8).fill(0).map((_, i) => i) as num}
                            <option value={num}>{num}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label>First Mulligan Free:</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.firstMulliganFree} />
                </div>
        
                <div>
                    <label>free mulligans until Max/min lands are satisfied</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.freeMulliganTillLands} />
                </div>
        
                <div>
                    <label>Allow 2 Lands + Playable Ramp:</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.allowTwoLandsPlusRamp} />
                </div>
                
                <div>
                    <label>Mulligan if Lands Can Only Make:</label>
                    <select bind:value={$mulliganConfig.mulliganIfLandsCanOnlyMake}>
                        <option value="">None</option>
                        <option value="1">1 color</option>
                        <option value="2">2 colors</option>
                        <option value="3">3 colors</option>
                        <option value="4">4 colors</option>
                        <option value="5">5 colors</option>
                    </select>
                </div>
                
                <div>
                    <label>Mulligan Unless Opening Hand Can Make:</label>
                    <select multiple bind:value={$mulliganConfig.mulliganUnlessOpeningHandCanMake}>
                        <option value="B">B</option>
                        <option value="U">U</option>
                        <option value="G">G</option>
                        <option value="R">R</option>
                        <option value="W">W</option>
                        <option value="C">C</option>
                    </select>
                </div>
                
                <div>
                    <label>Ramp Must Be Playable:</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.rampMustBePlayable} />
                </div>
                
                <div>
                    <label>Must Have Ramp:</label>
                    <input type="checkbox" bind:checked={$mulliganConfig.mustHaveRamp} />
                </div>


            </div>
        </div>
    </div>
</div>