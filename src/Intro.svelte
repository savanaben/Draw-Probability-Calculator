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
      text-align: center;
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
    
button {
  padding: 4px;
  color: #0066e9;
}

    .highlight {
      font-weight: bold;
      color: #333;
    }
  
    @media (max-width: 768px) {
      .intro-section {
        padding: 10px;
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
    <p>This tool is made to answer questions like, "what are the chances I draw ramp and two lands in my opening hand." While I thought about this tool in the frame of Magic edh, it will work for any deck size and card game that draws 7 cards to start, and then 1 card per turn after. If you find this helpful, consider 
      
      <Popover bind:show={showPopover} placement="top">
        <button class="moreInfo"  slot="trigger" on:click={() => showPopover = !showPopover} aria-label="Help">
          venmoing me half a coffee
        </button>
        <div slot="content">
            <p class="popover-content">venmo info to come...</p>
        </div>
    </Popover>

   🙂.</p>
  </div>
  