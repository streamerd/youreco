chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'VIDEO_ENDED') {
    chrome.storage.local.get(['recommendations'], (result) => {
      const stored = result.recommendations || [];
      stored.push(message.data);
      
      // Keep only last 100 entries to manage storage
      if (stored.length > 100) {
        stored.shift();
      }
      
      chrome.storage.local.set({ recommendations: stored });
    });
  }
});