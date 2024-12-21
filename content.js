// Listen for video player changes
let currentVideoId = null;

// Ensure chrome runtime is available
if (!chrome?.runtime) {
  throw new Error('Chrome runtime not available');
}

function extractVideoId(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
}

function captureRecommendations() {
  const recommendations = [];
  const recommendationElements = document.querySelectorAll('ytd-compact-video-renderer');

  recommendationElements.forEach(element => {
    const titleElement = element.querySelector('#video-title');
    const channelElement = element.querySelector('#channel-name a');
    const thumbnailElement = element.querySelector('#thumbnail img');
    const viewCountElement = element.querySelector('#metadata-line span:first-child');

    if (titleElement && channelElement) {
      recommendations.push({
        title: titleElement.textContent.trim(),
        url: titleElement.href,
        thumbnailUrl: thumbnailElement ? thumbnailElement.src : '',
        channelName: channelElement.textContent.trim(),
        viewCount: viewCountElement ? viewCountElement.textContent.trim() : '0 views'
      });
    }
  });

  return recommendations;
}

// Monitor video player state
function initVideoPlayerMonitoring() {
  const video = document.querySelector('video');
  if (!video) return;

  video.addEventListener('ended', () => {
    const videoId = extractVideoId(window.location.href);
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      
      // Wait for recommendations to load
      setTimeout(() => {
        try {
          const recommendations = captureRecommendations();
          if (chrome?.runtime?.sendMessage) {
            // Send message without expecting response
            chrome.runtime.sendMessage({
              type: 'VIDEO_ENDED',
              data: {
                timestamp: new Date().toISOString(),
                videoId: videoId,
                recommendations: recommendations
              }
            });
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }, 1000);
    }
  });
}

// Initialize monitoring when page loads
initVideoPlayerMonitoring();

// Handle YouTube's SPA navigation
const observer = new MutationObserver(() => {
  initVideoPlayerMonitoring();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 