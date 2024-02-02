import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import {
  nextSong,
  prevSong,
  playPause,
  RootState,
} from "../../redux/slices/playerSlice";
import MiniPlayer from "../miniPlayer/MiniPlayer";
import ExpandedPlayer from "../expandedPlayer/ExpandedPlayer";
import { useMusicContext } from "../../context/MusicContext";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { app, database } from "../../firebase/firebase";
import PlayerDesktop from "../shared/playerDesktop/PlayerDesktop";
import { ArtistAlt, User } from "../../types/types";
import { MAX_RECENT_TRACKS } from "../../constants/constants";

export default function Player() {
  const { activeSong, currentSongs, currentIndex, isActive, isPlaying } =
    useSelector((state: RootState) => state.player);
  const { user, users, isExpanded, togglePlayerView } = useMusicContext();
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [start, setStart] = useState(0);
  const dispatch = useDispatch();
  const ref = useRef<HTMLAudioElement>(null);
  const collectionRef = collection(database, "Users Data");
  const myData: User =
    users.length > 0 ? users.filter((data) => data.uid === user?.uid)[0] : null;
  const userDocRef = myData ? myData.docId : null;

  useEffect(() => {
    if (currentSongs.length) {
      dispatch(playPause(true));
    }
  }, [currentIndex]);

  const handlePlayPause = () => {
    if (!isActive) return;

    if (isPlaying) {
      dispatch(playPause(false));
    } else {
      dispatch(playPause(true));
    }
  };

  const handleNextSong = () => {
    dispatch(playPause(false));

    if (!shuffle) {
      dispatch(nextSong((currentIndex + 1) % currentSongs.length));
    } else {
      dispatch(nextSong(Math.floor(Math.random() * currentSongs.length)));
    }
  };

  const handlePrevSong = () => {
    if (currentIndex === 0) {
      dispatch(prevSong(currentSongs.length - 1));
    } else if (shuffle) {
      dispatch(prevSong(Math.floor(Math.random() * currentSongs.length)));
    } else {
      dispatch(prevSong(currentIndex - 1));
    }
  };

  const handleTrackCompletion = async () => {
    if (userDocRef && activeSong) {
      const listenedTrackData = {
        id: activeSong?.id,
        img: activeSong?.img,
        name: activeSong?.name,
        soundFile: activeSong?.soundFile,
        duration: activeSong?.duration,
        artists: activeSong?.artists.map((artist: ArtistAlt) => ({
          name: artist?.profile?.name || artist?.name,
          uri: artist?.profile?.uri || artist?.uri,
        })),
      };

      const currentArray = myData?.recentTracks;

      const isThere = myData?.recentTracks.some(
        (song) => song?.id === listenedTrackData?.id,
      );

      if (currentArray.length >= MAX_RECENT_TRACKS) {
        currentArray.shift();
      }
      currentArray.push(listenedTrackData);

      try {
        if (!isThere) {
          await updateDoc(doc(collectionRef, userDocRef), {
            recentTracks: currentArray,
          });
        }
      } catch (error) {
        console.error("Error updating listenedTracks:", error);
      }
    }
  };

  const handleEnded = async () => {
    handleNextSong();
    handleTrackCompletion();
  };

  // const getCurrentDate = async () => {
  //   const currentDate = new Date();
  //   const day = currentDate.getDate();
  //   const month = currentDate.getMonth() + 1;
  //   const year = currentDate.getFullYear();
  //   return `${day}-${month < 10 ? `0${month}` : month}-${year}`;
  // };

  // const getTotalListenings = async () => {
  //   try {
  //     const currentDate = await getCurrentDate();

  //     if (myData !== null && !myData.listeningStats) {
  //       await updateDoc(doc(collectionRef, myData?.docId), {
  //         listeningStats: {
  //           ...myData?.listeningStats,
  //           [currentDate]: 0,
  //         },
  //       });
  //     };

  //   } catch (err: any) {
  //     console.error("getTotalListenings error:", err.message);
  //   }
  // }

  // const updateListeningStats = async (newCount: number) => {
  //   try {
  //     const currentDate = await getCurrentDate();
  //     const listeningStats = (myData && myData.listeningStats) || {};
  //     if (listeningStats[currentDate] !== undefined) {
  //       listeningStats[currentDate] += newCount;
  //       await updateDoc(doc(collectionRef, myData?.docId), {
  //         listeningStats: {
  //           ...(myData?.listeningStats || {}),
  //           [currentDate]: listeningStats[currentDate],
  //         },
  //       });
  //     }
  //   } catch (err: any) {
  //     console.error("updateListeningStats error:", err.message);
  //   }
  // };

  /************************* FOR AUDIO TAG ***********************/
  if (ref.current) {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }

  useEffect(() => {
    if (ref.current && isPlaying) {
      ref.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  // useEffect(() => {
  //   getTotalListenings();
  //   let intervalId: NodeJS.Timeout;
  //   if (!isPlaying) {
  //     intervalId = setInterval(() => {
  //       updateListeningStats(10);
  //     }, 10000);
  //   }
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [isPlaying, start]);

  return (
    <>
      {isExpanded ? (
        <ExpandedPlayer
          onToggle={togglePlayerView}
          isPlaying={isPlaying}
          isActive={isActive}
          repeat={repeat}
          setRepeat={setRepeat}
          shuffle={shuffle}
          setShuffle={setShuffle}
          activeSong={activeSong}
          currentIndex={currentIndex}
          currentSongs={currentSongs}
          handlePlayPause={handlePlayPause}
          handlePrevSong={handlePrevSong}
          handleNextSong={handleNextSong}
          value={appTime}
          min={0}
          max={duration}
          onInput={(event: any) => setSeekTime(event.target.value)}
          setSeekTime={setSeekTime}
          appTime={appTime}
        />
      ) : (
        <MiniPlayer
          onToggle={togglePlayerView}
          isPlaying={isPlaying}
          isActive={isActive}
          activeSong={activeSong}
          currentIndex={currentIndex}
          currentSongs={currentSongs}
          handlePlayPause={handlePlayPause}
          value={appTime}
          min={0}
          max={duration}
        />
      )}
      <PlayerDesktop
        onToggle={togglePlayerView}
        isPlaying={isPlaying}
        isActive={isActive}
        repeat={repeat}
        setRepeat={setRepeat}
        shuffle={shuffle}
        setShuffle={setShuffle}
        activeSong={activeSong}
        currentIndex={currentIndex}
        currentSongs={currentSongs}
        handlePlayPause={handlePlayPause}
        handlePrevSong={handlePrevSong}
        handleNextSong={handleNextSong}
        value={appTime}
        min={0}
        max={duration}
        onInput={(event: any) => setSeekTime(event.target.value)}
        setSeekTime={setSeekTime}
        appTime={appTime}
        volume={volume}
        setVolume={setVolume}
      />
      <audio
        src={activeSong?.soundFile}
        ref={ref}
        loop={repeat}
        onEnded={handleEnded}
        onTimeUpdate={(event: any) => {
          const currentTime = event.target.currentTime.toFixed(0);
          const duration = event.target.duration.toFixed(0);
          const fixedDuration = (duration * 0.98).toFixed(0);
          if (currentTime === fixedDuration) {
            console.log("SUCCESS");
            handleTrackCompletion();
          }
          setAppTime(event.target.currentTime);
        }}
        onLoadedData={(event: any) => setDuration(event.target.duration)}
      />
      {/* <div
        className="bottom-overlay"
        style={{ height: isExpanded ? 300 : 160 }}
      ></div> */}
    </>
  );
}
