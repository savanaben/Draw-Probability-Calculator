<script>
    import GroupDefinition from './GroupDefinition.svelte';
    import Calculation from './Calculation.svelte';

    let groups = [];

    function handleGroupUpdate(event) {
        groups = event.detail; // Extracting group data from event detail
    }
</script>

<main>
    <GroupDefinition on:updateGroups={handleGroupUpdate} />
    <Calculation {groups} />
</main>

<!-- Your styles here -->
