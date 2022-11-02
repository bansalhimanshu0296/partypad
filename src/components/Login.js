import React, { useEffect } from 'react';
import { useState, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import bcrypt from 'bcryptjs';
import ReCAPTCHA from 'react-google-recaptcha'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import {useGoogleLogin} from "@react-oauth/google";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Session from "react-session-api";
import { useNavigate } from 'react-router';


const Alert = React.forwardRef ((
  props,
  ref,
) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const theme = createTheme();

export default function Login() {
  let [userName, setUserName] =  useState("")
  let [password, setPassword] = useState("")
  let [isCaptchaVerfied, setIsCapthaVerified] = useState(false)
  let [isSnackBarOpen, setIsSnackBarOpen] = useState(false)
  let [errorMessage, setErrorMessage] = useState("")
  let [userWPType, setUserWPType] = useState("Member")
  let [userOAType, setUserOAType] = useState("Member")
  let captchaRef = useRef(null)
  const navigate = useNavigate()
  

  useEffect(()=>{
    if(localStorage.getItem('user').length !== 0){
      if(localStorage.getItem('role') === "Owner")
        navigate("/profile")
      else
      navigate("/browser")
    }
  })
  const onSubmit = () =>{
    if(isCaptchaVerfied || captchaRef === null){
        let encrypt_password = bcrypt.hashSync(password, "$2a$10$CwTycUXWue0Thq9StjUM0u")
        axios.post("https://cors-everywhere.herokuapp.com/http://" +process.env.REACT_APP_VM_IP+":8000/app/Submit_Login",{
          email: userName,
          password: encrypt_password,
          role: userWPType,
          loginType: "WebPage"

        }).then(res=>{
          if(res.data.status === "OK"){
            //Session.set("user", userName)
            //Session.set("role", userWPType)
            localStorage.setItem("user", userName)
            localStorage.setItem("role", userWPType)
            if(userWPType === "Owner")
              navigate("/profile")
            else
              navigate("/browser")
          }
          else if(res.data.status === "FAIL"){
            setErrorMessage("Invalid Credentials(username, password or role)")
            setIsSnackBarOpen(true)
          }
          else{
            setErrorMessage("Server Error")
            setIsSnackBarOpen(true)
          }
        }).catch((e)=>{
          console.log(e)
        })
        
    }else{
      setErrorMessage("Please verify the captcha")
      setIsSnackBarOpen(true)
    }
      
  }
  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      // fetching userinfo can be done on the client or the server
      
      axios
        .get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        .then(res => {
          let user = ""
          if(res.status === 200){
          user = res.data.email
          axios.post("https://cors-everywhere.herokuapp.com/http://"+process.env.REACT_APP_VM_IP+":8000/app/Submit_Login",{
          email: res.data.email,
          password: "",
          role: userOAType,
          loginType: "OAuth"

        }).then(res=>{
          if(res.data.status === "OK"){
            //Session.set("user", user)
            //Session.set("role", userOAType)
            localStorage.setItem("user", user)
            localStorage.setItem("role", userOAType)
            if(userOAType === "Owner")
              navigate("/profile")
            else
            navigate("/browser")
          }
          else if(res.data.status === "FAIL"){
            setErrorMessage("Invalid Credentials(username, password or role)")
            setIsSnackBarOpen(true)
          }
          else{
            setErrorMessage("Server Error")
            setIsSnackBarOpen(true)
          }
        }).catch((e)=>{
          console.log(e)
        })
          }
        });
    },
  });
  const onChange = (token) =>{
    if(token == null){
      setIsCapthaVerified(false)
    }else{
      setIsCapthaVerified(true)
    }
  }
  const onChangeWPUser = (e) =>{
    setUserWPType(e.target.value)
  }
  const onChangeOAUser = (e) =>{
    setUserOAType(e.target.value)
  }
  const onCloseSnackBar = () =>{
    setIsSnackBarOpen(false)
  }
  let isButtonDisabled = !(userName.length!==0 && password.length!==0);
  return (
    <ThemeProvider theme={theme}>
      <Snackbar open={isSnackBarOpen} autoHideDuration={6000} anchorOrigin ={{vertical: 'top', horizontal: 'center'}} onClose={onCloseSnackBar}>
        <Alert onClose={onCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
          
            <TextField
              margin="normal"
              required
              fullWidth
              value={userName}
              onChange = {(e) => setUserName(e.target.value)}
              id="username"
              label="Email ID"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={password}
              onChange = {(e) => setPassword(e.target.value)}
              name="password"
              label="Password"
              type="password"
              id="password"
            />
             <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              onChange = {onChangeWPUser}
              value = {userWPType}
            >

              <FormControlLabel value="Member" control={<Radio />} label="Member" />
              <FormControlLabel value="Owner" control={<Radio />} label="Venue Owner" />
      
            </RadioGroup>
             <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={onChange}
              ref={captchaRef}
              style ={{width: "100%"}}
              
            />
           
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick ={onSubmit}
              disabled ={isButtonDisabled}
            >
              Sign In
            </Button>
            <Divider sx={{ my: 3 }} >
              OR
           </Divider>
           <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              onChange = {onChangeOAUser}
              value = {userOAType}
            >

              <FormControlLabel value="Member" control={<Radio />} label="Member" />
              <FormControlLabel value="Owner" control={<Radio />} label="Venue Owner" />
      
            </RadioGroup>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick ={googleLogin}
            >
              Sign In with Google
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/passwordrecovery" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
       
      </Container>
    </ThemeProvider>
  );
}