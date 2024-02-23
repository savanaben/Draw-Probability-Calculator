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

  function togglePopover() {
    show.update(current => !current);
  }

  // New function to handle keydown events
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      togglePopover();
    }
  }
</script>

<div
  class="popover-button-container"
  use:popperRef
  on:click={togglePopover}
  on:keydown={handleKeydown}
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
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 100;
    font-weight: 400;
    max-width: 400px;
  }

  .popover-button-container {
    display: inline-block;
  }

</style>
