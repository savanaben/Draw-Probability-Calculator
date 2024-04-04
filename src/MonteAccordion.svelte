<script>
  // Import the ManaCard component
  import ManaCard from './ManaCard.svelte';
  import { slide } from 'svelte/transition';
  import Popover from './Popover.svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';


  let openItem = null;
  let showPopover = false;
  let manaCards = [];
  let manaRequirements = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }; // Initialize mana requirements



  
  function toggleItem(index) {
    openItem = openItem === index ? null : index;
  }

  function handleKeydown(event, index) {
    if (event.key === 'Enter') {
      toggleItem(index);
    }
  }

  function addCard() {
  const newCard = { id: Date.now(), mana: { W: false, U: false, B: false, R: false, G: false, C: false }, amount: 1 };
  manaCards = [...manaCards, newCard];
  console.log('Added card:', newCard);
}

function removeCard(id) {
  manaCards = manaCards.filter(card => card.id !== id);
}




  $: {
    console.log('Updated manaCards:', manaCards);
}



function prepareManaCardsForCalculation() {
  let preparedCards = [];
  manaCards.forEach(card => {
    let cardEntry = Object.entries(card.mana)
      .filter(([key, value]) => value)
      .reduce((acc, [key, value]) => {
        acc[key] = 1;
        return acc;
      }, { ANY: 1 }); // Add generic mana

    for (let i = 0; i < card.amount; i++) {
      preparedCards.push(cardEntry);
    }
  });
  console.log(preparedCards); // Add this line to log the array
  return preparedCards;
}


function logPreparedCards() {
  const preparedCards = prepareManaCardsForCalculation();
  console.log('Prepared Cards:', preparedCards);
}


  // Example of sending data back to Calculation.svelte
  // This could be triggered by a button click or another event
  function sendDataToCalculation() {
    let data = prepareManaCardsForCalculation();
    // Use a store, event dispatcher, or prop binding to send data to Calculation.svelte
  }


</script>

<style>
  .accordion {
    max-width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .accordion-item {
    cursor: pointer;
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
  }

  .accordion-item:last-child {
    border-bottom: none;
  }

  .answer {
    overflow: hidden;
  }

  h3 {
    margin: 0;
    color: #0066e9;
    font-weight: 400;
    font-size: 16px;
  }

  p {
    margin: 0;
  }

  .mana-cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    
  }

  .moreInfo {
    border-radius: 40px;
    border-style: none;
    padding: 0.2em 0.25em 0.15em 0.25em;
    margin: 0;
}

.accordion-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}


.mana-requirements-container {
    display: flex;
    grid-template-columns: repeat(6, auto); /* Display inputs horizontally */
    gap: 10px;
    padding: 10px;
    justify-content: start;
    flex-wrap: wrap;
  }

  .mana-requirement {
    display: flex;
    align-items: center;
  }

  .mana-requirement label {
    margin-right: 5px;
  }

  .mana-requirement input {
    width: 50px;
  }

  .mana-requirements-divider {
    margin-top: 20px; /* Add some space above the inputs */
    border: none;
    height: 1px;
    background-color: #ccc;
  }

</style>

<div class="accordion">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
   <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    tabindex="0"
    class="accordion-item"
    on:keydown={(event) => handleKeydown(event, 0)}
  >
    <div class="accordion-title" on:click={() => toggleItem(0)}>
      <h3>Advanced mana probabilities</h3>
      <Popover bind:show={showPopover} placement="top">
        <button class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover} aria-label="Help">
          <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
        </button>
        <div slot="content">
          <p class="popover-content">In edh categories can be thought of as the group of similar cards you want to find the percent chance of drawing. For example, ramp, lands, interaction, etc. In 60-card formats this might be more focused around individual cards you have 2-4 of in your deck.</p>
          <p class="popover-content"><b>Each category must have a unique text name </b> for the tool to work (some day I'll figure out indexing...)</p>
        </div>
      </Popover>
    </div>
    <div
      class="answer"
      transition:slide|local={{ duration: 250 }}
      style:height="{openItem === 0 ? 'auto' : '0'}"
    >
      <!-- Mana Cards and Add Button -->
      <div class="mana-cards-container">
        {#each manaCards as card (card.id)}
        <ManaCard
          bind:card={card} 
          on:remove={() => removeCard(card.id)}
        />
      {/each}
        <button on:click={addCard}>Add Mana Group</button>
      </div>

      <!-- Horizontal Rule for Separation -->
      <hr class="mana-requirements-divider">

    

      <!-- Mana Requirements Fields -->

      <button on:click={logPreparedCards}>Log Prepared Cards</button>

      <div class="mana-requirements-container">
        {#each Object.entries(manaRequirements) as [color, amount]}
          <div class="mana-requirement">
            <label for="{color}-requirement">{color}:</label>
            <input
              id="{color}-requirement"
              type="number"
              min="0"
              bind:value={manaRequirements[color]}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

