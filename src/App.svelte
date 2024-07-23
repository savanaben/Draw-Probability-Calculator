<script>
    import GroupDefinition from './GroupDefinition.svelte';
    import Calculation from './Calculation.svelte';
    import Intro from './Intro.svelte';
    import FAQ from './FAQ.svelte';
    import SimulationModal from './SimulationModal.svelte';
    import { simulationRun } from './colorStore.js';
    import { initGA } from './analytics.js';

    let groups = [];
    let deckSize = 99; // Default deck size
    let InitialDrawSize = 7; // Default initial draw size
    let mulliganCount = 0;


    // Reactive statement to control scrolling
    $: {
        if ($simulationRun) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }


    initGA();  // This kicks off Google Analytics tracking


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
      answer: "<p>For the top half of this tool, <a href='https://en.wikipedia.org/wiki/Hypergeometric_distribution' target='_blank'>hypergeometric distribution</a> math is applied to calculate draw probabilities common to Magic and other card games.</p><p>The advanced mana and card attributes section applies a <a href='https://en.wikipedia.org/wiki/Monte_Carlo_method' target='_blank'>monte carlo method</a>, which essentially means simulating drawing a deck thousands of times to estimate probabilities.</p>"
      },
      { question: "How do you know this is accurate?", 
       answer: "<p>The top half of this tool (hypergeometric calculations) has been checked against others (<a href='https://deckulator.appspot.com/' target='_blank'>deckulator, </a> <a href='https://aetherhub.com/Apps/HyperGeometric' target='_blank'>aetherhub,</a><a href='https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html' target='_blank'> mtg combo calc,</a><a href='https://deckstats.net/' target='_blank'> deckstats</a>) for accuracy.</p><p>The monte carlo method (advanced mana and attribute probabilities) is more experimental. I am able to confirm some of the logic by setting card groups to only include one attribute (such as a group that only produces one type of mana). This setup is calculable by hypergeometric math, and you can see that the probabilities from the monte caro simulation align (accounting for monte carlo simulations not being perfectly accurate and number-of-iterations based). What hypergeometric math cannot confirm is calculations involving multiple attributes per group. I have no reason to believe this is inaccurate, but I am unaware of a tool (or mathematical method) that I can use to confirm my logic.</p><p>For the mulligan aspect of this tool, I have confirmed my logic against Michael Moore's manual calculations <a href='https://deckulator.blogspot.com/2022/07/mulligans-and-probability-redrawing.html' target='_blank'>here</a>.</p>"

      },
      { question: "I'd like to support this or give feedback.", 
       answer: `<p>There's a lot of ways to help!</p> 
       

       

       <p><b>If you're a mathy person,</b> you could help me confirm the mulligan and monte carlo calculations in some specific situations. See the github <a href='https://github.com/savanaben/Draw-Probability-Calculator?tab=readme-ov-file#readme' target='_blank'>readme</a> for more info, or email me (<a href="#" class="copy-email" data-email="ben.c.gross@gmail.com">click to copy ben.c.gross@gmail.com</a>).</p> <p><b>If you're a developer,</b> feel free to check out the <a href='https://github.com/savanaben/Draw-Probability-Calculator?tab=readme-ov-file#readme' target='_blank'>readme</a> project and propose improvements/pull requests. The readme has a list of areas of improvement/known issues.</p> <p><b>If you have a great idea to make this more useful or usable,</b> send me an email (<a href="#" class="copy-email" data-email="ben.c.gross@gmail.com">click to copy ben.c.gross@gmail.com</a>). This is a passion project and I'd love to extend or add functionality that helps people build their deck.</p>
       <p>Finally, if you'd like to buy me half a coffee, I appreciate it! <a href='https://venmo.com/u/Benjamin-Gross-10' target='_blank'>(Open Venmo in web)</a> <a href='venmo://paycharge?txn=pay&recipients=Benjamin-Gross-10&amount=2.5&note=half-a-coffee' target='_blank'>(Open Venmo in mobile app)</a>.</p>
       `
      },
      { question: "Thanks and credits", 
       answer: "<p>Greatest thanks to Michael Moore and their <a href='https://deckulator.appspot.com/' target='_blank'>deckulator</a> app, which helped confirm logic.</p> <p>Thanks to <a href='https://www.slightlymagic.net/forum/viewtopic.php?f=15&t=4430' target='_blank'>Goblin Hero</a> for their mana symbol svgs.</p><p>If you want to check out my other work, feel free to browse <a href='https://savanaben.github.io/folio/index.html' target='_blank'>my website</a>.</p>"
      },
    ];




</script>

<main class="parameters">
    <SimulationModal />
    <Intro />
    <div class="content">
        <div class="left-column">
            <GroupDefinition on:updateGroups={handleGroupUpdate} />
        </div>
        <div class="right-column">
            <Calculation {groups} {deckSize} {InitialDrawSize} {mulliganCount} />
        </div>
    </div>
	<FAQ {faqs} />
</main>

<!-- Your styles here -->
<style>
.parameters {
	max-width: 100rem;
	margin: auto; /* Centers the container */
	padding-bottom: 2.5rem; /* Centers the container */
}


.content {
    display: grid;
    grid-template-columns: 60% 40%;
    column-gap: 2.5rem;
    justify-content: center;
    margin: 0rem 3rem;
}

.left-column {
    overflow-y: auto;
}

.right-column {
    position: sticky;
    top: 0;
    max-height: 100vh;
    overflow-y: auto;
}

@media (max-width: 1100px) {
    .content {
        grid-template-columns: 1fr;
        margin: auto;
    }

    .right-column {
        position: static;
        max-height: none;
    }
}

</style>