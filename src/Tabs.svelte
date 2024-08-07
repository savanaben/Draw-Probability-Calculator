<script>
    import { activeTab } from './colorStore';
    import { get } from 'svelte/store';
    import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';


    export let tabs = [];

    function selectTab(index) {
        if (!isDragging && movedDistance < dragThreshold) {
            activeTab.set(index);
        }
        movedDistance = 0; // Reset after attempting to select
    }

    let tabsContainer;
    let showLeftArrow = false;
    let showRightArrow = false;
    let isDragging = false;
    let startX;
    let scrollLeftStart;
    let dragThreshold = 5; // Threshold in pixels to differentiate drag from click
    let movedDistance = 0;


    function updateArrows() {
        if (tabsContainer) {
            showLeftArrow = tabsContainer.scrollLeft > 0;
            showRightArrow = tabsContainer.scrollWidth > tabsContainer.clientWidth && tabsContainer.scrollLeft < (tabsContainer.scrollWidth - tabsContainer.clientWidth);
        }
    }

    function scrollLeft() {
        tabsContainer.scrollBy({ left: -250, behavior: 'smooth' });
        setTimeout(updateArrows, 300); // Update arrows after scrolling
    }

    function scrollRight() {
        tabsContainer.scrollBy({ left: 250, behavior: 'smooth' });
        setTimeout(updateArrows, 300); // Update arrows after scrolling
    }


    function onMouseDown(e) {
        isDragging = true;
        startX = e.pageX - tabsContainer.offsetLeft;
        scrollLeftStart = tabsContainer.scrollLeft;
        movedDistance = 0; // Reset moved distance on mouse down
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - tabsContainer.offsetLeft;
        const walk = x - startX; // 1:1 movement
        tabsContainer.scrollLeft = scrollLeftStart - walk;
        movedDistance = Math.abs(walk); // Calculate moved distance
        updateArrows();
    }

    function onMouseUp() {
        isDragging = false;
    }

    $: {
        if (tabsContainer) {
            updateArrows();
        }
    }

    //the problem is using tabcontainer vs just tabs div. might be including arrow buttons
    //causing it to be off by about 60px ish
    $: {
        if (tabsContainer && tabs.length) {
            const totalTabsWidth = Array.from(tabsContainer.children).reduce((acc, tab) => acc + tab.offsetWidth, 0);
            console.log('Total Tabs Width:', totalTabsWidth);
            console.log('Tabs Container Width:', tabsContainer.clientWidth);
            showRightArrow = totalTabsWidth > (tabsContainer.clientWidth);
        }
    }

    function handleKeyDown(event, index) {
        if (event.key === 'Enter') {
            selectTab(index);
        }
    }

</script>

<style>
    .tabs-container {
        position: relative;
        display: flex;
        align-items: center;
        user-select: none; /* Prevent text selection */
    }
    .tabs {
        display: flex;
        width: max-content;
        overflow-x: auto;
        max-width: 100%;
        scrollbar-width: none; /* Hide default scrollbar */
        -ms-overflow-style: none; /* IE and Edge */
    }
    .tabs::-webkit-scrollbar {
        display: none; /* Hide default scrollbar */
    }
    .tab {
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
        border: 1px solid #ccc;
        border-radius: 4px 4px 0px 0px;
        background-color: #f3eede;
    }

    .tab:hover {
        background-color: transparent;
    }

    .tab.active {
        background-color: #fffae9;
        font-weight: bold;
        box-shadow: 0 2px 0 0 #fffae9;
        border-bottom: none;
        cursor: default;
    }
    .tab-content {
        padding-top: 8px;
    }
    .arrow {
        position: absolute;
    top: 50%;
    color: #0066e9;
    transform: translateY(-50%);
    background-color: rgba(255, 255, 255, 1);
    border-radius: 50%;
    width: 30px;
    margin: 0px 5px 0px 5px;
    height: 30px;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1;
    }

    .arrow:hover {
        border-color: #8a8a8a;
        box-shadow: 0px 2px 0px 0px rgb(231, 231, 231);
    }

    .arrow.left {
        left: 0;
    }
    .arrow.right {
        right: 0;
    }
    .arrow.hidden {
        display: none;
    }
</style>

<div class="tabs-container">
    <div class="arrow left {showLeftArrow ? '' : 'hidden'}" on:click={scrollLeft} role="presentation" tabindex="0">
        <FontAwesomeIcon icon={faChevronLeft} />
    </div>
    <div class="tabs" bind:this={tabsContainer} on:mousedown={onMouseDown} on:mousemove={onMouseMove} on:mouseup={onMouseUp} on:mouseleave={onMouseUp}>
        {#each tabs as tab, index}
            <div class="tab {index === $activeTab ? 'active' : ''}" on:click={() => selectTab(index)} on:keydown={(e) => handleKeyDown(e, index)} role="tab" tabindex="0">
                {tab}
            </div>
        {/each}
    </div>
    <div class="arrow right {showRightArrow ? '' : 'hidden'}" on:click={scrollRight} role="presentation" tabindex="0">
        <FontAwesomeIcon icon={faChevronRight} />
    </div>
</div>

<div class="tab-content">
    <slot name="content" />
</div>