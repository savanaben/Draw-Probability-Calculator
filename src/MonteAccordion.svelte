<script>
  import { createEventDispatcher } from 'svelte';
  import ManaCard from './ManaCard.svelte';
  import RampCard from './RampCard.svelte';
  import CustomCard from './CustomCard.svelte';
  import { slide } from 'svelte/transition';
  import Popover from './Popover.svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
  import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
  import { simulationData, simulationType, simplifiedRampMana, monteCarloResults, shouldResetSimulation } from './colorStore.js';
  import { trackEvent } from './analytics.js';
  import { writable } from 'svelte/store';
  import SimulationMulligansAccordion from './SimulationMulligansAccordion.svelte';



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
    import { faYenSign } from '@fortawesome/free-solid-svg-icons';

const manaIcons = {
    W: WIcon,
    U: UIcon,
    B: BIcon,
    R: RIcon,
    G: GIcon,
    C: CIcon,
    ANY: [AnyIcon0, AnyIcon1, AnyIcon2, AnyIcon3, AnyIcon4, AnyIcon5, AnyIcon6, AnyIcon7, AnyIcon8, AnyIcon9]
};


  let openItem = 0; // this sets the accordion to open on page load. can set to "null" to be closed on page load. 
  let isOpen = true; // Track the open/close state
  let showPopover = false;
  
  const dispatch = createEventDispatcher();
  let manaCards = [];
  let customCards = [];
  let rampCards = [];
  let manaRequirements = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ANY:0 }; // Initialize mana requirements
  let iterations = 5000; // Default number of iterations
  let customAttributeRequirements = {}; // New variable for custom attributes
  let uniqueAttributes = new Set();
  let activeManaTypes = {};
  let isHovering = false;
  let totalCustomAmount = 0; // This will hold the sum of all custom cards' amounts



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


// Generic function to handle button clicks and send analytics---------------------------



function handleRunSimulationClick() {
    logPreparedCards(); // Call the original function to run the simulation
    trackEvent('run_simulation_click', {
        'event_label': 'User clicked Run Simulation button'
    });
}

function handleRunHandSimulationClick() {
        logPreparedCards('hand'); // Pass 'hand' to indicate hand simulation
        trackEvent('run_hand_simulation_click', {
            'event_label': 'User clicked Run Hand Simulation button'
        });
    }


function handleToggleAccordionClick() {
    toggleItem(0); // Assuming toggleItem toggles the visibility of accordion item
    trackEvent('toggle_monte_accordion_click', {
        'event_label': 'User toggled the monte carlo simulation accordion'
    });
}

function handleAddManaGroupClick() {
    addCard(); // Call the original function to add a mana group
    trackEvent('add_mana_group_click', {
        'event_label': 'User clicked Add Mana Group button'
    });
}

function handleAddRampGroupClick() {
    addRampCard();
    trackEvent('add_ramp_group_click', {
      'event_label': 'User clicked Add Ramp Group button'
    });
  }


function handleAddCustomGroupClick() {
    addCustomCard(); // Call the original function to add a custom group
    trackEvent('add_custom_group_click', {
        'event_label': 'User clicked Add Custom Group button'
    });
}

