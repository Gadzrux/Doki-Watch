/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import React, { useState, useEffect, } from "react";
import { useSearchParams } from "react-router-dom";
import ReactPlayer from "react-player";
import axios from "axios";
import { Button } from "@mui/material";
import "./Watch.css"
import { SkipPrevious } from "@mui/icons-material";
import { SkipNext } from "@mui/icons-material";

interface Source {
  url: string;
  quality: string;
}

interface Episode {
  id: number,
  title_english: string,
  title_romaji: string
}

export const Watch: React.FC = () => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [animeData, setAnimeData] = useState<any>();
  const [episodesData, setEpisodesData] = useState<Episode[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [episodeId, setEpisodeId] = useState("");
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number>(parseInt(searchParams.get("ep") || "-1"));

  useEffect(() => {
    axios.get(`https://api.jikan.moe/v4/anime/${searchParams.get("id")}/episodes`)
      .then(res => {
        setEpisodesData(res.data.data.map((episode: any) => ({
          id: episode.mal_id,
          title_english: episode.title,
          title_romaji: episode.title_romanji
        }))
        )
      })

    axios.get(`https://api.jikan.moe/v4/anime/${searchParams.get("id")}`)
      .then(res => {
        setAnimeData(res.data.data)
      })
    setCurrentEpisodeNumber(parseInt(searchParams.get("ep") || "-1"));
  }, [searchParams])

  useEffect(() => {
    console.log(episodesData);
  }, [episodesData])

  useEffect(() => {
    const romajiName = animeData?.title.replace(/\s*-\s*/g, '-').toLowerCase().replace(/[\s:,\.]+/g, '-');
    setEpisodeId(`${romajiName}-episode-${currentEpisodeNumber}`);
  }, [animeData, currentEpisodeNumber]);

  useEffect(() => {
    if (!episodeId || !animeData || !animeData.title || !currentEpisodeNumber) return;
    const fetchData = async () => {
      // Clean the id by removing unwanted characters
      const cleanId = episodeId.replace(/["',.]/g, '');
      console.log(cleanId);
      const cacheKey = `watchData-${cleanId}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        setSources(data.sources);
        setStreamUrl(data.sources[4].url); // Default to 1080p
      } else {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_CONSUMET_API_ENDPOINT}watch/${cleanId}`
          );
          const data = response.data;
          if (data && data.sources && data.sources.length > 0) {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            setSources(data.sources);
            setStreamUrl(data.sources[4].url); // Default to 1080p
          }
        } catch (error) {
          console.log("Error:", error);
        }
      }
    };

    fetchData();
  }, [episodeId]);

  const reload = () => {
    window.location.reload();
  }

  const handleQualityChange = (url: string) => {
    setStreamUrl(url);
    setSettingsVisible(false); // Hide settings menu after selection
  };

  const handleDownload = () => {
    const player = document.querySelector("video");
    if (player) {
      const a = document.createElement("a");
      a.href = player.src;
      a.download = "video.mp4";
      a.click();
    }
  };

  const handleWatchEpisode = (episodeId: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('ep', (episodeId).toString());
    setSearchParams(newSearchParams);
  };

  const handlePrev = () => {
    if (currentEpisodeNumber > 1) {
      handleWatchEpisode(currentEpisodeNumber - 1);
    } else {
      alert("You are watching the first episode");
    }
  };

  const handleNext = () => {
    console.log("currentEpisodeNumber", currentEpisodeNumber);
    console.log("episodesData.length", episodesData.length);
    if (currentEpisodeNumber === episodesData.length) {
      alert("You are watching the last episode");
    } else {
      handleWatchEpisode(currentEpisodeNumber + 1);
    };
  }


  // useEffect(() => {
  //   // Add the following code to the useEffect hook
  //   const episode = sources.find((source) => source.url === streamUrl)?.episode;
  //   console.log(episode);
  //   if (episode) {
  //     setCurrentEpisode(episode);
  //   }
  // }, [streamUrl, sources]);

  // const handleNextEpisode = () => {
  //   const nextEpisode = sources.find((source) => source.episode === currentEpisode + 1);
  //   console.log(nextEpisode);
  //   if (nextEpisode) {
  //     setStreamUrl(nextEpisode.url);
  //   }
  // };

  // const handlePreviousEpisode = () => {
  //   const previousEpisode = sources.find((source) => source.episode === currentEpisode - 1);
  //   console.log(previousEpisode);
  //   if (previousEpisode) {
  //     setStreamUrl(previousEpisode.url);
  //   }
  // };

  return (
    <div className="flex h-screen w-screen justify-center mt-10">
      <div className="flex flex-row h-max">
        <div className="">
          <div className="bg-gray-800 border border-white backdrop-blur-lg w-64 h-full text-center rounded-l-md border-r-2 border-r-slate-500 flex flex-col py-2">
            <div className="text-center font-poppins font-semibold pb-2">EPISODES</div>
            <hr className="" />
            <div className="overflow-y-auto h-[33rem] scrollHide">
              {episodesData.map((episode, index) => (
                <div
                  key={index}
                  className={`episode-row flex justify-start items-center h-16 py-2 ${episode.id == currentEpisodeNumber ? 'bg-red-700' : 'bg-gray-800 hover:bg-gray-700'} transition-colors duration-150 ease-in-out`}
                  onClick={() => { handleWatchEpisode(episode.id) }}
                >

                  <div className="hover:text-pink-200 ml-2 text-border-white font-poppins cursor-pointer truncate">
                    {episode.id}. {episode.title_english}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl relative">
          {streamUrl ? (
            <div onLoad={reload}>
              <button
                onClick={handleDownload}
                className="absolute top-2.5 right-2.5 mr-12 z-10 p-2 rounded-md bg-black bg-opacity-50 text-white border-none cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>

              </button>

              <button
                onClick={() => setSettingsVisible(!settingsVisible)}
                className="absolute top-2.5 right-2.5 z-10 p-2 rounded-md bg-black bg-opacity-50 text-white border-none cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>

              </button>
              <ReactPlayer
                url={streamUrl}
                playing={true}
                controls={true}
                width="100%"
                height="500px"
                className="aspect-video border border-white rounded-tr-md"
              />
              <div className="bg-gray-800 border border-white backdrop-blur-lg rounded-ee-md h-20 flex items-center px-4 py-auto">
                <div className="cursor-pointer ml-auto border border-gray-700 rounded-lg px-2 py-2 hover:bg-slate-700 hover:scale-105 transform transition duration-150 ease-in-out" title="Previous Episode" >
                  <SkipPrevious className="flex" onClick={handlePrev} />
                </div>
                <div className="flex-1 flex justify-center">
                  {/* Find the current episode and display its title */}<p className="whitespace-nowrap flex flex-col items-center font-poppins font-semibold text-white px-1 pl-2 p-1">CURRENT EPISODE: </p>
                  <p className="whitespace-nowrap mr-2 flex flex-col items-center font-poppins bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg px-1 p-1 rounded-md font-semibold text-md text-white">{currentEpisodeNumber} - {
                    episodesData.find(episode => episode.id === currentEpisodeNumber)?.title_english
                  }</p>
                </div>
                <div className="cursor-pointer ml-auto border border-gray-700 rounded-lg px-2 py-2 hover:bg-slate-700 hover:scale-105 transform transition duration-150 ease-in-out" title="Next Episode" >
                  <SkipNext className="flex cursor-pointer" onClick={handleNext} />
                </div>
              </div>
            </div>

          ) : (
            <div className="flex justify-center items-center">
              <span className="loading loading-spinner text-info"></span>
              <p className="ml-2 font-poppins font-semibold">loading..</p>
            </div>
          )}

          {settingsVisible && (
            <div
              className="absolute top-10 right-2.5 bg-black border border-gray-300 shadow-md z-20"
            >
              {sources.map((source, index) => (
                <div
                  key={index}
                  onClick={() => handleQualityChange(source.url)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    backgroundColor: streamUrl === source.url ? "Black" : "Black",
                  }}
                >
                  {source.quality}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};