import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();

  const navEls = [
    {
      icon: (
        <GridViewRoundedIcon
          fontSize="medium"
          sx={{ color: location.pathname === "/" ? "#190b14" : "#d0d2d8" }}
        />
      ),
      name: "Menu",
      link: "/",
    },
    {
      icon: (
        <ExploreRoundedIcon
          fontSize="medium"
          sx={{
            color: location.pathname === "/explore" ? "#190b14" : "#d0d2d8",
          }}
        />
      ),
      name: "Explore",
      link: "/explore",
    },
    {
      icon: (
        <FavoriteRoundedIcon
          fontSize="medium"
          sx={{
            color: location.pathname === "/favorites" ? "#190b14" : "#d0d2d8",
          }}
        />
      ),
      name: "Favorites",
      link: "/favorites",
    },
    {
      icon: (
        <PersonRoundedIcon
          fontSize="medium"
          sx={{
            color: location.pathname === "/profile" ? "#190b14" : "#d0d2d8",
          }}
        />
      ),
      name: "Profile",
      link: "/profile",
    },
  ];

  return (
    <nav className="nav-bar">
      {navEls.map((el) => (
        <Link
          key={el.name}
          to={el.link}
          className={`blur-circle-btn flex-content ${location.pathname === el.link ? "active-icon" : ""}`}
        >
          {el.icon}
        </Link>
      ))}
    </nav>
  );
}