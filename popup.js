document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.getElementById('recommendationList');

  document.getElementById('debugBtn').addEventListener('click', () => {
    chrome.storage.local.get(['recommendations'], (result) => {
      console.log('All stored recommendations:', result.recommendations);
      if (result.recommendations) {
        alert(`Found ${result.recommendations.length} stored recommendations. Check console for details.`);
      } else {
        alert('No recommendations found in storage');
      }
    });
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all stored recommendations?')) {
      chrome.storage.local.clear(() => {
        alert('All data cleared');
        location.reload();
      });
    }
  });

  chrome.storage.local.get(['recommendations'], (result) => {
    const recommendations = result.recommendations || [];
    
    if (recommendations.length === 0) {
      listElement.textContent = 'No recommendations captured yet. Watch some YouTube videos!';
      return;
    }

    listElement.innerHTML = recommendations.reverse().map(entry => `
      <div class="video-entry">
        <div class="timestamp">${new Date(entry.timestamp).toLocaleString()}</div>
        <div class="source-video" data-video-id="${entry.videoId}">
          <img src="https://i.ytimg.com/vi/${entry.videoId}/mqdefault.jpg" 
               alt="Video thumbnail">
          <div class="source-video-info">
            <div class="source-video-title">Source Video</div>
            <div class="source-video-meta">
              <div>ID: ${entry.videoId}</div>
              <a href="https://www.youtube.com/watch?v=${entry.videoId}" 
                 target="_blank">Watch on YouTube</a>
            </div>
          </div>
        </div>
        <div class="recommendations">
          <div style="font-weight: bold; margin-bottom: 16px;">End Screen Recommendations:</div>
          ${entry.recommendations.map(rec => `
            <div class="recommendation-item">
              <img class="recommendation-thumbnail" 
                   src="${rec.thumbnailUrl}" 
                   alt="${rec.title}">
              <div class="recommendation-info">
                <a class="recommendation-title" 
                   href="${rec.url}" 
                   target="_blank">${rec.title}</a>
                <div class="recommendation-meta">
                  <div>Channel: ${rec.channelName}</div>
                  <div>Views: ${rec.viewCount}</div>
                  ${rec.duration ? `<div>Duration: ${rec.duration}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add click handlers for source videos
    document.querySelectorAll('.source-video').forEach(sourceVideo => {
      sourceVideo.addEventListener('click', () => {
        const recommendations = sourceVideo.nextElementSibling;
        recommendations.classList.toggle('active');
      });
    });
  });
}); 