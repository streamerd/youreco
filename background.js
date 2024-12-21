// Handle direct messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  
  if (message.type === 'VIDEO_ENDED') {
    chrome.storage.local.get(['recommendations'], (result) => {
      console.log('Current stored recommendations:', result);
      const stored = result.recommendations || [];
      stored.push(message.data);
      
      // Keep only last 100 entries to manage storage
      if (stored.length > 100) {
        stored.shift();
      }
      
      chrome.storage.local.set({ recommendations: stored });
    });
  }
  
  return true;
});

// Handle port messages
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name);
  
  port.onMessage.addListener((message) => {
    console.log('Port received message:', message);
    
    if (message.type === 'VIDEO_ENDED') {
      handleVideoEnded(message.data);
    }
  });
});

function handleVideoEnded(data) {
  chrome.storage.local.get(['recommendations'], (result) => {
    const stored = result.recommendations || [];
    stored.push(data);
    
    // Keep only last 100 entries to manage storage
    if (stored.length > 100) {
      stored.shift();
    }
    
    chrome.storage.local.set({ recommendations: stored }, () => {
      console.log('Stored recommendations:', stored);
    });
  });
} 