import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Login from './components/Login';
import Register from "./components/Register";
import NavBar from "./components/Navbar";
import PasswordRecovery from "./components/PasswordRecovery";
import Browse from "./components/Browse";
import Copyright from "./components/Copyright";
import Profile from "./components/Profile";
import AddVenue from "./components/AddVenue";
import VenueInformation from "./components/VenueInformation"
import { useEffect } from "react";
import Inbox from "./components/Inbox";
import BookmarkBrowser from "./components/BookmarkBrowser";
import OwnerVenueBrowser from "./components/OwnerVenueBrowser";
import EditVenue from "./components/EditVenue";
import Dashboard from "./components/Dashboard";
import ManageBooking from "./components/ManageBooking";
import Home from "./components/Home";

function App() {
  //Session.set("user","")
  //Session.set("role","")
  useEffect(() => {

    if (localStorage.getItem('user') === null) {
      localStorage.setItem("user", "");
      localStorage.setItem("role", "");
    }

  })
  // localStorage.setItem("user", "");
  // localStorage.setItem("role", "");
  return (
    <div className="App">
      <NavBar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/passwordrecovery" element={<PasswordRecovery />} />
          <Route path="/browser" element={<Browse />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addvenue" element={<AddVenue />} />
          <Route path="/venueInformation" element={<VenueInformation />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/bookmark" element={<BookmarkBrowser/>}/>
          <Route path="/managevenue" element={<OwnerVenueBrowser/>}/>
          <Route path="/editvenue" element={<EditVenue/>}/>   
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/booking" element={<ManageBooking/>}/>   
        </Routes>
      </BrowserRouter>
      <Copyright sx={{ mt: 2,mb:2}} />
    </div>
  );
}

export default App;