function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = Math.round(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
}

function updateRemainingTimeDisplay() {
    chrome.storage.local.get(['totalTimeWatched', 'dailyLimit'], function(data) {
        const totalTimeWatched = data.totalTimeWatched || 0;
        const dailyLimit = data.dailyLimit || 3600;  // default 1 hour in seconds
        let remainingTime = dailyLimit - totalTimeWatched;

        if (remainingTime < 0) remainingTime = 0;
        
        document.getElementById('timeLeft').textContent = formatTime(remainingTime);
    });
}

document.getElementById('setLimit').addEventListener('click', function() {
    const dailyLimitInput = document.getElementById('dailyLimit');
    const dailyLimitValue = parseFloat(dailyLimitInput.value);
    
    if (isNaN(dailyLimitValue) || dailyLimitValue <= 0) {
        document.getElementById('notification').textContent = 'Please enter a valid number of minutes.';
        return;
    }

    const limitInSeconds = dailyLimitValue * 60;
    chrome.storage.local.set({ dailyLimit: limitInSeconds, totalTimeWatched: 0 }, function() {
        document.getElementById('notification').textContent = 'Limit set successfully!';
        updateRemainingTimeDisplay();
    });
});

document.getElementById('toggleTimer').addEventListener('click', function() {
    chrome.storage.local.get(['paused'], function(data) {
        const isPaused = data.paused || false;
        chrome.storage.local.set({ paused: !isPaused }, function() {
            if (isPaused) {
                document.getElementById('toggleTimer').textContent = 'Pause Timer';
                document.getElementById('notification').textContent = 'Timer resumed.';
            } else {
                document.getElementById('toggleTimer').textContent = 'Resume Timer';
                document.getElementById('notification').textContent = 'Timer paused.';
            }
        });
    });
});

updateRemainingTimeDisplay();
setInterval(updateRemainingTimeDisplay, 1000);
