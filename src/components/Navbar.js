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



export default function NavBar(){
  let [anchorElUser, setAnchorElUser] = useState(false)
  let [isProfileVisible, setIsProfileVisible] = useState(localStorage.getItem('user') !== undefined && localStorage.getItem('user').length !== 0)
  let anchorRef = useRef(null);

  
  useEffect(()=>{
    window.addEventListener('storage', (e)=>{
      setIsProfileVisible(localStorage.getItem('user').length !== 0)
    })
  },[])
  const settings = ['Profile', 'Dashboard', 'Logout'];
  const handleOpenUserMenu = () => {
    setAnchorElUser(true);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(false);
  };
  return (
      
      <AppBar position="static" style={{ background: '#ffffff' }}>
       
          <Toolbar>
            <Typography>
              <Link href="/">
                <img src={partypadWords} style={{height: "68px", width:"68px"}}/>
              </Link>
            </Typography>
            { isProfileVisible && <Box sx={{
              display: { xs: "none", md: "flex" }
            }}
            style={{
              justifyContent:"flex-end",
                alignItems:"flex-end",
                marginLeft: "auto"
            }}
            >
            <Tooltip>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>}
          </Toolbar>
         </AppBar>
        

  )

}