<script>
    import { slide } from 'svelte/transition';
  
    let faqs = [
      { question: "How do I use this?", 
       answer: "Svelte is a radical new approach to building user interfaces. Unlike traditional frameworks, Svelte shifts much of the work to compile time, producing highly efficient code that runs directly in the browser." },
      { question: "How do I know this is accurate?", 
       answer: "You might choose Svelte for its simplicity, speed, and ease of learning. It compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast." },
      { question: "I'd like to support this or give feedback.", 
       answer: "Svelte differs in that it doesn't use a virtual DOM. It compiles your components down to efficient imperative code that directly updates the DOM when the state of the app changes." }
    ];
  
    let openItem = null;
  
    function toggleItem(index) {
      openItem = openItem === index ? null : index;
    }
  </script>
  
  <style>
    .accordion {

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
            <p>{answer}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  