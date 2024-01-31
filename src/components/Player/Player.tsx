import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { playPause } from "../../redux/slices/playerSlice";
import MiniPlayer from "../miniPlayer/MiniPlayer";
import ExpandedPlayer from "../expandedPlayer/ExpandedPlayer";
import { useMusicContext } from "../../context/MusicContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { app, database } from "../../firebase/firebase";

export default function Player() {
  const { activeSong, currentSongs, currentIndex, isActive, isPlaying } =
    useSelector((state) => state.player);
  const { user, users, isExpanded, togglePlayerView } = useMusicContext();
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [start, setStart] = useState(0);
  const dispatch = useDispatch();
  const ref = useRef<HTMLAudioElement>(null);
  const collectionRef = collection(database, "Users Data");
  const myData =
    users.length > 0 ? users.filter((data) => data.uid === user?.uid)[0] : null;
  const userDocRef = myData ? myData.docId : null;

  const handlePlayPause = () => {
    if (!isActive) return;

    if (isPlaying) {
      dispatch(playPause(false));
    } else {
      dispatch(playPause(true));
    }
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
  useEffect(() => {
    if (ref.current) {
      if (!isPlaying) {
        ref.current.play();
      }
    }
  }, [isPlaying]);

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
    if (currentSongs.length) {
      dispatch(playPause(true));
    }
  }, [currentIndex]);

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
      <div>
        {isExpanded ? (
          <ExpandedPlayer
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
        <audio
          src={activeSong?.soundFile}
          ref={ref}
          onTimeUpdate={(event: any) => setAppTime(event.target.currentTime)}
          onLoadedData={(event: any) => setDuration(event.target.duration)}
        />
      </div>
      <div
        className="bottom-overlay"
        style={{ height: isExpanded ? 300 : 160 }}
      ></div>
    </>
  );
}
