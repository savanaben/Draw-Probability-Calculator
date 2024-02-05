<script>
    import GroupDefinition from './GroupDefinition.svelte';
    import Calculation from './Calculation.svelte';
    import Intro from './Intro.svelte';
	import FAQ from './FAQ.svelte';



    let groups = [];
	let deckSize = 99; // Default deck size
	let mulliganCount = 0;


    function handleGroupUpdate(event) {
        groups = event.detail.groups;
        deckSize = event.detail.deckSize;
		mulliganCount = event.detail.mulliganCount;
    }
</script>

<main class="parameters">
	<Intro />
    <GroupDefinition on:updateGroups={handleGroupUpdate} />
    <Calculation {groups} {deckSize} {mulliganCount} />
	<FAQ />
</main>

<!-- Your styles here -->
<style>
.parameters {
	max-width: 60rem;
	margin: auto; /* Centers the container */
	padding-bottom: 1rem; /* Centers the container */
}


</style>