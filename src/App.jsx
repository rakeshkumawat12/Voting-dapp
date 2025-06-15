import "./App.css";
import AllPolls from "./pages/AllPolls";
import CreatePoll from "./pages/CreatePoll";

import Landing from "./pages/Landing";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Vote from "./pages/Vote";
import Header from "./components/Header";
import Referenda from "./pages/Referenda"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/createpoll" element={<CreatePoll />} />
          <Route path="/allpolls" element={<AllPolls />} />
          <Route path="/poll/:pollId" element={<Vote />} />
          <Route path="/referenda" element={<Referenda />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
