<!-- SimulationModal.svelte -->
<script>
  import { simulationRun, cancelSimulation, neededCombinationsCount, simulationProgress } from './colorStore.js';


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
        <p><i>Simulations with large amounts of cards, desired cards, or possible combinations can be slower to start.</i></p>
        <p><i>Your desired cards can be drawn through <strong>{formatCount($neededCombinationsCount)}&nbsp;</strong>combination(s).</i></p>
        <p><i>If it's taking too long, you can try decreasing the iteration value. This will reduce probability accuracy.</i></p>
        <progress value="{$simulationProgress}" max="100"> {$simulationProgress}% </progress>
        <button on:click={handleCancel}>Cancel Simulation</button>
    </div>
</div>
{/if}


<style>
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
