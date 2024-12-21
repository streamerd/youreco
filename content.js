// Listen for video player changes
let currentVideoId = null;
let isExtensionValid = true;

// Check extension context
function checkExtensionContext() {
  try {
    chrome.runtime.getURL('');
    isExtensionValid = true;
    return true;
  } catch (e) {
    isExtensionValid = false;
    console.log('Extension context invalid, will try to reconnect on next video');
    return false;
  }
}

// Initial check
checkExtensionContext();

function sendMessageToBackground(data) {
  return new Promise((resolve, reject) => {
    if (!checkExtensionContext()) {
      reject(new Error('Extension context invalid'));
      return;
    }

    try {
      chrome.runtime.sendMessage(data, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
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

function getCurrentVideoDetails() {
  const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent.trim();
  const videoId = extractVideoId(window.location.href);
  const videoThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const channelName = document.querySelector('#owner #channel-name a')?.textContent.trim();
  const viewCount = document.querySelector('#count .view-count')?.textContent.trim();
  const duration = document.querySelector('.ytp-time-duration')?.textContent.trim();

  return {
    videoId,
    title: videoTitle || 'Unknown Title',
    thumbnailUrl: videoThumbnail,
    channelName: channelName || 'Unknown Channel',
    viewCount: viewCount || 'N/A',
    duration: duration || ''
  };
}

// Update the video end handler
function initVideoPlayerMonitoring() {
  const video = document.querySelector('video');
  if (!video) return;

  video.addEventListener('ended', () => {
    const videoId = extractVideoId(window.location.href);
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      
      setTimeout(async () => {
        try {
          if (!isExtensionValid && !checkExtensionContext()) {
            console.log('Extension context still invalid, skipping recommendation capture');
            return;
          }

          const recommendations = captureRecommendations();
          const currentVideo = getCurrentVideoDetails();
          
          await sendMessageToBackground({
            type: 'VIDEO_ENDED',
            data: {
              timestamp: new Date().toISOString(),
              ...currentVideo,
              recommendations: recommendations
            }
          });
        } catch (error) {
          console.error('Error processing video end:', error);
          if (error.message.includes('Extension context invalidated')) {
            isExtensionValid = false;
          }
        }
      }, 1000);
    }
  });
}

// Initialize monitoring when page loads
initVideoPlayerMonitoring();

// Handle YouTube's SPA navigation
const observer = new MutationObserver(() => {
  if (isExtensionValid || checkExtensionContext()) {
    initVideoPlayerMonitoring();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 