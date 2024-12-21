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
  // Get end screen recommendations
  const endScreenElements = document.querySelectorAll('.ytp-endscreen-content .ytp-videowall-still');

  endScreenElements.forEach(element => {
    // Extract video ID from href
    const videoUrl = element.href;
    const videoId = extractVideoId(videoUrl);
    
    // Get info elements
    const titleElement = element.querySelector('.ytp-videowall-still-info-title');
    const authorElement = element.querySelector('.ytp-videowall-still-info-author');
    const thumbnailElement = element.querySelector('.ytp-videowall-still-image');
    const durationElement = element.querySelector('.ytp-videowall-still-info-duration');

    if (titleElement) {
      const thumbnailUrl = thumbnailElement ? 
        thumbnailElement.style.backgroundImage.replace(/url\(["'](.+)["']\)/, '$1') : '';
      
      const authorText = authorElement ? authorElement.textContent.split('•') : ['Unknown', '0 views'];
      const channelName = authorText[0].trim();
      const viewCount = authorText[1] ? authorText[1].trim() : '0 views';

      recommendations.push({
        title: titleElement.textContent.trim(),
        url: videoUrl,
        thumbnailUrl: thumbnailUrl,
        channelName: channelName,
        viewCount: viewCount,
        duration: durationElement ? durationElement.textContent.trim() : ''
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