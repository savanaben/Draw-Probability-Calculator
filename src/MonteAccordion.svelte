<script>
  import { createEventDispatcher } from 'svelte';
  import ManaCard from './ManaCard.svelte';
  import { slide } from 'svelte/transition';
  import Popover from './Popover.svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
  import { simulationData } from './colorStore.js';

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

const manaIcons = {
    W: WIcon,
    U: UIcon,
    B: BIcon,
    R: RIcon,
    G: GIcon,
    C: CIcon,
    ANY: [AnyIcon0, AnyIcon1, AnyIcon2, AnyIcon3, AnyIcon4, AnyIcon5, AnyIcon6, AnyIcon7, AnyIcon8, AnyIcon9]
};


  let openItem = null;
  let showPopover = false;
  
  const dispatch = createEventDispatcher();
  let manaCards = [];
  let manaRequirements = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ANY:0 }; // Initialize mana requirements
  let iterations = 10000; // Default number of iterations


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
    return manaIcons.ANY[0]; // Default to AnyIcon1 if none of the conditions match
}


  
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
        manaRequirements: filteredManaRequirements,
        iterations: iterations
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
  cursor: pointer;
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
    display: flex;
    align-items: flex-end;
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

    input {
        width: 95%;
        padding: 6px;
        margin: 0px;
        min-width: 45px;
    }

    .mana-icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
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
            <label for="{color}-requirement">
                <img src={color === 'ANY' ? getAnyIcon(amount) : manaIcons[color]} alt="{color} mana icon" class="mana-icon" />&nbsp;: 
            </label>
            <input
                id="{color}-requirement"
                type="number"
                min="0"
                bind:value={manaRequirements[color]}
            />
        </div>
    {/each}
    
      </div>
      <div class="land-group-parameters">
      <button on:click={logPreparedCards}>Run Simulation</button>
      <div class="mana-requirement">
        <label for="iterations">Simulation iterations (caution):</label>
        <input style="width: 90px;" id="iterations" type="number" min="1" bind:value={iterations} />
        <Popover bind:show={showPopover} placement="top">
          <button class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover} aria-label="Help">
            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
          </button>
          <div slot="content">
            <p class="popover-content"><b>Caution - may crash your browser!</p>
            <p class="popover-content">This parameter changes the number of samples, or draws, taken for this mana probabilities section. More iterations will result in more accurate probabilities, but increases the calculation time. The page might crash and you will have to re-input your lands.</p>
          </div>
        </Popover>

      </div>
  </div>
    </div>
  </div>
</div>

