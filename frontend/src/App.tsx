import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Connect4Board from "./components/Connect4Board";
import Home from "./pages/Home"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Connect4Board />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;