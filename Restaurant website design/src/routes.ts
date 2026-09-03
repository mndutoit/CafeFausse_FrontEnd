import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Reservations from "./pages/Reservations";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "menu", Component: Menu },
      { path: "reservations", Component: Reservations },
      { path: "about", Component: About },
      { path: "gallery", Component: Gallery },
      { path: "admin", Component: Admin },
    ],
  },
]);
