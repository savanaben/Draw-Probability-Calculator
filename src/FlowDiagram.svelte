<script>
    export let boxes = [];
</script>

<style>
    .flow-diagram {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .box {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 12px;
        margin: 4px 0;
        background-color: #f9f9f9;
        text-align: center;
        width: 80%;
    }

    .box-title {
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 1.2rem;
        text-align: center;
    }

.box-body {
    text-align: left;
}

    .arrow {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #787878;
    margin: 4px 0;
    }

    .nested-boxes {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .nested-box {
        border: 1px solid #e5e5e5;
        background-color: #efefef;
    }

    .nested-box .box-title {
        font-size: 1rem; /* Title font size for nested boxes */
    }

    @media (max-width: 768px) {
        .box {
            width: 100%;
    width: -moz-available;          /* WebKit-based browsers will ignore this. */
    width: -webkit-fill-available;  /* Mozilla-based browsers will ignore this. */
    width: stretch;
        }
    }
</style>

<div class="flow-diagram">
    {#each boxes as box, index}
        <div class="box">
            <div class="box-title">{box.title}</div>
            <div class="box-body">{box.body}</div>
            {#if box.nestedBoxes}
                <div class="nested-boxes">
                    {#each box.nestedBoxes as nestedBox, nestedIndex}
                        <div class="box nested-box">
                            <div class="box-title">{nestedBox.title}</div>
                            <div class="box-body">{nestedBox.body}</div>
                        </div>
                        {#if nestedIndex < box.nestedBoxes.length - 1}
                            <div class="arrow"></div>
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
        {#if index < boxes.length - 1}
            <div class="arrow"></div>
        {/if}
    {/each}
</div>