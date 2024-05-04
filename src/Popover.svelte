<script>
  import { createPopperActions } from 'svelte-popperjs';
  import { writable } from 'svelte/store';

  export let placement = 'top';
  let show = writable(false);

  const [popperRef, popperContent, getPopperInstance] = createPopperActions({
    placement,
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'flip', options: { fallbackPlacements: ['top', 'bottom', 'right', 'left'] } },
      { name: 'preventOverflow', options: { boundary: 'clippingParents' } },
    ],
  });

  // Function to close the popover when focus moves away from the button
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

  // Adjust togglePopover to only stop propagation
  function togglePopover(event) {
    event.stopPropagation(); // Prevent click outside logic from triggering
    // Do not toggle here; let mousedown handle it
  }

  // Use mousedown to toggle the popover
  function handleMousedown(event) {
    event.stopPropagation(); // Still stop propagation to prevent click outside logic
    show.update(current => !current);
  }

  // Adjust handleKeydown to ensure it's only for Enter key and stops propagation
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      event.stopPropagation(); // Prevent any potential bubbling issues
      show.update(current => !current);
    }
  }
</script>

<div
class="popover-button-container"
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
