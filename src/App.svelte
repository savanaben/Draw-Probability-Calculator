<script>
    import GroupDefinition from './GroupDefinition.svelte';
    import Calculation from './Calculation.svelte';

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
    <GroupDefinition on:updateGroups={handleGroupUpdate} />
    <Calculation {groups} {deckSize} {mulliganCount} />
	<p>*You can link up to 4 categories by assigning them the same name (name text must match).</p>
	<p>**WARNING - Mulligan feature is experimental. Mulligan on turn 0 factors in calculations and such, while mulligans on turn 1, turn 2, etc. simply add the increased probability of getting the desired card from turn 0. I am sure this is not an accurate method but it's the best I could think of for now.</p>

</main>

<!-- Your styles here -->
<style>
.parameters {
	max-width: 55rem;
	margin: auto; /* Centers the container */
	padding-bottom: 1rem; /* Centers the container */
}
</style>