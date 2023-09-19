let dailyLimit = 3600;

chrome.storage.local.get('dailyLimit', function(data) {
    if (data.dailyLimit) {
        dailyLimit = data.dailyLimit;
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.init) {
        sendResponse({status: "ready"});
        return true;
    }

    if (message.timeWatched) {
        chrome.storage.local.get(['totalTimeWatched', 'dailyLimit', 'paused'], function(data) {
            if (data.paused) {
                return;
            }
            
            let totalTimeWatched = data.totalTimeWatched || 0;
            const dailyLimit = data.dailyLimit || 3600;

            totalTimeWatched += message.timeWatched;

            if (totalTimeWatched >= dailyLimit) {
                totalTimeWatched = dailyLimit;
                chrome.tabs.reload();
            }

            chrome.storage.local.set({ totalTimeWatched: totalTimeWatched });
        });
    }

    sendResponse({status: "message received"});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.includes("youtube.com")) {
        chrome.storage.local.get(['totalTimeWatched', 'dailyLimit', 'paused'], function(data) {
            if (data.paused) {
                return;
            }

            const totalTimeWatched = data.totalTimeWatched || 0;
            const dailyLimit = data.dailyLimit || 3600;

            if (totalTimeWatched >= dailyLimit) {
                chrome.tabs.update(tabId, {url: "blocked.html"});
            }
        });
    }
});
