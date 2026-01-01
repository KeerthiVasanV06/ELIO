import { useEffect, useState } from "react";
import "./ReadingProgress.css";

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const totalScroll = scrollHeight - clientHeight;
      const scrolled = (scrollTop / totalScroll) * 100;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <div className="reading-progress" style={{ width: `${progress}%` }} />;
};

export default ReadingProgress;
