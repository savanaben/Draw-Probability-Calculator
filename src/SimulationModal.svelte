<!-- SimulationModal.svelte -->
<script>
  import { afterUpdate } from 'svelte';
  import { simulationRun, cancelSimulation, neededCombinationsCount, simulationProgress, combinationProgress } from './colorStore.js';

  let cancelButton;

  // Reactive statement to handle simulation run state changes
  $: if ($simulationRun) {

      // Reset progress bars when simulation starts
        combinationProgress.set(0);
    // Use afterUpdate to ensure DOM updates have been processed
    afterUpdate(() => {
      // Check if the cancelButton is rendered and focusable
      if (cancelButton) {
        cancelButton.focus();
      }
    });
  }


  function handleCancel() {
    cancelSimulation.set(true);
}

function formatCount(count) {
    return count === null ? '(loading...)' : count.toLocaleString();
  }



</script>



{#if $simulationRun}
<div class="modal">
    <div class="modal-content">
        <h2>Simulation in Progress...</h2>
        <p><i>Your desired cards can be drawn through <strong>{formatCount($neededCombinationsCount)}&nbsp;</strong>combination(s).</i></p>
        <p><i>If this is taking too long, you can try decreasing the iteration value. This will reduce probability accuracy. 5000 iterations provides results to within about 0.5% - 1.5% accuracy.</i></p>
        <p>Calculate combinations:</p>
        <progress class="progress-bar" value="{$combinationProgress}" max="100"> {$combinationProgress}% </progress>
        <p>Simulate draws and turns:</p>
        <progress class="progress-bar" value="{$simulationProgress}" max="100"> {$simulationProgress}% </progress>
        <button on:click={handleCancel} bind:this={cancelButton}>Cancel Simulation</button>
    </div>
</div>
{/if}


<style>
    p {
      margin-bottom: 0px;
    }
    
.progress-bar {
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-width: 30rem;
        margin: 1rem;
    }

    progress {
        width: 100%;
        margin: 10px 0 20px 0px;
        height: 30px;
    }

    h2 {
        margin-top: 0;
    }


    button {
        margin: 0;
        color: #0066e9;
        padding: 6px 8px 6px 8px;
    }
</style>
