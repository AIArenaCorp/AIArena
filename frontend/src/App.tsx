import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Connect4Board from "./components/Connect4Board";
import ChallengePage from "./pages/ChallengePage";
import Home from "./pages/Home";
import TanksPage from "./pages/TankPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/create"    element={<Connect4Board />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/tanks"     element={<TanksPage />} />
      </Routes>
    </Router>
  );
}

export default App;