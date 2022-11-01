import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Login from './components/Login';
import Register from "./components/Register";
import NavBar from "./components/Navbar";
import PasswordRecovery from "./components/PasswordRecovery";
import Session from "react-session-api";
import Browse from "./components/Browse";
import Copyright from "./components/Copyright";
import Profile from "./components/Profile";

function App() {
  //Session.set("user","")
  //Session.set("role","")
  localStorage.setItem("user", "");
  localStorage.setItem("role", "");
  return (
    <div className="App">
      <NavBar/>
      <BrowserRouter>
        
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/passwordrecovery" element={<PasswordRecovery/>}/>
            <Route path="/browser" element={<Browse/>}/>
            <Route path="/profile" element={<Profile/>}/>
          </Routes> 
      </BrowserRouter>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </div>
  );
}

export default App;