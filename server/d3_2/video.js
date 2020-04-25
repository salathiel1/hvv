var wrapperVideo = document.getElementById("wrapperVideo");

window.closeVideo = closeVideo;

export function closeVideo() {
    wrapperVideo.style.display = "none";
    document.getElementById("myVideo").pause(); 
}

export function openVideo() {
    return wrapperVideo.style.display = "block"; 
}

export function loadVideo(src, seconds){
	var vid = document.getElementById("myVideo");
    vid.pause();
    vid.setAttribute('src', src);
    vid.load();
    vid.currentTime = seconds
    vid.play();
}