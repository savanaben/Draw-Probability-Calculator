

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
  
  <link href="https://fonts.googleapis.com/css2?family=Vollkorn:wght@700&display=swap" rel="stylesheet">


  <div class="intro-section">
    <h1 class="title">Draw Probability Calculator</h1>
    <p>This tool is made to answer questions like, "what are the chances I draw one ramp spell and two lands in my opening hand." You can also take this a step further and calculate the chances you'll get certain mana or ability combinations in your opening turns. While I designed this tool in the frame of Commander Magic, it should work for any card game that draws a set number of cards to start, and then one card per turn after. If you find this helpful, consider 
      
      <Popover bind:show={showPopover} placement="bottom">
        <button id="moreInfo" class="moreInfo" slot="trigger" tabindex="-1" on:click={() => showPopover = !showPopover} aria-label="Help">
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
      answer: "<h3>Basic usage</h3><p>This tool helps people think about probabilities of single and multiple-card combinations in their opening hands. For example, in the following setup, I can see the chances i'll get 3 lands <i>or</i> a draw card in my opening hand.</p><img src='simple-setup.png' alt='Coffee Image'><img src='simple-probabilities.png' alt='Coffee Image'><hr><p>Using the link feature, you can see the chances i'll get 3 lands <i>and</i> a draw card in my opening hand.</p><img src='linked-simple.png' alt='Coffee Image'><img src='linked-simple-outcome.png' alt='Coffee Image'><hr><p>In this more complex example, you can see the chances i'll get specific lands and a ramp spell. Separately, I can also see the chances i'll get my combo.</p><img src='setup.png' alt='Coffee Image'><img src='probabilities.png' alt='Coffee Image'><hr>"
      },
      ];


</script>