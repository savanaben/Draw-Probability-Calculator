<script>
  import { slide } from 'svelte/transition';

  let openItem = null;

  function toggleItem(index) {
      openItem = openItem === index ? null : index;
  }

    // Function to handle keydown events on accordion items
    function handleKeydown(event, index) {
    if (event.key === 'Enter') {
      toggleItem(index);
    }
  }

  export let faqs = []; // Accept faqs as a prop
  export let customClass = ''; // Accept class as a prop

</script>
  
  <style>

   .reduced-padding {
    padding: 0em !important;
   }

    .accordion {
     max-width: 55em;
      padding: 1em;
    }
    .accordion-item {
    cursor: pointer;
    padding: 1rem; /* Adjust as needed */
    border-bottom: solid;
    border-color: rgb(124, 124, 124);
    border-width: 1px;
  }

  .answer {
    overflow: hidden;
    padding: .5rem; /* Add padding to replace margin for smoother transition */
  }

h3 {
    margin-top: 0; /* Remove margin-top */
    margin-bottom: 0; /* Remove margin-bottom and control spacing with padding */ 
    color: #0066e9;
}

  p {
    margin-top: 0; /* Remove margin-top */
    margin-bottom: 0; /* Remove margin-bottom and control spacing with padding */
  }
    
    /* Last item should not have a border bottom */
    .accordion-item:last-child {
      border-bottom: none;
    }
  </style>
  
  <div class={`accordion ${customClass}`}>
    {#each faqs as {question, answer}, index}
      <div tabindex="0" class="accordion-item" on:click={() => toggleItem(index)} on:keydown={(event) => handleKeydown(event, index)}>
        <h3>{question}</h3>
        {#if openItem === index}
          <div class="answer" transition:slide|local={{duration: 250}}>
            {@html answer}
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  