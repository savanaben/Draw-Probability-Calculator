<script>
    import { createPopperActions } from 'svelte-popperjs';
    import { createPopper } from '@popperjs/core';
    import { writable } from 'svelte/store';
  
    export let placement = 'top';
    let show = writable(false); // Use a writable store for show
  
    const [popperRef, popperContent, getPopperInstance] = createPopperActions({
      placement,
      modifiers: [
        { name: 'offset', options: { offset: [0, 8] } },
        { name: 'flip', options: { fallbackPlacements: ['top', 'bottom', 'right', 'left'] } },
        { name: 'preventOverflow', options: { boundary: 'clippingParents' } },
      ],
    });
  
    // clickOutside action
    function clickOutside(node) {
      const handleClick = event => {
        if (!node.contains(event.target)) {
          show.set(false); // Close the popover using .set()
        }
      };
  
      document.addEventListener('mousedown', handleClick);
  
      return {
        destroy() {
          document.removeEventListener('mousedown', handleClick);
        }
      };
    }
    
    // Function to toggle popover visibility
    function togglePopover() {
      show.update(current => !current); // Use .update() for toggling
    }
  </script>
  
  <div class="popover-button-container" use:popperRef on:click={togglePopover}>
    <slot name="trigger"></slot>
  </div>
  
  {#if $show} <!-- Use the $ syntax to subscribe to the store -->
    <div use:popperContent use:clickOutside class="popover-content">
      <slot name="content"></slot>
    </div>
  {/if}
  
  <style>
    .popover-content {
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 16px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 100;
      font-weight: 400;
      max-width: 400px;
      /* Add more styles as needed */
    }
  
    .popover-button-container {
        display: inline-block;
    }
  </style>
  