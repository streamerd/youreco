document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.getElementById('recommendationList');

  chrome.storage.local.get(['recommendations'], (result) => {
    const recommendations = result.recommendations || [];
    
    if (recommendations.length === 0) {
      listElement.textContent = 'No recommendations captured yet. Watch some YouTube videos!';
      return;
    }

    listElement.innerHTML = recommendations.reverse().map(entry => `
      <div class="video-entry">
        <div class="timestamp">${new Date(entry.timestamp).toLocaleString()}</div>
        <div class="video-id">Video: ${entry.videoId}</div>
        <div class="recommendations">
          ${entry.recommendations.map(rec => `
            <div class="recommendation-item">
              <a href="${rec.url}" target="_blank">${rec.title}</a>
              <div>Channel: ${rec.channelName}</div>
              <div>Views: ${rec.viewCount}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  });
}); 