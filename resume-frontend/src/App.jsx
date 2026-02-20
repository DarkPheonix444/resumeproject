import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ResumeUpload from "./pages/ResumeUpload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ResumeUpload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
