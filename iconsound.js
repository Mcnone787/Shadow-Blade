var volumeicon = document.getElementById("volume_icon");
var muteicon = document.getElementById("mute_icon");
var audio = document.getElementById("audio");
var upicon = document.getElementById("upicon");
var downicon = document.getElementById("downicon");


volumeicon.addEventListener("click", cambio)

function cambio(){
volumeicon.style.display = "none";
muteicon.style.display = "block";
audio.muted = true;
}


muteicon.addEventListener("click", cambio2);

function cambio2(){
    volumeicon.style.display = "block";
    muteicon.style.display = "none";
    audio.muted = false;
}

audio.play();
audio.loop = true;

upicon.addEventListener("click", up);
downicon.addEventListener("click", down);

function up(){
audio.volume+=0.2;
};

function down(){
audio.volume-=0.2;
};