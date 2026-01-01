import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext/ThemeContext";
import AppRouter from "./routes/AppRouter/AppRouter";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import GlobalChat from "./components/GlobalChat/GlobalChat";
import "./App.css";

const App = () => {
  const location = useLocation();

  const hideHeader = /^\/(login|register)/.test(location.pathname);
  const hideFooter = /^\/(login|register)/.test(location.pathname);
  
  // Show chat only on home and blog pages
  const showChat = location.pathname === "/" || location.pathname === "/blog";

  return (
    <ThemeProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {!hideHeader && <Header />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AppRouter />
        </div>
        {!hideFooter && <Footer />}
        {showChat && <GlobalChat />}
      </div>
    </ThemeProvider>
  );
};

export default App;
