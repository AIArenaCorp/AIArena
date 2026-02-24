import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Connect4Board from "./components/Connect4Board";
import ChallengePage from "./pages/ChallengePage";
import Home from "./pages/Home";

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/"         element={<Home         isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/create"   element={<Connect4Board isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/challenge" element={<ChallengePage isDark={isDark} setIsDark={setIsDark} />} />
      </Routes>
    </Router>
  );
}

export default App;