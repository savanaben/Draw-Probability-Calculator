<script>
  import { createPopperActions } from 'svelte-popperjs';
  import { writable, get } from 'svelte/store';
  import { activePopover, getNextUniqueId } from './colorStore.js';

  export let placement = 'top';
  let show = writable(false);
  const componentId = getNextUniqueId(); // Generates a unique ID for each popover instance

  console.log(`Popover initialized with componentId: ${componentId}`);


  const [popperRef, popperContent, getPopperInstance] = createPopperActions({
    placement,
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'flip', options: { fallbackPlacements: ['top', 'bottom', 'right', 'left'] } },
      { name: 'preventOverflow', options: { boundary: 'clippingParents' } },
    ],
  });

  // Reactive statement to close this popover if it's not the active one
  $: if ($activePopover !== componentId && get(show)) {
    console.log(`Closing popover with componentId: ${componentId} because activePopover is: ${$activePopover}`);
    show.set(false);
  }

  function togglePopover(event) {
    event.stopPropagation(); // Prevent click outside logic from triggering
    if (!get(show)) {
      console.log(`Opening popover with componentId: ${componentId}`);

      activePopover.set(componentId); // Set this popover as the active one
      show.set(true);
    } else {
      console.log(`Closing popover with componentId: ${componentId}`);

      activePopover.set(null); // Clear the active popover if this popover is being closed
      show.set(false);
    }
  }

  function handleMousedown(event) {
    event.stopPropagation(); // Prevent click outside logic from triggering
    // This function might not be necessary if togglePopover is handling the logic
  }

  // Function to close the popover when focus moves away from the button
  // Consider if you need this based on your UX requirements
  function handleBlur(event) {
    show.set(false); // Close the popover
  }

  function clickOutside(node) {
    const handleClick = event => {
      if (!node.contains(event.target)) {
        show.set(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return {
      destroy() {
        document.removeEventListener('mousedown', handleClick);
      }
    };
  }

  // Adjust handleKeydown to ensure it's only for Enter key and stops propagation
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      event.stopPropagation(); // Prevent any potential bubbling issues
      // Toggle logic might need to be adjusted based on how you want Enter to behave
      togglePopover(event);
    }
  }
</script>

<div
  class="popover-button-container"
  aria-label="More information"
  use:popperRef
  on:mousedown={handleMousedown} 
  on:click={togglePopover} 
  on:keydown={handleKeydown}
  on:blur={handleBlur}
  tabindex="0"
>
  <slot name="trigger"></slot>
</div>

{#if $show}
  <div use:popperContent use:clickOutside class="popover-content">
    <slot name="content"></slot>
  </div>
{/if}

<style>
  .popover-content {
    background-color: white;
    border: 1px solid #c8c8c8;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 100;
    font-weight: 400;
    max-width: 450px;
  }

  .popover-button-container {
    display: inline-block;
  }
</style>