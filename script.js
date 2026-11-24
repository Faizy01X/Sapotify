console.log("Lets Write some Javascript");
let songs;
let currentSong = new Audio();
let currFolder;

//Time duration of the song
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //Show all Song List in Library
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                            <img src="img/music.svg" alt="">
                            <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Faizy</div>
                            </div>

                            <div class="playNow">
                                <span>Play Now</span>
                            <img src="img/playbutton.svg" style="filter: invert();" alt="">
                            </div> </li>`;
  }

  // Add an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00/00:00";
};

// Display Album Function

async function displayAlbums() {
  console.log("displaying albums");

  // Fetch the main songs folder
  let a = await fetch("/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  cardContainer.innerHTML = "";
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    let url = new URL(e.href);

    // Find album folders directly inside songs/
    if (
      url.pathname.startsWith("/songs/") &&
      url.pathname.split("/").filter(Boolean).length === 2
    ) {
      let folder = url.pathname.split("/").filter(Boolean).pop();
      console.log("Album folder:", folder);

      // Get metadata
      let a = await fetch(`/songs/${folder}/info.json`);
      if (!a.ok) {
        console.log("info.json not found:", folder);
        continue;
      }

      // for (let index = 0; index < array.length; index++) {
      //     const e = array[index];
      //     if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      //         let folder = e.href.split("/").slice(-2)[0]
      //         // Get the metadata of the folder
      //         let a = await fetch(`/songs/${folder}/info.json`)

      let response = await a.json();

      cardContainer.innerHTML = cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                  <div class="play"> <img src="img/play.svg"></div  f>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>

                </div>`;
    }
  }

  // Load playlist from folder
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");

      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
}

//Load the Playlist from Folder
Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    console.log("Fetching Songs");
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    playMusic(songs[0]);
  });
});

async function main() {
  //Get the list of all songs
  songs = await getSongs("songs/ncs");
  playMusic(songs[0], true);
  // console.log(songs);

  //Displaying Album Dynamically
  await displayAlbums();

  // Play , Pause Song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/playbutton.svg";
    }
  });

  // Song time for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add eventlistern to seekbar movement
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add Hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Add Closeevent on Close button for ham burger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e);
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      i 
    });


     // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
      console.log(e.target);
      console.log("changing",e.target.src);
      if(e.target.src.includes("volume.svg")){
         e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        
      }
      
    })

    // document.querySelector(".volIco").addEventListener("click", () => {
    // if (currentSong.paused) {
    //   currentSong.play();
    //   play.src = "img/pause.svg";
    // } else {
    //   currentSong.pause();
    //   play.src = "img/playbutton.svg";
    // }
  // });

}

// return songs

main();
