<script>
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let openItem = null;




  function toggleItem(index) {
      openItem = openItem === index ? null : index;
  }

  function handleKeydown(event, index) {
        if (event.key === 'Enter') {
            handleAccordionItemClick(event, index); // Reuse the item click handler for keyboard Enter key
        }
    }

  export let faqs = []; // Accept faqs as a prop
  export let customClass = ''; // Accept class as a prop

  let copySuccessMessage = ''; // Holds the message shown when copying is successful

  function handleAccordionItemClick(event, index) {
        const linkElement = event.target.closest('a');
        if (linkElement && linkElement.classList.contains('copy-email')) {
            event.preventDefault(); // Prevent the default link action
            event.stopPropagation(); // Stop the click from bubbling up
            copyEmail(linkElement.dataset.email);
        } else if (linkElement) {
            // Allow default link behavior for all other links, don't toggle accordion
            return;
        } else {
            toggleItem(index);
        }
    }

    function copyEmail(email) {
        navigator.clipboard.writeText(email).then(() => {
            copySuccessMessage = 'Email address copied to clipboard!';
            setTimeout(() => { copySuccessMessage = ''; }, 4500); // Clear the message after 3 seconds
        }).catch(err => {
            console.error('Failed to copy email: ', err);
            copySuccessMessage = 'Failed to copy email!';
            setTimeout(() => { copySuccessMessage = ''; }, 4500); // Clear the message after 3 seconds
        });
    }




</script>
  
  <style>

   .reduced-padding {
    padding: 0em !important;
   }

    .accordion {
     max-width: 55em;
      padding: 1em;
    }

      /* Media query for mobile devices */
@media (max-width: 480px) {
  .accordion {
    padding: 1rem 0; /* Adjusted padding for mobile */
  }
}

.accordion-item:hover {
  background-color: white !important;
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


  p {
    margin-top: 0; /* Remove margin-top */
    margin-bottom: 0; /* Remove margin-bottom and control spacing with padding */
  }
    
    /* Last item should not have a border bottom */
    .accordion-item:last-child {
      border-bottom: none;
    }


    .copy-success {
    color: rgb(0, 100, 0); 
    font-size: 1em; 
    text-align: center;
    font-weight: bold;
    margin-top: 10px; 
    padding: 0.5rem;
    background-color: rgb(212, 255, 214);
    border-radius: 0.5rem;
}

  </style>
  


  <div class="accordion">
    {#each faqs as {question, answer}, index}
        <div class="accordion-item"
        style="background-color: {openItem === index ? 'white' : 'transparent'};"
        tabindex="0" 
             on:click={(event) => handleAccordionItemClick(event, index)}
             on:keydown={(event) => handleKeydown(event, index)}>
            <h3>{question}</h3>
            {#if openItem === index}
                <div class="answer" transition:slide|local={{duration: 250}}>
                    {@html answer}
                    {#if copySuccessMessage}
                        <p class="copy-success">{copySuccessMessage}</p>
                    {/if}
                </div>
            {/if}
        </div>
    {/each}
</div>


  
  