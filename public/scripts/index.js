const video = document.querySelector('video');
const muteButton = document.querySelector('.video-overlay');

muteButton.addEventListener('click', () => {
    if (video.muted) {
        video.muted = false;
        muteButton.innerHTML = '<i class="fa-solid fa-volume"></i>'
    } else {
        video.muted = true;
        muteButton.innerHTML = '<i class="fa-solid fa-volume-slash"></i>'
    }
});