import { Card, CardMedia, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import { AnimeData } from "../interfaces/AnimeData";

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const navigate = useNavigate();

  const navigateToPage = () => {
    if (anime?.mediaId) {
      navigate(`/anime/${anime?.mal_id}?mid=${anime.mediaId}`);
    } else {
      navigate(`/anime/${anime?.mal_id}`);
    }
  };

  return (
    <Tooltip
      title={
        <>
          <h3>{anime?.title_english || anime?.title}</h3>
        </>
      }
      placement="top"
      arrow
      sx={{
        "& .MuiTooltip-tooltip": {
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Adjust transparency here
          backdropFilter: "blur(4px)", // Adjust blur effect here
          borderColor: "red",
          borderWidth: "1px",
          borderStyle: "solid",
        },
        "& .MuiTooltip-arrow": {
          color: "rgba(0, 0, 0, 0.7)",
        },
      }}
    >
      <div className="text-white my-7 mx-4 w-[201px] h-[280px]">
        <Card>
          <div className="cursor-pointer relative group rounded-sm transition-transform duration-300 ease-in-out hover:scale-110">
            <CardMedia
              component="img"
              image={anime?.image}
              alt={anime?.title_english}
              className="rounded-sm shadow-xl mx-auto object-cover w-[150px] h-[268px]"
            />
            <div
              className="rounded-sm mx-auto absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 ease-in-out"
              onClick={navigateToPage}
            ></div>

            <button
              onClick={navigateToPage}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
              style={{ transition: "opacity 0.2s ease-in-out" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 10v4a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </Card>
        <div>
          {anime?.title_english ? (
            <div className="text-md  text-[#f5f5f5] font-semibold text-center truncate mx-2 pt-2 font-poppins">
              {anime?.title_english}
            </div>
          ) : (
            <div className="text-md text-[#f5f5f5] font-semibold text-center truncate mx-2 pt-2 font-poppins">
              {anime?.title}
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
};

interface AnimeCardProps {
  anime: AnimeData;
}
