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
import { useGoogleLogin } from "@react-oauth/google";
import { validName, matchPassword, validEmail, validPassword } from './validation';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useNavigate } from "react-router-dom";

const Alert = React.forwardRef((
  props,
  ref,
) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const theme = createTheme();

export default function Register() {
  let [firstName, setFirstName] = useState("")
  let [firstNameError, setFirstNameError] = useState(false)
  let [firstNameErrorMessage, setFirstNameErrorMessage] = useState("")
  let [lastName, setLastName] = useState("")
  let [lastNameError, setLastNameError] = useState(false)
  let [lastNameErrorMessage, setLastNameErrorMessage] = useState("")
  let [userName, setUserName] = useState("")
  let [userNameError, setUserNameError] = useState(false)
  let [userNameErrorMessage, setUserNameErrorMessage] = useState("")
  let [password, setPassword] = useState("")
  let [passwordError, setPasswordError] = useState(false)
  let [passwordErrorMessage, setPasswordErrorMessage] = useState("")
  let [confirmPassword, setConfirmPassword] = useState("")
  let [confirmPasswordError, setConfirmPasswordError] = useState(false)
  let [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("")
  let [isCaptchaVerfied, setIsCapthaVerified] = useState(false)
  let [isSnackBarOpen, setIsSnackBarOpen] = useState(false)
  let [errorMessage, setErrorMessage] = useState("")
  let [userWPType, setUserWPType] = useState("Member")
  let [userOAType, setUserOAType] = useState("Member")
  let [isSuccessSnackBarOpen, setisSuccessSnackBarOpen] = useState(false)
  let captchaRef = useRef(null)
  const navigate = useNavigate()
  useEffect(()=>{
    if (localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0) {
      navigate("/dashboard")
    }
  },[])
  const onSubmit = () => {
    if (isCaptchaVerfied || captchaRef === null) {
      let encrypt_password = bcrypt.hashSync(password, "$2a$10$CwTycUXWue0Thq9StjUM0u")
      axios.post(process.env.REACT_APP_VM_IP + "/app/Add_New_User", {
        email: userName,
        password: encrypt_password,
        firstName: firstName,
        lastName: lastName,
        role: userWPType,
        loginType: "WebPage"

      }).then(res => {
        if (res.data.status === "OK") {
          setErrorMessage("Successfully Registered")
          setisSuccessSnackBarOpen(true)
        }
        else if (res.data.status === "FAIL") {
          setErrorMessage("User already exist")
          setIsSnackBarOpen(true)
        }
        else {
          setErrorMessage("Server Error")
          setIsSnackBarOpen(true)
        }
      }).catch((e) => {
        setErrorMessage("Server Error")
        setIsSnackBarOpen(true)
        console.log(e)
      })

    } else {
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
          if (res.status === 200) {
            axios.post(process.env.REACT_APP_VM_IP + "/app/Add_New_User", {
              email: res.data.email,
              password: "",
              role: userOAType,
              firstName: res.data.given_name,
              lastName: res.data.family_name,
              loginType: "OAuth"

            }).then(res => {
              if (res.data.status === "OK") {
                setErrorMessage("Successfully Registered")
                setisSuccessSnackBarOpen(true)
              }
              else if (res.data.status === "FAIL") {
                setErrorMessage("User already exist")
                setIsSnackBarOpen(true)
              }
              else {
                setErrorMessage("Server Error")
                setIsSnackBarOpen(true)
              }
            }).catch((e) => {
              setErrorMessage("Server Error")
              setIsSnackBarOpen(true)
              console.log(e)
            })
          }
        });
    },
  });
  const onChange = (token) => {
    if (token == null) {
      setIsCapthaVerified(false)
    } else {
      setIsCapthaVerified(true)
    }
  }
  const onChangeUserName = (e) => {
    setUserName(e.target.value)
    if (validEmail(e.target.value) || e.target.value.length === 0) {
      setUserNameErrorMessage("")
      setUserNameError(false)
    } else {
      setUserNameErrorMessage("Invalid Email")
      setUserNameError(true)
    }

  }
  const onChangeFirstName = (e) => {
    setFirstName(e.target.value)
    if (validName(e.target.value) || e.target.value.length === 0) {
      setFirstNameErrorMessage("")
      setFirstNameError(false)
    } else {
      setFirstNameErrorMessage("Only Alpha Characters Allowed")
      setFirstNameError(true)
    }

  }
  const onChangeLastName = (e) => {
    setLastName(e.target.value)
    if (validName(e.target.value) || e.target.value.length === 0) {
      setLastNameErrorMessage("")
      setLastNameError(false)
    } else {
      setLastNameErrorMessage("Only Alpha Characters Allowed")
      setLastNameError(true)
    }

  }
  const onChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value)
    if (matchPassword(password, e.target.value) || e.target.value.length === 0) {
      setConfirmPasswordErrorMessage("")
      setConfirmPasswordError(false)
    } else {
      setConfirmPasswordErrorMessage("Must be same as Password")
      setConfirmPasswordError(true)
    }
  }
  const onChangePassword = (e) => {
    setPassword(e.target.value)
    if (validPassword(e.target.value) || e.target.value.length === 0) {
      setPasswordErrorMessage("")
      setPasswordError(false)
    } else {
      setPasswordErrorMessage("Password should be of atleast 8 length, 1 Upper, 1 lower character, 1 number and 1 special character")
      setPasswordError(true)
    }

  }
  const onChangeWPUser = (e) => {
    setUserWPType(e.target.value)
  }
  const onChangeOAUser = (e) => {
    setUserOAType(e.target.value)
  }
  const onCloseSnackBar = () => {
    setIsSnackBarOpen(false)
  }

  const onCloseSuccessSnackBar = () => {
    navigate("/")
  }
  let isButtonDisabled = !(userName.length !== 0 && password.length !== 0 && firstName.length !== 0 && lastName.length !== 0 && confirmPassword.length !== 0 && !firstNameError && !lastNameError && !confirmPasswordError && !userNameError && !passwordError);
  return (
    <ThemeProvider theme={theme}>
      <Snackbar open={isSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSnackBar}>
        <Alert onClose={onCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={isSuccessSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSuccessSnackBar}>
        <Alert onClose={onCloseSuccessSnackBar} severity="success" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          style ={{height: "81.5vh", overflowY:"scroll"}}
          className="register"
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  onChange={onChangeFirstName}
                  error={firstNameError}
                  value={firstName}
                  helperText={firstNameErrorMessage}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  onChange={onChangeLastName}
                  error={lastNameError}
                  value={lastName}
                  helperText={lastNameErrorMessage}
                />
              </Grid>
            </Grid>
            <TextField
              margin="normal"
              required
              fullWidth
              value={userName}
              onChange={onChangeUserName}
              id="email"
              label="Email ID"
              error={userNameError}
              helperText={userNameErrorMessage}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={password}
              onChange={onChangePassword}
              name="password"
              label="Password"
              type="password"
              id="password"
              error={passwordError}
              helperText={passwordErrorMessage}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={confirmPassword}
              onChange={onChangeConfirmPassword}
              name="confirmpassword"
              label="Confirm Password"
              type="password"
              id="confirmpassword"
              error={confirmPasswordError}
              helperText={confirmPasswordErrorMessage}
            />
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              onChange={onChangeWPUser}
              value={userWPType}
            >

              <FormControlLabel value="Member" control={<Radio />} label="Member" />
              <FormControlLabel value="Owner" control={<Radio />} label="Venue Owner" />

            </RadioGroup>
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={onChange}
              ref={captchaRef}
              style={{ width: "100%" }}

            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={onSubmit}
              disabled={isButtonDisabled}
            >
              Sign Up
            </Button>
            <Divider sx={{ my: 3 }} >
              OR
            </Divider>

            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              onChange={onChangeOAUser}
              value={userOAType}
            >

              <FormControlLabel value="Member" control={<Radio />} label="Member" />
              <FormControlLabel value="Owner" control={<Radio />} label="Venue Owner" />

            </RadioGroup>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={googleLogin}

            >
              Sign Up with Google
            </Button>
            <Grid container>
              <Grid item xs>

              </Grid>
              <Grid item>
                <Link href="/login" variant="body2">
                  {"Already have an account? Sign In"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>

      </Container>
    </ThemeProvider>
  );
}