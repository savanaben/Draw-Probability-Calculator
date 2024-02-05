<script>
    import { slide } from 'svelte/transition';
  
    let faqs = [
      { question: "How does this work?", 
      answer: "This tool uses <a href='https://en.wikipedia.org/wiki/Hypergeometric_distribution' target='_blank'>hypergeometric distribution</a> math to calculate draw probabilities common to Magic and other card games."
      },
      { question: "How do I know this is accurate?", 
       answer: "This tool has been checked against others (<a href='https://deckulator.appspot.com/' target='_blank'>deckulator, </a> <a href='https://aetherhub.com/Apps/HyperGeometric' target='_blank'>aetherhub,</a><a href='https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html' target='_blank'> mtg combo calc</a>) for accuracy. NOTE that the mulligan feature is still experimental and needs refinement."

      },
      { question: "I'd like to support this or give feedback.", 
       answer: "There's a lot of ways to help! <p><b>If you're a mathy person,</b> you could help me figure out mulligan calculations by providing a rough framework of how the calculation would work. See the github <a href='https://github.com/savanaben/svelte-mtg-calculator?tab=readme-ov-file#svelte-mtg-calculator' target='_blank'>readme</a> for more info.</p> <p><b>If you're a developer,</b> feel free to check out the <a href='https://github.com/savanaben/svelte-mtg-calculator?tab=readme-ov-file#svelte-mtg-calculator' target='_blank'>readme</a> project and propose improvements. The readme has a list of areas of improvement/known issues.</p> <p>Finally, <b>If you just have a great idea to make this more useful,</b> send me an email (ben.c.gross@gmail.com). This is a passion project and I'd love to extend or add functionality that helps people build their deck.</p> "
      },
    ];
  
    let openItem = null;
  
    function toggleItem(index) {
      openItem = openItem === index ? null : index;
    }
  </script>
  
  <style>
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
    color: rgb(23, 23, 185);
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
  
  <div class="accordion">
    {#each faqs as {question, answer}, index}
      <div class="accordion-item" on:click={() => toggleItem(index)}>
        <h3>{question}</h3>
        {#if openItem === index}
          <div class="answer" transition:slide|local={{duration: 250}}>
            {@html answer} <!-- Updated this line -->
          </div>
        {/if}
      </div>
    {/each}
  </div>
  