<script>
    import { activeTab } from './colorStore';
    import { get } from 'svelte/store';

    export let tabs = [];

    function selectTab(index) {
        activeTab.set(index);
    }
</script>

<style>
    .tabs {
    display: flex;
    width: max-content;
    overflow-x: auto;
    max-width: 100%;
    scrollbar-width: thin;
    }
    .tab {
        padding: 8px 12px;
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid #ccc;
    border-radius: 4px 4px 0px 0px;
    background-color: #f3eede;
    }
    .tab.active {
        background-color: #fffae9;
        font-weight: bold;
        box-shadow: 0 2px 0 0 #fffae9;
        border-bottom: none;
    }
    .tab-content {
        padding-top: 8px;
    }
</style>

<div class="tabs">
    {#each tabs as tab, index}
        <div class="tab {index === $activeTab ? 'active' : ''}" on:click={() => selectTab(index)}>
            {tab}
        </div>
    {/each}
</div>

<div class="tab-content">
    <slot name="content" />
</div>