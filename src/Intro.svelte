<script>

  import Popover from './Popover.svelte';
  import FAQ from './FAQ.svelte';

  let showPopover = false;

  document.addEventListener('DOMContentLoaded', function() {
      var venmoLink = document.getElementById('venmoLink');
      if (venmoLink && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // Change the link for mobile devices
          venmoLink.href = 'venmo://paycharge?txn=pay&recipients=Benjamin-Gross-10&amount=2.5&note=Payment';
      }
  });


  let example = [
    { question: "Show examples of how to use this tool", 
    answer: `<h4 style='margin-bottom:0rem'>Basic usage</h4><p>This tool helps people think about probabilities of single and multiple-card combinations in their opening hands. For example, in the following setup, I can find the chances I'll get 3 lands in my opening hand given there are 38 lands in my deck.</p><img src='1.png' alt='Coffee Image'><img class='responsive-image' src='2.png' alt='Coffee Image'><hr><p>Using the link feature, I can find the chances I'll get 3 lands <i>and</i> 1 draw card in my opening hand.</p><img src='3.png' alt='Coffee Image'><img class='responsive-image-shorter' src='4.png' alt='Coffee Image'><hr><p>This tool also supports mulligans. I can see that my probabilities nearly double when I mulligan once.</p><img class='responsive-image-midsized' src='5.png' alt='Coffee Image'><img class='responsive-image-shorter' src='6.png' alt='Coffee Image'><hr><h4 style='margin-bottom:0rem'>Advanced usage</h4><p>In the "Advanced mana and attribute probabilities" section,</p><img src='6_5.png' alt='Coffee Image'><p>you can calculate more complex probabilities that consider card attributes, like mana. In the following setup, I've added all of the lands in my esper deck via the "Add mana group" button.</p><img src='7.png' alt='Coffee Image'><p>In Step 2, I'll input the amount of each mana I'd like to get.</p><img src='8.png' alt='Coffee Image'><p>After clicking "Run Simulation", the probability of getting 4 lands with the specified mana attributes is shown:</p><img class='responsive-image' src='9.png' alt='Coffee Image'><hr><h4 style='margin-bottom:0rem'>Advanced usage - custom groups</h4><p>The advanced section can also be used to add a custom group. For example, I'll use a custom group to represent the ramp spells in my deck.</p><img class='fixed-image' src='10.png' alt='Coffee Image'><p>Then, in step 2, I can add 1 ramp spell to my desired cards, in addition to any mana requirements.</p><img src='11.png' alt='Coffee Image'><p>Now, the resulting probability shows the chance I'll get the 4 lands of specific mana and 1 ramp spell:</p><img class='responsive-image' src='12.png' alt='Coffee Image'>`
    },
    ];


</script>






  
  <link href="https://fonts.googleapis.com/css2?family=Vollkorn:wght@700&display=swap" rel="stylesheet">


  <div class="intro-section">
    <h1 class="title">Draw Probability Calculator</h1>
    <p>This tool is made to answer questions like, "what are the chances I draw one ramp spell and two lands in my opening hand." You can also take this a step further and calculate the chances you'll get certain mana or ability combinations in your opening turns. While I designed this tool in the frame of Commander Magic, it should work for any card game that draws a set number of cards to start, and then one card per turn after. If you find this helpful, consider 
      
      <Popover bind:show={showPopover} placement="bottom">
        <button id="moreInfo" class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover} aria-label="donate to me if you want!">
          venmoing me half a coffee
        </button>
        <div slot="content">
          <div class="popover-group">  
          <img src="venmo_qrcode.png" alt="Coffee Image">

            <a href='https://venmo.com/u/Benjamin-Gross-10' target='_blank'>Open in web</a><br>
            <a href='venmo://paycharge?txn=pay&recipients=Benjamin-Gross-10&amount=2.5&note=half-a-coffee' target='_blank'>Open in mobile app</a>
          </div>
        </div>
    </Popover>
   🙂.
  </p>
   <FAQ customClass="reduced-padding" faqs={example}/> 
  </div>
  


  

<style>


  .intro-section {
    max-width: 658px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }

  .title {
    font-size: 42px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    line-height: 1.1;
  }



  #moreInfo {
  border-radius: 5px;
}

  .popover-group {
    text-align: center;
    font-weight: 700;
  }

@media (max-width: 768px) {
.title {
  font-size: 32px;
}
}

  .subtitle {
    font-size: 22px;
    color: #666;
    margin-bottom: 20px;
  }

  p {
    font-size: 20px;
    line-height: 1.6;
    margin-bottom: 0px;
  }
  
  @media (max-width: 768px) {
p {
  font-size: 18px;
}
}

button {
padding: 4px;
color: #0066e9;
border: none;
}

  .highlight {
    font-weight: bold;
    color: #333;
  }

  @media (max-width: 480px) {
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