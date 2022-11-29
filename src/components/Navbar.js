import React, { useEffect, useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import partypadWords from '../img/partypadWords.png'
import Link from '@mui/material/Link';
import Session from "react-session-api";
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import MailIcon from '@mui/icons-material/Mail';
import Badge from '@mui/material/Badge';



export default function NavBar() {
  let [anchorElUser, setAnchorElUser] = useState(false)
  let [isProfileVisible, setIsProfileVisible] = useState(localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0)
  let [chatCount, setChatCount] = useState(0)
  let anchorRef = useRef(null);
  let inboxInterval = null;

  useEffect(() => {
    if (localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0) {
      getInboxCount()
      inboxInterval = setInterval(getInboxCount, 60000)
    }
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function (key, value) {
      const event = new Event('itemInserted');

      event.value = value; // Optional..
      event.key = key; // Optional..

      document.dispatchEvent(event);

      originalSetItem.apply(this, arguments);
    };

    const localStorageSetHandler = function (e) {
      setIsProfileVisible(localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0)
      if (localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0) {
        getInboxCount()
        inboxInterval = setInterval(getInboxCount, 60000)
      }
    };

    document.addEventListener("itemInserted", localStorageSetHandler, false);

  }, [])
  const getInboxCount = () => {
    axios.post(process.env.REACT_APP_VM_IP + "/app/Retrieve_Inbox_Count", {
      email: localStorage.getItem('user')
    }).then((res) => {
      if (res.data.status === "OK") {
        setChatCount(res.data.data.total_unread_messages)
      } else {
        setChatCount(0)
      }
    }).catch(e => {
      console.log("Server Error")
    })
  }
  const redirect = (e) => {
    console.log(e.target.id)
    if (e.target.id === "Profile") {
      window.location.href = "/profile"
    } else if (e.target.id === "Logout") {
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      clearInterval(inboxInterval)
      setAnchorElUser(false);
      window.location.href = "/"
    } else if (e.target.id === "Search") {
      window.location.href = "/browser"
    }
    else if (e.target.id === "inbox" || e.target.id === "inbox1" || e.target.id === "inbox0") {
      window.location.href = "/inbox"
    }else if(e.target.id === "Bookmarks"){
      window.location.href = "/bookmark"
    }else if(e.target.id === "Add Venue"){
      window.location.href = "/addvenue"
    }else if(e.target.id === "Manage Venues"){
      window.location.href = "/managevenue"
    }else if(e.target.id === "Dashboard"){
      window.location.href = "/dashboard"
    }else if(e.target.id === "Manage Bookings"){
      window.location.href = "/booking"
    }else if(e.target.id === "login"){
      window.location.href = "/login"
    }else if(e.target.id === "register"){
      window.location.href = "/register"
    }
  }
  const settings = ['Profile', 'Logout'];
  const owner_pages = ['Dashboard', 'Add Venue', 'Manage Venues', 'Manage Bookings'];
  const user_pages = ['Dashboard', 'Search', 'Bookmarks', 'Manage Bookings'];
  const handleOpenUserMenu = () => {
    setAnchorElUser(true);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(false);
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="static" style={{ background: '#ffffff' }} component="nav">

        <Toolbar>
          <Typography>
            <Link href="/">
              <img src={partypadWords} style={{ height: "68px", width: "68px" }} />
            </Link>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} justifyContent="flex-end"
            alignItems="flex-end">
            {!isProfileVisible && <><MenuItem onClick={redirect} >
                <Typography textAlign="center" id="login" style={{ color: 'black' }}>Login</Typography>
              </MenuItem>
              <MenuItem onClick={redirect} >
              <Typography textAlign="center" id="register" style={{ color: 'black' }}>Register</Typography>
            </MenuItem></>}

            {isProfileVisible && localStorage.getItem('role') !== null && localStorage.getItem('role') === "Member" && user_pages.map((page) => (
              <MenuItem key={page} onClick={redirect} >
                <Typography textAlign="center" id={page} style={{ color: 'black' }}>{page}</Typography>
              </MenuItem>
            ))}
            {isProfileVisible && localStorage.getItem('role') !== null && localStorage.getItem('role') === "Owner" && owner_pages.map((page) => (
              <MenuItem key={page} onClick={redirect} >
                <Typography textAlign="center" id={page} style={{ color: 'black' }}>{page}</Typography>
              </MenuItem>
            ))}
            {isProfileVisible && <><MenuItem onClick={redirect} id="inbox0">
              <Badge badgeContent={chatCount} color="error" id="inbox1">
                <MailIcon style={{ color: 'black' }} id="inbox" />
              </Badge>

            </MenuItem>
              <Tooltip sx={{ p: 0 }}>
                <IconButton onClick={handleOpenUserMenu}>
                  {localStorage.getItem('user') !== null &&
                    <Avatar alt={localStorage.getItem('user').toLocaleUpperCase()} />}
                </IconButton>
              </Tooltip>

              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorRef}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={anchorElUser}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={redirect} >
                    <Typography textAlign="center" id={setting}>{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu></>}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>


  )

}