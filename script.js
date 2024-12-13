// Audio Player State
let currentPlayingAudio = null;
let currentAudioButton = null;
let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;
let isDragging = false; // New state to track progress bar dragging

// Selectors for Player Controls
const playPauseButton = document.querySelector('.play-pause');
const progressBar = document.querySelector('.progress-bar');
const currentTimeDisplay = document.querySelector('.current-time');
const totalTimeDisplay = document.querySelector('.total-time');
const nextButton = document.querySelector('.next');
const previousButton = document.querySelector('.previous');
const shuffleButton = document.querySelector('.shuffle');
const repeatButton = document.querySelector('.repeat');
const volumeSlider = document.querySelector('.volume-slider');
const volumeIcon = document.querySelector('.volume-container i');

// Audio Elements and Buttons
const allAudioElements = document.querySelectorAll('audio');
const playButtons = document.querySelectorAll('.play button');

// Shuffle Functionality
shuffleButton.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleButton.classList.toggle('active', isShuffle);
});

// Repeat Functionality
repeatButton.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatButton.classList.toggle('active', isRepeat);
});

// Play Button for Each Song
playButtons.forEach((button, index) => {
    const audio = allAudioElements[index];
    button.addEventListener('click', () => handlePlayPause(audio, button, index));
    audio.addEventListener('ended', () => handleSongEnd());
});

// Global Play/Pause Button
playPauseButton.addEventListener('click', () => {
    if (currentPlayingAudio) {
        if (currentPlayingAudio.paused) {
            currentPlayingAudio.play();
            updatePlayButtonState(true);
        } else {
            currentPlayingAudio.pause();
            updatePlayButtonState(false);
        }
    }
});

// Next and Previous Buttons
nextButton.addEventListener('click', nextTrack);
previousButton.addEventListener('click', previousTrack);

// Volume Control
volumeSlider.addEventListener('input', () => {
    if (currentPlayingAudio) {
        currentPlayingAudio.volume = volumeSlider.value / 100;
        updateVolumeIcon(currentPlayingAudio.volume);
    }
});
volumeIcon.addEventListener('click', toggleMute);

// Progress Bar Controls
progressBar.addEventListener('mousedown', () => {
    isDragging = true;
});

progressBar.addEventListener('mouseup', () => {
    isDragging = false;
    if (currentPlayingAudio) {
        const seekTime = (progressBar.value / 100) * currentPlayingAudio.duration;
        currentPlayingAudio.currentTime = seekTime;
    }
});

progressBar.addEventListener('input', () => {
    if (currentPlayingAudio && isDragging) {
        const seekTime = (progressBar.value / 100) * currentPlayingAudio.duration;
        currentTimeDisplay.textContent = formatTime(seekTime);
    }
});

// Main Play/Pause Logic
function handlePlayPause(audio, button, index) {
    if (currentPlayingAudio && currentPlayingAudio !== audio) {
        resetCurrentAudio();
    }

    if (audio.paused) {
        audio.play();
        button.classList.add('bx-pause');
        button.classList.remove('bx-play');
        playPauseButton.innerHTML = '<i class="bx bx-pause"></i>';
        audio.addEventListener('timeupdate', updateProgress);
    } else {
        audio.pause();
        button.classList.remove('bx-pause');
        button.classList.add('bx-play');
        playPauseButton.innerHTML = '<i class="bx bx-play"></i>';
    }

    currentPlayingAudio = audio;
    currentAudioButton = button;
    currentIndex = index;

    audio.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audio.duration);
    });
}

// Handle Song End
function handleSongEnd() {
    if (isRepeat) {
        playTrack();
    } else {
        nextTrack();
    }
}

// Play the Current Track
function playTrack() {
    const audio = allAudioElements[currentIndex];
    const button = playButtons[currentIndex];

    resetCurrentAudio();
    currentPlayingAudio = audio;
    currentAudioButton = button;

    audio.play();
    audio.addEventListener('timeupdate', updateProgress);
    button.classList.add('bx-pause');
    button.classList.remove('bx-play');
    playPauseButton.innerHTML = '<i class="bx bx-pause"></i>';

    totalTimeDisplay.textContent = formatTime(audio.duration || 0);
}

// Reset Current Audio
function resetCurrentAudio() {
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        currentPlayingAudio.removeEventListener('timeupdate', updateProgress);
    }
    if (currentAudioButton) {
        currentAudioButton.classList.remove('bx-pause');
        currentAudioButton.classList.add('bx-play');
    }
}

// Play the Next Track
function nextTrack() {
    resetCurrentAudio();
    currentIndex = isShuffle
        ? Math.floor(Math.random() * allAudioElements.length)
        : (currentIndex + 1) % allAudioElements.length;
    playTrack();
}

// Play the Previous Track
function previousTrack() {
    resetCurrentAudio();
    currentIndex = (currentIndex - 1 + allAudioElements.length) % allAudioElements.length;
    playTrack();
}

// Update Progress Bar and Time
function updateProgress() {
    if (currentPlayingAudio && !isDragging) {
        const currentTime = currentPlayingAudio.currentTime;
        const duration = currentPlayingAudio.duration || 1; // Avoid division by zero
        const progressPercent = (currentTime / duration) * 100;

        progressBar.style.backgroundSize = `${progressPercent}% 100%`; // Smooth fill effect
        progressBar.value = progressPercent;

        currentTimeDisplay.textContent = formatTime(currentTime);
        totalTimeDisplay.textContent = formatTime(duration);
    }
}

// Format Time Display
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update Volume Icon
function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.className = 'bx bx-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'bx bx-volume-low';
    } else {
        volumeIcon.className = 'bx bx-volume-full';
    }
}

// Toggle Mute/Unmute
function toggleMute() {
    if (currentPlayingAudio) {
        if (currentPlayingAudio.volume > 0) {
            currentPlayingAudio.volume = 0;
            volumeSlider.value = 0;
        } else {
            currentPlayingAudio.volume = 0.5;
            volumeSlider.value = 50;
        }
        updateVolumeIcon(currentPlayingAudio.volume);
    }
}

// Update Global Play Button
function updatePlayButtonState(isPlaying) {
    playPauseButton.innerHTML = isPlaying
        ? '<i class="bx bx-pause"></i>'
        : '<i class="bx bx-play"></i>';
}