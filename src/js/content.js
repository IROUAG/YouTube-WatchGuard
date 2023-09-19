let video;
let lastTime = null;
let observer;
let paused = false;

function handleTimeUpdate() {
    if (paused) {
        // If paused, don't send time updates
        return;
    }

    if (lastTime !== null) {
        const timeDifference = video.currentTime - lastTime;
        
        // Only count time if the difference is less than 2 seconds (to ignore skips)
        if (Math.abs(timeDifference) < 2) {
            chrome.runtime.sendMessage({timeWatched: timeDifference}, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    console.log(response.status);
                }
            });
        }
    }
    lastTime = video.currentTime;
}

function init() {
    const newVideo = document.querySelector('video') || document.querySelector('.shorts-player');

    if (newVideo && newVideo !== video) {
        if (video) {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        }
        video = newVideo;
        video.addEventListener('timeupdate', handleTimeUpdate);
    } else {
        setTimeout(init, 100);
    }

    chrome.runtime.sendMessage({init: true}, (response) => {
        if (response && response.status === "ready") {
            console.log("Background script is ready.");
        } else {
            console.error("Unable to wake up background script.");
        }
    });
}

function startObserver() {
    const targetNode = document.querySelector('ytd-app');
    const config = { childList: true, subtree: true };

    observer = new MutationObserver(init);
    observer.observe(targetNode, config);
}

chrome.storage.local.get(['paused'], function(data) {
    paused = data.paused || false;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.paused) {
        paused = changes.paused.newValue;
    }
});

startObserver();
init();
