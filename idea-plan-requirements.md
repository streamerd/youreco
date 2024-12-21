
Help me with design a Chrome extension to track and display YouTube video recommendations shown after video completion.

----

Technical Development Plan:

    Extension Architecture:

- manifest.json (Extension configuration)
- background.js (Background script for monitoring YouTube)
- content.js (Content script to interact with YouTube page)
- popup.html/js (UI to display saved recommendations)
- storage.js (Handle Chrome storage operations)

    Core Requirements:

    Monitor YouTube video completion events
    Capture recommendation data when video ends
    Store recommendations with timestamps
    Provide UI to view historical recommendations
    Handle YouTube's dynamic content loading

    Technical Implementation Details:

A. Content Script (content.js):

    Inject into YouTube pages
    Monitor video player state using YouTube's HTML5 Player API
    When video ends, parse the recommendation section (typically div with class="ytp-endscreen-content")
    Extract video data: title, URL, thumbnail, channel name, view count
    Send data to background script

B. Background Script (background.js):

    Listen for messages from content script
    Handle storage operations
    Manage extension state
    Track active YouTube tabs

C. Storage:

    Use Chrome's storage.local API
    Store data structure:

javascript

{
  recommendations: [
    {
      timestamp: Date,
      videoId: string,
      recommendations: [{
        title: string,
        url: string,
        thumbnailUrl: string,
        channelName: string,
        viewCount: string
      }]
    }
  ]
}

D. User Interface:

    Popup with list of recent video completions
    Click to expand/view recommendations
    Filter/search capabilities
    Clear history option

Technical Requirements:

    Permissions needed in manifest.json:

json

{
  "permissions": [
    "storage",
    "tabs",
    "*://*.youtube.com/*"
  ]
}

    YouTube-specific:

    Handle both desktop and mobile YouTube layouts
    Support for different video player states
    Handle YouTube's SPA (Single Page Application) navigation

    Performance considerations:

    Efficient DOM observation
    Throttle storage operations
    Clean up old data periodically
    Handle memory management

    Error handling:

    Network failures
    Storage limits
    YouTube layout changes
    Missing data scenarios

Implementation Phases:

    Phase 1 - Core Functionality:

    Basic extension setup
    Video completion detection
    Recommendation capture
    Simple storage implementation

    Phase 2 - UI Development:

    Popup interface
    Basic list view
    Recommendation display

    Phase 3 - Enhancement:

    Search/filter capabilities
    Data management
    Performance optimization
    Error handling

    Phase 4 - Testing & Polish:

    Cross-browser testing
    Edge case handling
    Performance profiling
    User feedback implementation

Testing Requirements:

    Functional Testing:

    Video completion detection
    Recommendation capture accuracy
    Storage operations
    UI interactions

    Performance Testing:

    Memory usage
    Storage efficiency
    Load times
    Background script impact

    Edge Cases:

    Network disconnection
    Multiple YouTube tabs
    Various video lengths
    Different YouTube layouts
