<script>
    import { onMount, onDestroy } from 'svelte';
    import Popover from './Popover.svelte';
    
    import { faTimes } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    let dropdownOpen = false;
    let buttonPosition = { top: 0, left: 0 };

    export let card = {
      mana: {
        W: false,
        U: false,
        B: false,
        R: false,
        G: false,
        C: false
      },
      amount: 1
    };
  
  

    // Dummy remove function (you'll need to implement the actual logic)
    function remove() {
      console.log('Remove card');
    }
  
  
    function toggleMana(mana) {
    card.mana[mana] = !card.mana[mana];
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
        width: 20%;
        text-align: center;
        cursor: pointer;
        padding: 2px;
        background-color: white;
        border-radius: 4px;
        border: 2px solid rgb(255, 255, 255); /* Default transparent border */
    }

    .mana-symbol.active {
        border-color: #000; /* Black border for active state */
        border-width: 2px;
    }

    .mana-card {
      width: 110px;
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
      align-items: baseline;
      justify-content: space-between;
      padding: 5px;
      cursor: pointer;
      width: 35px;
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
      margin: 0 0 0.5em 0;
    }
  
    .mana-symbol {
      width: 21%;
      text-align: center;
      margin: 2px;
    }
  
    .amount-input {
      width: 100%;
      box-sizing: border-box;
    }
  
    .remove-button {
      width: 100%;
      box-sizing: border-box;
    }
  </style>
  

  <div class="mana-card">
    <div class="mana-card-header">
        <Popover placement="bottom">
            <button slot="trigger" class="dropdown-button">Mana</button>
            <div slot="content" class="mana-options">
                {#each ['W', 'U', 'B', 'R', 'G', 'C'] as mana}
                    <div class="mana-option" on:click={() => toggleMana(mana)}>
                        <span>{mana}</span>
                        <input type="checkbox" bind:checked={card.mana[mana]} />
                    </div>
                {/each}
            </div>
        </Popover>
        <button class="remove-button" on:click={remove}>
            <FontAwesomeIcon icon={faTimes} />
        </button>
    </div>
    <div class="mana-symbols">
        {#each ['W', 'U', 'B', 'R', 'G', 'C'] as mana}
            <div class="mana-symbol {card.mana[mana] ? 'active' : ''}" on:click={() => toggleMana(mana)}>{mana}</div>
        {/each}
    </div>
    <div class="mana-card-header">
        <label for="amount" class="amount-label">Amount:</label>
        <input id="amount" class="amount-input" type="number" placeholder="Amount" min="1" bind:value={card.amount} />
    </div>
</div>


  
  