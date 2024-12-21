document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.getElementById('recommendationList');

  function updateList(recommendations) {
    if (!recommendations || recommendations.length === 0) {
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
            <a class="recommendation-title" 
               href="https://www.youtube.com/watch?v=${entry.videoId}" 
               target="_blank">${entry.title || 'Source Video'}</a>
            <div class="recommendation-meta">
              <div>Channel: ${entry.channelName || 'Unknown Channel'}</div>
              <div>Views: ${entry.viewCount || 'N/A'}</div>
              ${entry.duration ? `<div>Duration: ${entry.duration}</div>` : ''}
            </div>
          </div>
          <div class="collapse-arrow"></div>
        </div>
        <div class="recommendations" style="display: none;">
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
        recommendations.style.display = recommendations.style.display === 'none' ? 'block' : 'none';
        sourceVideo.classList.toggle('collapsed', recommendations.style.display === 'block');
      });
    });
  }

//   document.getElementById('debugBtn').addEventListener('click', () => {
//     chrome.storage.local.get(['recommendations'], (result) => {
//       console.log('All stored recommendations:', result.recommendations);
//       if (result.recommendations) {
//         alert(`Found ${result.recommendations.length} stored recommendations. Check console for details.`);
//       } else {
//         alert('No recommendations found in storage');
//       }
//     });
//   });

  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all stored recommendations?')) {
      chrome.storage.local.clear(() => {
        alert('All data cleared');
        location.reload();
      });
    }
  });

  // Initial load
  chrome.storage.local.get(['recommendations'], (result) => {
    updateList(result.recommendations || []);
  });

  // Listen for changes in storage
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.recommendations) {
      updateList(changes.recommendations.newValue || []);
    }
  });
}); 