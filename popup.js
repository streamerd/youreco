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
        <div class="video-id">Source Video: ${entry.videoId}</div>
        <div class="recommendations">
          <div style="font-weight: bold; margin: 8px 0;">End Screen Recommendations:</div>
          ${entry.recommendations.map(rec => `
            <div class="recommendation-item">
              <a href="${rec.url}" target="_blank">${rec.title}</a>
              <div>Channel: ${rec.channelName}</div>
              <div>Views: ${rec.viewCount}</div>
              ${rec.duration ? `<div>Duration: ${rec.duration}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  });
}); 