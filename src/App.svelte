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

    let faqs = [
      { question: "How does this work?", 
      answer: "<p>This tool uses <a href='https://en.wikipedia.org/wiki/Hypergeometric_distribution' target='_blank'>hypergeometric distribution</a> math to calculate draw probabilities common to Magic and other card games.</p>"
      },
      { question: "How do you know this is accurate?", 
       answer: "<p>This tool has been checked against others (<a href='https://deckulator.appspot.com/' target='_blank'>deckulator, </a> <a href='https://aetherhub.com/Apps/HyperGeometric' target='_blank'>aetherhub,</a><a href='https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html' target='_blank'> mtg combo calc,</a><a href='https://deckstats.net/' target='_blank'> deckstats</a>) for accuracy.</p><p>NOTE that the mulligan feature is experimental and needs mathematical confirmation.</p>"

      },
      { question: "I'd like to support this or give feedback.", 
       answer: "<p>There's a lot of ways to help!</p> <p><b>If you're a mathy person,</b> you could help me confirm the mulligan calculations in some specific situations. See the github <a href='https://github.com/savanaben/Draw-Probability-Calculator?tab=readme-ov-file#readme' target='_blank'>readme</a> for more info, or email me (ben.c.gross@gmail.com).</p> <p><b>If you're a developer,</b> feel free to check out the <a href='https://github.com/savanaben/Draw-Probability-Calculator?tab=readme-ov-file#readme' target='_blank'>readme</a> project and propose improvements/pull requests. The readme has a list of areas of improvement/known issues.</p> <p>Finally, <b>if you just have a great idea to make this more useful,</b> send me an email (ben.c.gross@gmail.com). This is a passion project and I'd love to extend or add functionality that helps people build their deck.</p>"
      },
    ];


</script>

<main class="parameters">
	<Intro />
    <GroupDefinition on:updateGroups={handleGroupUpdate} />
    <Calculation {groups} {deckSize} {InitialDrawSize} {mulliganCount} />
	<FAQ {faqs} />
</main>

<!-- Your styles here -->
<style>
.parameters {
	max-width: 60rem;
	margin: auto; /* Centers the container */
	padding-bottom: 2.5rem; /* Centers the container */
}


</style>