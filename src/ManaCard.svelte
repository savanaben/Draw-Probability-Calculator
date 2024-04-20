<script>
    import { onMount, onDestroy } from 'svelte';
    import Popover from './Popover.svelte';
    import { createEventDispatcher } from 'svelte';
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    
import WIcon from './mana-icons/plains.svg';
import UIcon from './mana-icons/swamp.svg';
import BIcon from './mana-icons/island.svg';
import RIcon from './mana-icons/mountain.svg';
import GIcon from './mana-icons/forrest.svg';
import CIcon from './mana-icons/colorless.svg';

const manaIcons = {
    W: WIcon,
    U: UIcon,
    B: BIcon,
    R: RIcon,
    G: GIcon,
    C: CIcon,
};





    let dropdownOpen = false;
    let buttonPosition = { top: 0, left: 0 };
    const dispatch = createEventDispatcher();


    export let card = {
      mana: {
        W: false,
        U: false,
        B: false,
        R: false,
        G: false,
        C: false
      },
      amount: 0
    };
  
  

    // Dummy remove function (you'll need to implement the actual logic)
  function remove() {
    dispatch('remove');
  }
  
  
    function toggleMana(mana) {
    card.mana[mana] = !card.mana[mana];
  }
  

  function selectInput(event) {
    event.target.select(); // Selects all text in the input upon focus
}

  </script>
  
  
  <style>

.amount-label {
    margin-right: 5px;
    font-size: 14px;
}

.mana-card-header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: baseline;
    }

    .remove-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-left: 5px;
    }

.mana-symbol {
        width: 29%;
        text-align: center;
        cursor: pointer;
        padding: 2px;
        background-color: white;
        border-radius: 4px;
        border: 2px solid rgb(255, 255, 255); /* Default transparent border */
        margin: 2px;
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

    .mana-card {
      width: 130px;
      height: auto;
      background-color: #f0f0f0;
      margin: 5px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      border-radius: 4px;
      overflow: hidden;
    }
  
    .mana-dropdown {
      position: relative;
      display: inline-block;
      width: 100%;
    }
  
    .dropdown-content {
      display: none;
      position: absolute;
      background-color: #f9f9f9;
      min-width: 50px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      z-index: 1;
    }
  
    .dropdown-button {
width: inherit;
    }

    .mana-option {
      display: flex;
   
      justify-content: space-between;
      padding: 5px;
      cursor: pointer;
   
    }
  
    .mana-option:hover {
      background-color: #f1f1f1;
    }
  
    .mana-symbols {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
      font-weight: bold;
      margin: 0.5em 0 0.5em 0;
    }
  
  
    .amount-input {
      width: 100%;
      box-sizing: border-box;
    }
  
    .remove-button {
      width: 30%;
      height: 100%;
      box-sizing: border-box;
    }

    button {
        margin: 0;
        color: #0066e9;
        padding: 6px 8px 6px 8px;
    }


    input {
        width: 95%;
        padding: 6px;
        margin: 0px;
        min-width: 45px;
    }


  </style>
  

  <div class="mana-card">
    <div class="mana-card-header">
      <p style="margin: 0.2rem 0 0.2rem 0;">Mana&nbsp;card(s)</p>
     
               <!-- the following method was a dropdown, which I eventually cut for buttons. might be
          better on mobile... -->
      <!-- <Popover placement="bottom">
            <button slot="trigger" class="dropdown-button">Mana</button>
            <div slot="content" class="mana-options">
                {#each ['W', 'U', 'B', 'R', 'G', 'C'] as mana}
                    <div class="mana-option" on:click={() => toggleMana(mana)}>
                        <span>{mana}</span>
                        <input type="checkbox" bind:checked={card.mana[mana]} />
                    </div>
                {/each}
            </div> 
        </Popover>  -->
        <button class="remove-button" on:click={remove}>
            <FontAwesomeIcon icon={faTimes} />
        </button>
    </div>
    <div class="mana-symbols">
      {#each Object.keys(manaIcons) as mana}
      <button class="mana-symbol {card.mana[mana] ? 'active' : ''}" on:click={() => toggleMana(mana)} tabindex="0">
        <img src={manaIcons[mana]} alt="{mana} mana icon" class="mana-icon" />
      </button>
  {/each}
  
    </div>
    <div class="mana-card-header">
        <label for="amount" class="amount-label">Amount:</label>
        <input id="amount" class="amount-input" type="number" placeholder="Amount" min="0" bind:value={card.amount} 
        on:focus="{selectInput}"
        />
    </div>
</div>


  
  