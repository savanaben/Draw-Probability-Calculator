<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    export let triggerElementId = ''; // ID of the element that triggers the popup
    export let message = 'Default message';
    export let show = false;
  
    let popupElement;
  
    const calculatePosition = () => {
      const triggerElement = document.getElementById(triggerElementId);
      if (triggerElement && popupElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const popupRect = popupElement.getBoundingClientRect();
        // Position above the trigger element, centered
        const top = triggerRect.top - popupRect.height - 5; // 5px above for a small gap
        const left = triggerRect.left + (triggerRect.width / 2) - (popupRect.width / 2);
        return { top, left };
      }
      return { top: '50%', left: '50%' }; // Fallback position
    };
  
    let style = `position: fixed;`;
  
    onMount(() => {
      if (show) {
        const { top, left } = calculatePosition();
        style += `top: ${top}px; left: ${left}px;`;
      }
    });
  
    $: if (show) {
      const { top, left } = calculatePosition();
      style = `position: fixed; top: ${top}px; left: ${left}px;`;
    }
  </script>
  
  {#if show}
  <div bind:this={popupElement} class="popup" transition:fly={{ y: -10, duration: 200 }} style={style}>
    <p>{message}</p>
    <button on:click={() => show = false}>Close</button>
  </div>
  {/if}
  
  <style>
    .popup {
      padding: 1rem;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000; /* Ensure it's above other content */
      transform: translateX(-50%);
    }
    p {
      margin: 0;
      padding-bottom: 1rem;
    }
  </style>
  