//------------------------------

  
function ClearSimulation() {
  // Reset simulation data
    monteCarloResults.set([]);
    shouldResetSimulation.set(true);
    // Optional: reset shouldResetSimulation after a microtask to allow other components to detect the change
    setTimeout(() => shouldResetSimulation.set(false), 0);
}


  function toggleItem(index) {
    openItem = openItem === index ? null : index;
    isOpen = !isOpen; // Toggle the open/close state
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



function addRampCard() {
    const newRampCard = {
      id: Date.now(),
      TotalManaCost: { B: 0, U: 0, G: 0, R: 0, W: 0, C: 0, ANY: 0 },
      ColorsCanProduce: { B: 0, U: 0, G: 0, R: 0, W: 0, C: 0, ANY: 0 },
      CanProduce: 1,
      AbilityCost: 0,
      AvailableTurnPlayed: 0,
      amount: 0
    };
    rampCards = [...rampCards, newRampCard];
    console.log('Added ramp card:', newRampCard);
  }

  function removeRampCard(id) {
    rampCards = rampCards.filter(card => card.id !== id);
  }



function addCustomCard() {
    const newCustomCard = { 
        id: Date.now(), 
        title: `Group ${customCards.length + 1}`, 
        attributes: [], 
        amount: 0 
    };
    customCards = [...customCards, newCustomCard];
}


function removeCustomCard(id) {
    // Find the custom card that is being removed
    const removedCard = customCards.find(card => card.id === id);

    // Remove the custom card from the array
    customCards = customCards.filter(card => card.id !== id);
    updateCustomAttributeRequirements();

    // Remove the title and attributes from manaRequirements and create a new object
    if (removedCard) {
        let newManaRequirements = { ...manaRequirements };
        delete newManaRequirements[removedCard.title];
        removedCard.attributes.forEach(attr => {
            delete newManaRequirements[attr];
        });
        manaRequirements = newManaRequirements;
    }
}

//this tracks what mana types are selected in cards, so we only show the relevant
//fields in the manaRequirements section
$: {
    let types = { B: false, U: false, G: false, R: false, W: false, C: false, ANY: false };
    let anyActive = false;
    manaCards.forEach(card => {
      Object.keys(card.mana).forEach(type => {
        if (card.mana[type]) {
          types[type] = true;
          if (type !== 'ANY') {
            anyActive = true; // Set to true if any specific mana type is true
          }
        }
      });
    });

    // Only set ANY active if any specific mana type is active, ignoring custom cards for ANY visibility
    types.ANY = anyActive;

    activeManaTypes = types;
  }

  // Reactive statement to update mana requirements
  $: {
    // Remove mana types from manaRequirements if they are no longer active and not part of custom groups
    Object.keys(manaRequirements).forEach(color => {
      if (!activeManaTypes[color] && !customCards.some(card => card.title === color || card.attributes.includes(color))) {
        delete manaRequirements[color];
      }
    });

    // Ensure all active mana types are present in manaRequirements
    Object.keys(activeManaTypes).forEach(color => {
      if (activeManaTypes[color] && !(color in manaRequirements)) {
        manaRequirements[color] = 0;
      }
    });

    // Ensure custom groups are present in manaRequirements
    customCards.forEach(card => {
      if (!(card.title in manaRequirements)) {
        manaRequirements[card.title] = 0;
      }
      card.attributes.forEach(attr => {
        if (!(attr in manaRequirements)) {
          manaRequirements[attr] = 0;
        }
      });
    });
  }


  


$: {
    customCards.forEach(card => {
        manaRequirements[card.title] = manaRequirements[card.title] || 0;
        card.attributes.forEach(attrName => {
            manaRequirements[attrName] = manaRequirements[attrName] || 0;
        });
    });

    // Remove keys from manaRequirements that are no longer in customCards
    Object.keys(manaRequirements).forEach(key => {
        if (!customCards.some(card => card.title === key || card.attributes.includes(key)) && !(key in manaIcons)) {
            delete manaRequirements[key];
        }
    });

    mergeCustomAttributesIntoManaRequirements(); // Ensure merging custom attributes


    console.log("Updated manaRequirements:", manaRequirements);

}


$: {
    // Update manaRequirements based on customCards titles
    customCards.forEach(card => {
        if (!(card.title in manaRequirements)) {
            manaRequirements[card.title] = 0; // Initialize if the title is new
        }
    });
    // Remove keys from manaRequirements that are no longer in customCards
    Object.keys(manaRequirements).forEach(key => {
        if (!customCards.some(card => card.title === key) && !(key in manaIcons)) {
            delete manaRequirements[key];
        }
    });

    mergeCustomAttributesIntoManaRequirements(); // Ensure merging custom attributes


}




$: {
    console.log('Custom Cards:', customCards);
    customCards.forEach(card => {
        manaRequirements[card.title] = manaRequirements[card.title] || 0;
        card.attributes.forEach(attr => {
            manaRequirements[attr] = manaRequirements[attr] || 0;
        });
    });

    mergeCustomAttributesIntoManaRequirements(); // Ensure merging custom attributes

    console.log("Updated manaRequirements (attributes):", manaRequirements);

}



$: enableSimulationButton = 
    (Object.values(manaRequirements).some(amount => amount > 0) || Object.values(customAttributeRequirements).some(amount => amount > 0)) &&
    (manaCards.some(card => card.amount > 0) || customCards.some(card => card.amount > 0));


$: {
    console.log('Updated manaCards:', manaCards);
}

$: totalAmount = manaCards.reduce((sum, card) => sum + card.amount, 0);

$: totalRampAmount = rampCards.reduce((sum, card) => sum + card.amount, 0);

$: totalCustomAmount = customCards.reduce((sum, card) => sum + card.amount, 0);


$: {
    // Update manaRequirements based on customCards
    customCards.forEach(card => {
        manaRequirements[card.title] = manaRequirements[card.title] || 0;
        card.attributes.forEach(attr => {
            manaRequirements[attr] = manaRequirements[attr] || 0;
        });
    });
}











  // Reactivity for custom attributes
  $: {
      customCards.forEach(card => {
          card.attributes.forEach(attr => {
              if (!(attr in customAttributeRequirements)) {
                  customAttributeRequirements[attr] = 0; // Initialize if the attribute is new
              }
          });
      });
      // Remove keys from customAttributeRequirements that are no longer in customCards
      Object.keys(customAttributeRequirements).forEach(key => {
          if (!customCards.some(card => card.attributes.includes(key))) {
              delete customAttributeRequirements[key];
          }
      });

      
      mergeCustomAttributesIntoManaRequirements();

  }


  $: {
    uniqueAttributes.clear();
    customCards.forEach(card => {
        card.attributes.forEach(attr => {
            uniqueAttributes.add(attr);
        });
    });
    console.log("Unique attributes:", uniqueAttributes);
}



// Update function for custom attributes
function updateCustomAttribute(attr, value) {
    console.log(`Updating custom attribute ${attr} to value:`, value);
    customAttributeRequirements[attr] = Number(value);
    updateCustomAttributeRequirements(); // Ensure updating custom attribute requirements
    console.log(`Updated customAttributeRequirements:`, customAttributeRequirements);
}


function mergeCustomAttributesIntoManaRequirements() {
    Object.entries(customAttributeRequirements).forEach(([key, value]) => {
        manaRequirements[key] = value;
    });
    console.log("Merged manaRequirements:", manaRequirements);
}


$: filteredManaRequirements = Object.fromEntries(
    Object.entries(manaRequirements).filter(([key]) => !customCards.some(card => card.attributes.includes(key)))
);



function updateCustomAttributeRequirements() {
    const allAttributes = customCards.flatMap(card => card.attributes);
    const newRequirements = {};

    // Only add current attributes, initializing them to existing values or 0.
    allAttributes.forEach(attr => {
        newRequirements[attr] = customAttributeRequirements[attr] || 0;
    });

    // By completely replacing the object, we ensure Svelte detects the change.
    customAttributeRequirements = newRequirements;

    // Optionally, trigger attribute updates if needed (simulate with no changes)
    allAttributes.forEach(attr => {
        // This is hypothetical and may need adjustment:
        handleAttributeUpdate(attr, attr);
    });
    
    mergeCustomAttributesIntoManaRequirements(); // Ensure merging custom attributes

    console.log('Updated customAttributeRequirements:', customAttributeRequirements);
}



function handleAttributeUpdate(newAttr, oldAttr, cardId) {
    // Update the customCard attributes
    customCards = customCards.map(card => {
        if (card.id === cardId) {
            return {
                ...card,
                attributes: card.attributes.map(attr => (attr === oldAttr ? newAttr : attr))
            };
        }
        return card;
    });

    // Update the uniqueAttributes set
    uniqueAttributes.delete(oldAttr);
    uniqueAttributes.add(newAttr);

    // Trigger reactivity by converting the set to an array
    uniqueAttributes = new Set([...uniqueAttributes]);

    // Update the customAttributeRequirements object
    const oldValue = customAttributeRequirements[oldAttr] || 0;
    delete customAttributeRequirements[oldAttr];
    customAttributeRequirements[newAttr] = oldValue;

    console.log('Updated customCards:', customCards);
    console.log('Updated uniqueAttributes:', uniqueAttributes);
    console.log('Updated customAttributeRequirements:', customAttributeRequirements);
}








// const rampCards = [
//     // {
//     //     TotalManaCost: { B: 0, U: 0, G: 0, R: 0, W: 0, C: 0, ANY: 1 },
//     //     ColorsCanProduce: { B: 0, U: 0, G: 0, R: 0, W: 0, C: 0, ANY: 1 },
//     //     CanProduce: 2,
//     //     AbilityCost: 0,
//     //     AvailableTurnPlayed: 1,
//     //     amount: 7
//     // },
//     // {
//     //     TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
//     //     ColorsCanProduce: { B: 0, U: 0, G: 1, R: 1, W: 0, C: 0, ANY: 1 },
//     //     CanProduce: 1,
//     //     AbilityCost: 0,
//     //     AvailableTurnPlayed: 0,
//     //     amount: 25
//     // }





  







//     {
//         TotalManaCost: { B: 0, U: 0, G: 2, R: 0, W: 0, C: 0, ANY: 1 },
//         ColorsCanProduce: { B: 1, U: 1, G: 1, R: 1, W: 1, C: 0, ANY: 1 },
//         CanProduce: 1,
//         AbilityCost: 0,
//         AvailableTurnPlayed: 0,
//         amount: 4
//     },
//     {
//         TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
//         ColorsCanProduce: { B: 1, U: 1, G: 1, R: 1, W: 1, C: 0, ANY: 1 },
//         CanProduce: 1,
//         AbilityCost: 0,
//         AvailableTurnPlayed: 0,
//         amount: 2
//     },
//     {
//         TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
//         ColorsCanProduce: { B: 0, U: 1, G: 1, R: 1, W: 0, C: 0, ANY: 1 },
//         CanProduce: 1,
//         AbilityCost: 0,
//         AvailableTurnPlayed: 1,
//         amount: 5
//     },
//     {
//         TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
//         ColorsCanProduce: { B: 0, U: 0, G: 0, R: 1, W: 1, C: 0, ANY: 1 },
//         CanProduce: 1,
//         AbilityCost: 0,
//         AvailableTurnPlayed: 1,
//         amount: 5
//     },
//     {
//         TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 0 },
//         ColorsCanProduce: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
//         CanProduce: 1,
//         AbilityCost: 0,
//         AvailableTurnPlayed: 0,
//         amount: 6
//     }















    // {
    //     TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 2 },
    //     ColorsCanProduce: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
    //     CanProduce: 1,
    //     AbilityCost: 0,
    //     AvailableTurnPlayed: 0,
    //     amount: 7
    // },
    // {
    //     TotalManaCost: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 0 },
    //     ColorsCanProduce: { B: 0, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 1 },
    //     CanProduce: 1,
    //     AbilityCost: 0,
    //     AvailableTurnPlayed: 0,
    //     amount: 7
    // }
    // {
    //     TotalManaCost: { B: 0, U: 0, G: 1, R: 1, W: 0, C: 0, ANY: 0 },
    //     ColorsCanProduce: { B: 0, U: 0, G: 1, R: 1, W: 0, C: 0, ANY: 0 },
    //     CanProduce: 2,
    //     AbilityCost: 1,
    //     amount: 1
    // },
    // {
    //     TotalManaCost: { B: 0, U: 0, G: 0, R: 0, W: 1, C: 1, ANY: 0 },
    //     ColorsCanProduce: { B: 0, U: 0, G: 0, R: 0, W: 1, C: 1, ANY: 0 },
    //     CanProduce: 2,
    //     AbilityCost: 1,
    //     amount: 1
    // },
    // {
    //     TotalManaCost: { B: 1, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 0 },
    //     ColorsCanProduce: { B: 1, U: 0, G: 1, R: 0, W: 0, C: 0, ANY: 0 },
    //     CanProduce: 2,
    //     AbilityCost: 1,
    //     amount: 1
    // },
    // {
    //     TotalManaCost: { B: 0, U: 1, G: 0, R: 1, W: 0, C: 0, ANY: 0 },
    //     ColorsCanProduce: { B: 0, U: 1, G: 0, R: 1, W: 0, C: 0, ANY: 0 },
    //     CanProduce: 2,
    //     AbilityCost: 1,
    //     amount: 1
    // }
// ];


// these two functions simplify ramp and prep it for processing combinations
// with the lands.


const manaOrder = ['ANY', 'W', 'U', 'B', 'R', 'G', 'C'];

function normalizeObject(obj) {
    const orderedObj = {};
    manaOrder.forEach(key => {
        if (obj[key] !== undefined) {
            orderedObj[key] = obj[key];
        }
    });
    return orderedObj;
}

function simplifyColorsCanProduce(colorsCanProduce) {
    return Object.fromEntries(
        Object.entries(colorsCanProduce)
            .filter(([color, count]) => count > 0)
            .map(([color, count]) => [color, 1])
    );
}


function preprocessRampCards(rampCards) {
        const simplifiedRampManaList = rampCards.flatMap(card => {
            const simplifiedColors = simplifyColorsCanProduce(card.ColorsCanProduce);
            const normalizedColors = normalizeObject(simplifiedColors);
            return Array(card.amount).fill(normalizedColors);
        });
        simplifiedRampMana.set(simplifiedRampManaList);
        console.log('Simplified Ramp Mana:', simplifiedRampManaList);
    }

//this preprocess is before I added normalizeObject step to ensure
//mana properties order matches between ramp and lands. need to confirm
//new logic does not mess with manapoolmeetsrequirements function


// function preprocessRampCards(rampCards) {
//     const simplifiedRampManaList = rampCards.flatMap(card => {
//         const simplifiedColors = simplifyColorsCanProduce(card.ColorsCanProduce);
//         return Array(card.amount).fill(simplifiedColors);
//     });
//     simplifiedRampMana.set(simplifiedRampManaList);
//     console.log('Simplified Ramp Mana:', simplifiedRampManaList);
// }








function prepareManaCardsForCalculation() {
    let preparedCards = [];

    // Add logic for custom cards
    customCards.forEach(card => {
        let cardEntry = { [card.title]: 1 };
        card.attributes.forEach(attr => {
            cardEntry[attr] = 1;
        });
        for (let i = 0; i < card.amount; i++) {
            preparedCards.push(cardEntry);
        }
    });

    // Existing logic for mana cards
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


    // Add logic for ramp cards
    rampCards.forEach(card => {
        for (let i = 0; i < card.amount; i++) {
            preparedCards.push(card);
        }
    });

    return preparedCards;
}


function logPreparedCards(type = 'full') {
    const preparedCards = prepareManaCardsForCalculation();
    console.log('Prepared Cards:', preparedCards);

    // Filter out entries with zero values
    const filteredManaRequirements = Object.entries(manaRequirements).reduce((acc, [key, value]) => {
        if (value > 0) acc[key] = value;
        return acc;
    }, {});
    console.log('Mana Requirements:', filteredManaRequirements);

    preprocessRampCards(rampCards); // Preprocess ramp cards

    simulationData.set({
        preparedCards: prepareManaCardsForCalculation(),
        manaRequirements: filteredManaRequirements,
        iterations: iterations
    });

    simulationType.set(type); // Set the simulation type
}


function handleInput(key, value) {
    console.log(`Input event for ${key}:`, value);
    // Convert input value to number, ensure NaN values are reverted to zero
    let numberValue = Number(value);
    manaRequirements[key] = isNaN(numberValue) ? 0 : numberValue;
}



function selectInput(event) {
    event.target.select(); // Selects all text in the input upon focus
}

</script>

<style>
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

  h3 {
    margin: 0;
    color: #0066e9;
    font-weight: 500;
    font-size: 16px;
  }

  p {
    margin: 0;
  }

  .mana-cards-container {
    display: flex;
    justify-content: flex-start;
    margin-top: 0.5rem;
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    
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



.land-group-parameters {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.5rem;
  gap: 10px;
}

.mana-requirements-container {
    display: flex;
    grid-template-columns: repeat(6, auto); /* Display inputs horizontally */
    column-gap: 12px;
    row-gap: 10px;
    padding: 10px;
    justify-content: start;
    flex-wrap: wrap;
  }

  .mana-requirement {
    display: flex;
    align-items: center;
  }

  .mana-requirement label {
    margin-right: 4px;
    display: flex;
    align-items: flex-end;
  }

  .mana-requirement input {
    width: 50px;
  }



.semi-bold {
  font-weight: 500;
}

.popover-content:first-child {
  margin-top: 0;
}

.popover-text-fixer {
  margin-bottom: 1rem;
}

.popover-content:last-child {
  margin-bottom: 0;
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

<div class="accordion {isHovering ? 'hovering' : ''}">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
   <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="accordion-item">
    <div class="accordion-title" 
      on:click={handleToggleAccordionClick}
      on:keydown={(event) => handleKeydown(event, 0)}
      on:mouseenter={() => isHovering = true}
      on:mouseleave={() => isHovering = false}
      tabindex="0"
      >
<h3 style="font-size:18px; display: flex; align-items: center; gap:4px">
    Monte Carlo Simulation
    &nbsp;
    <img src={WIcon} alt="Plains" class="mana-icon" />
    <img src={UIcon} alt="Swamp" class="mana-icon" />
    <img src={BIcon} alt="Island" class="mana-icon" />
    <img src={RIcon} alt="Mountain" class="mana-icon" />
    <img src={GIcon} alt="Forest" class="mana-icon" />
  </h3>
  {#if isOpen}
  <FontAwesomeIcon icon={faChevronUp} class="chevron-icon" />
{:else}
  <FontAwesomeIcon icon={faChevronDown} class="chevron-icon" />
{/if}    
</div>
      <div
      class="answer"
      transition:slide|local={{ duration: 250 }}
      style:height="{openItem === 0 ? 'auto' : '0'}"
       >
      <!-- Mana Cards and Add Button -->
      <p style="margin-top: 0.5rem;">Simulate the chance you'll get the colors you need in your hand or on the field. <span class="semi-bold">Probabilities from this section do not take into account cards from the above Hypergeometric Calculator.</span> To learn more, click the info button ->       
        <Popover bind:show={showPopover} placement="top">
        <button class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
          <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
        </button>
        <div slot="content">
          <p class="popover-content popover-text-fixer">This section uses a <a href='https://en.wikipedia.org/wiki/Monte_Carlo_method' target='_blank'>Monte Carlo simulation</a> method, which basically means we draw a theoretical deck thousands of times to estimate the probability of getting certain cards. This method is better suited for mana probabilities (compared to the top <a href='https://en.wikipedia.org/wiki/Hypergeometric_distribution' target='_blank'>hypergeometric</a> part of this tool) because it can take into account cards with multiple attributes (such as a land producing an island or a plains). This is done with a two-step process. 
            <p class="popover-content popover-text-fixer">First, we calculate all of the possible combinations of cards that can achieve your desired results. Then, the simulation draws the deck thousands of times, checking if any combination is achieved across each turn.</p>
          <p class="popover-content popover-text-fixer">My research has only come up with one other method to find this kind of probability - the inclusion exclusion principle. And that seemed hella hard to implement, so I went with this.</p>
        </div>
      </Popover>
    </p>




      <p style="margin-top: 0.5rem;"><strong>Step 1</strong> - Add all of the mana producing cards in your deck. Custom groups only work in hand simulations (see the custom groups (?) button for more details).</p>
      <div class="mana-cards-container">
        {#each manaCards as card (card.id)}
        <ManaCard
          bind:card={card} 
          on:remove={() => removeCard(card.id)}
        />
      {/each}
      </div>
      <div class="land-group-parameters">
        <button on:click={handleAddManaGroupClick}>Add Land Group</button>
        <div>Total land cards: <b>{totalAmount}</b></div>
    </div>


      <!-- Horizontal Rule for Separation -->
      <hr class="secondary-divider">


      <div class="mana-cards-container">
        {#each rampCards as card (card.id)}
          <RampCard
            bind:card={card}
            on:remove={() => removeRampCard(card.id)}
          />
        {/each}
      </div>


      <div class="land-group-parameters">
        <button on:click={handleAddRampGroupClick}>Add Ramp Group</button>
        <div>Total ramp cards: <b>{totalRampAmount}</b></div>      
      </div>

      <!-- Horizontal Rule for Separation -->
      <hr class="secondary-divider">


      <div class="mana-cards-container">
   {#each customCards as card (card.id)}
        <CustomCard
        bind:card={card}
        on:remove={() => removeCustomCard(card.id)}
        on:removeattribute={({ detail }) => updateCustomAttributeRequirements()}
        on:updateattribute={({ detail }) => handleAttributeUpdate(detail, card.id)}
        on:addattribute={({ detail }) => updateCustomAttributeRequirements()} 

    />          
    {/each}
    </div>
    <div class="land-group-parameters">
      <button on:click={handleAddCustomGroupClick}>Add Custom Group</button>
       <Popover bind:show={showPopover} placement="top">
          <button class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
          </button>
          <div slot="content">
            <p class="popover-content popover-text-fixer">A custom group allows you to mix in other cards with your mana-producing cards above, or just use this simulation in a sandbox way. For example, maybe you want to find the probability of getting certain colors and a ramp spell (the ramp spells would be a custom group). You can also add attributes to custom cards for more complex calculations that consider custom groups with specific or common abilities.</p>
            <p class="popover-content popover-text-fixer">In Step 2, you can select that you want a certain number of cards from a custom group, as well as a certain number of cards that include some attribute.</p>
          </div>
        </Popover>
        <div>Total custom cards: <b>{totalCustomAmount}</b></div> 
    </div>
    <p style="margin: 8px 8px 16px 0px;"><i>Custom cards can only be used for hand simulations.</i></p>

         <!-- Horizontal Rule for Separation -->
         <hr class="primary-divider">



      <!-- Mana Requirements Fields -->
      <p><strong>Step 2</strong> - Specify the amount of each mana, card, or attribute you would like. Note that this assumes a separate card for each mana/card/attribute.</p>
    <div class="mana-requirements-container">
      {#each Object.entries(manaRequirements) as [key, amount]}
        {#if activeManaTypes[key] || (customCards.length > 0 && customCards.some(card => card.title === key))}
          <div class="mana-requirement">
            <label for="{key.replace(/\s+/g, '_')}-requirement">
              {#if manaIcons[key]}
                <img src={key === 'ANY' ? getAnyIcon(amount) : manaIcons[key]} alt="{key} mana icon" class="mana-icon" />&nbsp;:
              {:else}
                {key}: <!-- This will include custom card titles as well -->
              {/if}
            </label>
            <input
            id="{key.replace(/\s+/g, '_')}-requirement"
            type="number"  
            min="0"
            value={manaRequirements[key]}
            on:input={e => handleInput(key, e.target.value)}
            on:focus="{selectInput}"
        />
        
          </div>
        {/if}
      {/each}
    



        {#each Array.from(uniqueAttributes) as attr}
        <div class="mana-requirement">
          <label for="custom-{attr.replace(/\s+/g, '_')}">{attr}: </label>
          <input
                id="custom-{attr.replace(/\s+/g, '_')}"
                type="number"
                min="0"
                value={customAttributeRequirements[attr]}
                on:input={e => updateCustomAttribute(attr, e.target.value)}
                on:focus="{selectInput}"
            />
        </div>
    {/each}
  </div>
    
             <!-- Horizontal Rule for Separation -->
             <hr class="primary-divider">



             <!-- Mana Requirements Fields -->
             <p><strong>Step 3</strong> - Run the simulation. You can add advanced mulligan logic too. </p>


      <div class="land-group-parameters">
      
        <button class="primary-btn" on:click={handleRunSimulationClick} disabled={!enableSimulationButton}>
          Run Field Simulation
        </button>  
 
        <button class="secondary-btn" on:click={handleRunHandSimulationClick} disabled={!enableSimulationButton}>
          Run Hand Simulation
       </button>

        <!-- I could not get this to work. need to somehow re-run the simulation or 
        createGroupCards. function                                            -->
        <!-- <button on:click={ClearSimulation}>Clear Simulation</button>  -->
      
        <div class="mana-requirement">
        <label for="iterations">Simulation iterations (caution):</label>
        <input style="width: 90px;" id="iterations" type="number" min="1" bind:value={iterations} 
        on:focus="{selectInput}"
        />
        <Popover bind:show={showPopover} placement="top">
          <button style="margin-left: 4px;" class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover}>
            <FontAwesomeIcon style="height: 1.2em; vertical-align: -0.155em; color:#0066e9;" icon={faQuestionCircle} />
          </button>
          <div slot="content">
            <p class="popover-content popover-text-fixer"><b>Caution - increasing this may crash your browser!</p>
            <p class="popover-content popover-text-fixer">This parameter changes the number of samples taken for this advanced probabilities section. More iterations will result in more accurate probabilities, but increases the calculation time. Consider increasing this in 1000-2000 increments to test how it impacts simulation time.</p>
          </div>
        </Popover>
      </div>
  </div>
  <SimulationMulligansAccordion/>
    </div>
  </div>
</div>

