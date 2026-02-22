import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ResumeUpload from "./pages/ResumeUpload";
import History from "./pages/history";
import ResumeDetails from "./pages/ResumeDetails";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ResumeUpload />} />
          <Route path="/history" element={<History />} />
          <Route path="/resume/:id" element={<ResumeDetails />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
