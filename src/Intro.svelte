<script>

      import Popover from './Popover.svelte';

      let showPopover = false;

  </script>
  
  <style>
    .intro-section {
      max-width: 650px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
  
    .title {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 20px;
    }
  
    .subtitle {
      font-size: 22px;
      color: #666;
      margin-bottom: 20px;
    }
  
    p {
      font-size: 20px;
      line-height: 1.6;
      margin-bottom: 15px;
    }
  
    .highlight {
      font-weight: bold;
      color: #333;
    }
  
    @media (max-width: 768px) {
      .intro-section {
        padding: 10px;
      }
  
      .title {
        font-size: 24px;
      }
  
      .subtitle {
        font-size: 20px;
      }
  
      p {
        font-size: 16px;
      }
    }
  </style>
  
  <div class="intro-section">
    <h1 class="title">Draw Probability Calculator</h1>
    <p>This tool is made to answer questions like, "what are the chances I draw a mana rock and two lands in my opening hand." While I set the default deck size to 99 (edh), the tool will work for any deck size. If it helps you, consider 
      
      <Popover bind:show={showPopover} placement="top">
        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
          venmoing me a half a coffee
        </button>
        <div slot="content">
            <p class="popover-content">Percent change you'll get <i>at least</i> this many cards.</p>
        </div>
    </Popover>

   🙂.</p>
  </div>
  