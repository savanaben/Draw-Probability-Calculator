// analytics.js
export const initGA = () => {
    // Add your Google Analytics 4 "G-XXXXXXX" ID
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'G-927EKMRK7V'); // Replace 'G-XXXXXXX' with your GA Measurement ID
  };
  
  export const trackPageView = (url) => {
    gtag('config', 'G-927EKMRK7V', {  // Replace 'G-XXXXXXX' with your GA Measurement ID
      page_path: url
    });
  };
  
  export const trackEvent = (eventName, eventParams) => {
    gtag('event', eventName, eventParams);
  };