<script>
  import { createEventDispatcher } from 'svelte';
  import ManaCard from './ManaCard.svelte';
  import { slide } from 'svelte/transition';
  import Popover from './Popover.svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
  import { simulationData } from './colorStore.js';


  let openItem = null;
  let showPopover = false;
  
  const dispatch = createEventDispatcher();
  let manaCards = [];
  let manaRequirements = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ANY:0 }; // Initialize mana requirements



  
  function toggleItem(index) {
    openItem = openItem === index ? null : index;
  }

  function handleKeydown(event, index) {
    if (event.key === 'Enter') {
      toggleItem(index);
    }
  }

  function addCard() {
  const newCard = { id: Date.now(), mana: { W: false, U: false, B: false, R: false, G: false, C: false }, amount: 0 };
  manaCards = [...manaCards, newCard];
  console.log('Added card:', newCard);
}

function removeCard(id) {
  manaCards = manaCards.filter(card => card.id !== id);
}




  $: {
    console.log('Updated manaCards:', manaCards);
}

$: totalAmount = manaCards.reduce((sum, card) => sum + card.amount, 0);



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

    // Filter out entries with zero values
    const filteredManaRequirements = Object.entries(manaRequirements).reduce((acc, [key, value]) => {
        if (value > 0) acc[key] = value;
        return acc;
    }, {});
    console.log('Mana Requirements:', filteredManaRequirements);

    simulationData.set({
        preparedCards: prepareManaCardsForCalculation(),
        manaRequirements: filteredManaRequirements
    });
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
    margin-top: 0.5rem;
    
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


.land-group-parameters {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 0.5rem;
  gap: 10px;
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
    margin-top: 15px; /* Add some space above the inputs */
    border: none;
    height: 1px;
    background-color: #ccc;
  }

  button {
        margin: 0;
        color: #0066e9;
        padding: 6px 8px 6px 8px;
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
      <p>Add all of the lands in your deck and what mana they produce.</p>
      <div class="mana-cards-container">
        {#each manaCards as card (card.id)}
        <ManaCard
          bind:card={card} 
          on:remove={() => removeCard(card.id)}
        />
      {/each}
      </div>
      <div class="land-group-parameters">
      <button on:click={addCard}>Add Land Group</button>
      <div>Total Lands: {totalAmount}</div>
    </div>


      <!-- Horizontal Rule for Separation -->
      <hr class="mana-requirements-divider">

    
      <!-- Mana Requirements Fields -->
      <p>Specify the amount of each type of mana you'd like.</p>
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
      <button on:click={logPreparedCards}>Run Simulation</button>
    </div>
  </div>
</div>

