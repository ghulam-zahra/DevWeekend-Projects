let progress = document.getElementById("progress");
let song = document.getElementById("song");
let ctrlIcon = document.getElementById("ctrlIcon");

// Load song metadata
song.onloadedmetadata = function() {
    progress.max = song.duration;
    progress.value = song.currentTime;
};

// Play/Pause function
function playPause() {
    if (song.paused) {
        song.play();
        ctrlIcon.classList.remove("fa-play");
        ctrlIcon.classList.add("fa-pause");
    } else {
        song.pause();
        ctrlIcon.classList.remove("fa-pause");
        ctrlIcon.classList.add("fa-play");
    }
}

// Update progress bar while playing
song.addEventListener('timeupdate', function() {
    if (!song.paused) {
        progress.value = song.currentTime;
        // Update progress bar color
        let percentage = (song.currentTime / song.duration) * 100;
        progress.style.background = `linear-gradient(to right, #f53192 0%, #f53192 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
    }
});

// Seek when progress bar is changed
progress.oninput = function() {
    song.currentTime = progress.value;
    let percentage = (progress.value / song.duration) * 100;
    progress.style.background = `linear-gradient(to right, #f53192 0%, #f53192 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
};

// Previous song function
function prevSong() {
    if (song.currentTime > 3) {
        // If song is more than 3 seconds in, restart
        song.currentTime = 0;
    } else {
        // Otherwise go to beginning
        song.currentTime = 0;
    }
    if (song.paused) {
        song.play();
        ctrlIcon.classList.remove("fa-play");
        ctrlIcon.classList.add("fa-pause");
    }
}

// Next song function
function nextSong() {
    song.currentTime = 0;
    if (song.paused) {
        song.play();
        ctrlIcon.classList.remove("fa-play");
        ctrlIcon.classList.add("fa-pause");
    }
}

// Handle when song ends
song.addEventListener('ended', function() {
    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");
    progress.value = 0;
    progress.style.background = `linear-gradient(to right, #f53192 0%, #f53192 0%, #e0e0e0 0%, #e0e0e0 100%)`;
});

// Handle errors (if song fails to load)
song.addEventListener('error', function() {
    alert("Sorry, the song couldn't be loaded. Please check your internet connection and try again.");
});

console.log("Music Player loaded successfully!");