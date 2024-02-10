<script>
    import GroupDefinition from './GroupDefinition.svelte';
    import Calculation from './Calculation.svelte';
    import Intro from './Intro.svelte';
    import FAQ from './FAQ.svelte';

    let groups = [];
    let deckSize = 99; // Default deck size
    let InitialDrawSize = 7; // Default initial draw size
    let mulliganCount = 0;

    function handleGroupUpdate(event) {
        groups = event.detail.groups;
        deckSize = event.detail.deckSize;
        InitialDrawSize = event.detail.InitialDrawSize;
        mulliganCount = event.detail.mulliganCount;
        console.log('handleGroupUpdate - InitialDrawSize:', InitialDrawSize); // Log when handleGroupUpdate is called
    }

    // Reactive statement to log InitialDrawSize whenever it changes
    $: if (InitialDrawSize !== undefined) {
        console.log('Reactive - InitialDrawSize:', InitialDrawSize);
    }
</script>

<main class="parameters">
	<Intro />
    <GroupDefinition on:updateGroups={handleGroupUpdate} />
    <Calculation {groups} {deckSize} {InitialDrawSize} {mulliganCount} />
	<FAQ />
</main>

<!-- Your styles here -->
<style>
.parameters {
	max-width: 60rem;
	margin: auto; /* Centers the container */
	padding-bottom: 2.5rem; /* Centers the container */
}


</style>