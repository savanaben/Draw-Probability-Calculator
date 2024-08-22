<script>
    import GroupDefinition from './GroupDefinition.svelte';
    import Calculation from './Calculation.svelte';
    import Intro from './Intro.svelte';
    import FAQ from './FAQ.svelte';
    import SimulationModal from './SimulationModal.svelte';
    import { simulationRun } from './colorStore.js';
    import { initGA } from './analytics.js';
    import FlowDiagram from './FlowDiagram.svelte';


    let groups = [];
    let deckSize = 99; // Default deck size
    let InitialDrawSize = 7; // Default initial draw size
    let mulliganCount = 0;



    const boxes = [
        { title: 'Initialize and prepare simulation', body: 'Prepare the deck based on the cards added. Pre-calculate all possible combinations of ramp, land, and custom cards that can meet your requirements.' },
        { title: 'Perform mulligans', body: 'Draw initial hand. Perform mulligans based on the user-set parameters.' },
        { title: 'Draw card(s) for turn', body: 'Draw cards based on the per-turn draw parameters. Default this is draw 1 card per turn.' },
        {
            title: 'Play land',
            body: 'Play a land based on the following priority order.',
            nestedBoxes: [
                { title: 'Priority 1', body: 'Play a land that can produce the color(s) you need to cast ramp spells.' },
                { title: 'Priority 2', body: 'Play a land that can produce a color you can\'t already produce with ramp or lands.' },
                { title: 'Priority 3', body: 'Play a land that can produce the most colors.' },
                { title: 'Priority 4', body: 'Play a land this color priority order: G ➜ W ➜ U ➜ B ➜ R.' }
            ]
        },
        { title: 'Check mana pool against requirements', body: 'Add mana from lands and ramp cards to the mana pool. Check if the mana pool meets the mana requirements.' },
        {
            title: `Play ramp cards*`,
            body: 'Play ramp cards based on the following priorities.',
            nestedBoxes: [
                { title: 'Priority 1', body: 'Play ramp cards with the lowest converted mana cost (cmc) and that can add mana to your mana pool the turn they are played.**' },
                { title: 'Priority 2', body: 'Play ramp cards with the lowest cmc.' },
                { title: 'Priority 3', body: 'Play ramp cards that can add mana to your mana pool the turn they are played.' },
                { title: 'Priority 4', body: 'Play any other ramp cards.' }
            ]
        },
        { title: 'Check mana pool against requirements', body: 'Add mana from newly played ramp cards (if applicable) to the mana pool. Again check if the mana pool meets the mana requirements.' },
        { title: 'Move on to the next turn or the next iteration', body: 'If you met the mana requirements in either check, the simulation notes what turn it is and marks this as a success. If you do not meet the mana requirements, the simulation moves on to the next turn.' },
        { title: 'Repeat the above process for each iteration', body: 'An iteration will end either when you meet the requirements or the "Number of Turns" global parameter (don\'t simulate more turns than needed).' }
    ];

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
        {
            question: "How do these tools generally work?",
            answerParts: [
                { html: "<p>In the Hypergeometric Calculator <a href='https://en.wikipedia.org/wiki/Hypergeometric_distribution' target='_blank'>fancy math</a> is applied to calculate draw probabilities common to Magic and other card games.</p><p>The Monte Carlo Simulation applies more <a href='https://en.wikipedia.org/wiki/Monte_Carlo_method' target='_blank'>brute force logic</a>, which essentially means simulating drawing a deck thousands of times to estimate probabilities.</p>" }
            ]
        },
        {
            question: "How does the monte carlo simulation work?",
            answerParts: [
                { html: '<p>Playing lands and ramp spells involves a lot of complex decision-making. The following method and priorities attempt to simulate optimal play in the most common circumstances. This flow diagram shows the more complex "Field Simulation" logic. Hand Simulations are simpler - ramp is not played and instead counts as mana.</p>' },
                { component: FlowDiagram, props: { boxes } },
                { html: `<p id="added-details">*Currently, playing ramp cards acts as though all ramp were a mana rock. Each turn, the appropriate color and amount of mana is added to the mana pool from the ramp card. This is not entirely accurate as it does not account for ramp that fetches lands, like rampant growth. This type of ramp would remove a land/lands from your library and change subsequent turn probabilities (due to a thinner deck and less lands). This is high on the list to account for in future updates.</p><p>**Determining what ramp to play first is challenging. The current priority is on playing the cheapest ramp that can produce mana immediately. A secondary priority I should add someday should factor in the colors you need (play ramp that can produce a new color), though this get's complex.</p>`}
            ]
        },
        {
            question: "How do you know these tools are accurate?",
            answerParts: [
                { html: `<p>The top half of this tool (hypergeometric calculations) has been checked against others (<a href='https://deckulator.appspot.com/' target='_blank'>deckulator, </a> <a href='https://aetherhub.com/Apps/HyperGeometric' target='_blank'>aetherhub,</a><a href='https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html' target='_blank'> mtg combo calc,</a><a href='https://deckstats.net/' target='_blank'> deckstats</a>) for accuracy.</p><p>The monte carlo simulation is more experimental. I am able to confirm some of the logic by setting mana or ramp to only include one attribute (such as a land that can only produce one type of mana). This setup is calculable by hypergeometric math, and you can see that the probabilities from the monte carlo simulation align (accounting for monte carlo simulations not being perfectly accurate and number-of-iterations based). What hypergeometric math cannot confirm is calculations involving multiple attributes per card (a land that can make B,R,W for example).</p><p>I have checked my logic against <a href='https://mtgoncurve.com/' target='_blank'>mtgoncurve</a> and confirmed that core color-based calculations align ("P-play", or unconditional probabilities). Though I do notice some difference (~1%) when adding mulligan logic, which I have not identified the source of yet.</p><p>I do not know of a tool that can confirm the advanced ramp logic, but I have extensively logged all steps and walked through logic to manually confirm as much as possible. If you are interested, you can open the browser console and see the calculation outputs (this will slow calculation time significantly!)</p><p>For the mulligan aspect of both tools, I have confirmed my logic against Michael Moore's manual calculations for at least one test-case <a href='https://deckulator.blogspot.com/2022/07/mulligans-and-probability-redrawing.html' target='_blank'>here</a>.</p>` }
            ]
        },
        {
            question: "I'd like to support this or give feedback.",
            answerParts: [
                { html: `<p>There's a lot of ways to help!</p>
                <p><b>If you're a mathy person,</b> you could help me confirm the mulligan and monte carlo calculations in some specific situations. See the github <a href='https://github.com/savanaben/Draw-Probability-Calculator?tab=readme-ov-file#readme' target='_blank'>readme</a> for more info, or email me (<a href="#" class="copy-email" data-email="ben.c.gross@gmail.com">click to copy ben.c.gross@gmail.com</a>).</p> <p><b>If you're a developer,</b> feel free to check out the <a href='https://github.com/savanaben/Draw-Probability-Calculator?tab=readme-ov-file#readme' target='_blank'>readme</a> project and propose improvements/pull requests. The readme has a list of areas of improvement/known issues.</p> <p><b>If you have a great idea to make this more useful or usable,</b> send me an email (<a href="#" class="copy-email" data-email="ben.c.gross@gmail.com">click to copy ben.c.gross@gmail.com</a>). This is a passion project and I'd love to extend or add functionality that helps people build their deck.</p>
                <p>Finally, if you'd like to buy me half a coffee, I appreciate it! <a href='https://venmo.com/u/Benjamin-Gross-10' target='_blank'>(Open Venmo in web)</a> <a href='venmo://paycharge?txn=pay&recipients=Benjamin-Gross-10&amount=2.5&note=half-a-coffee' target='_blank'>(Open Venmo in mobile app)</a>.</p>` }
            ]
        },
        {
            question: "Thanks and credits",
            answerParts: [
                { html: "<p>Greatest thanks to Michael Moore and their <a href='https://deckulator.appspot.com/' target='_blank'>deckulator</a> app, which helped confirm logic.</p> <p>Thanks to <a href='https://www.slightlymagic.net/forum/viewtopic.php?f=15&t=4430' target='_blank'>Goblin Hero</a> for their mana symbol svgs.</p><p>If you want to check out my other work, feel free to browse <a href='https://savanaben.github.io/folio/index.html' target='_blank'>my website</a>.</p>" }
            ]
        }
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
	<FAQ id="monte-carlo-faq" {faqs} />
</main>

<!-- Your styles here -->
<style>
.parameters {
	max-width: 104rem;
	margin: auto; /* Centers the container */
	padding-bottom: 2.5rem; /* Centers the container */
}


.content {
    display: grid;
    grid-template-columns: 59% 39%;
    column-gap: 2%;
    justify-content: center;
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