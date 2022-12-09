import React from 'react';
import { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ReCAPTCHA from 'react-google-recaptcha'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { validEmail, singleNumber, validPassword, matchPassword } from './validation';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { useNavigate } from "react-router-dom";
import bcrypt from 'bcryptjs';

const Alert = React.forwardRef((
  props,
  ref,
) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const theme = createTheme();

export default function PasswordRecovery(props) {
  let [userName, setUserName] = useState("")
  let [userNameError, setUserNameError] = useState(false)
  let [userNameErrorMessage, setUserNameErrorMessage] = useState("")
  let [isCaptchaVerfied, setIsCapthaVerified] = useState(false)
  let [isSnackBarOpen, setIsSnackBarOpen] = useState(false)
  let [isSuccessSnackBarOpen, setIsSuccessSnackBarOpen] = useState(false)
  let [errorMessage, setErrorMessage] = useState("")
  let [isForm, setIsForm] = useState(true)
  let [number1, setNumber1] = useState("")
  let [number2, setNumber2] = useState("")
  let [number3, setNumber3] = useState("")
  let [number4, setNumber4] = useState("")
  let [number5, setNumber5] = useState("")
  let [number6, setNumber6] = useState("")
  let [isPasswordForm, setIsPasswordForm] = useState(false)
  let [password, setPassword] = useState("")
  let [passwordError, setPasswordError] = useState(false)
  let [passwordErrorMessage, setPasswordErrorMessage] = useState("")
  let [confirmPassword, setConfirmPassword] = useState("")
  let [confirmPasswordError, setConfirmPasswordError] = useState(false)
  let [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("")
  let captchaRef = useRef(null);
  const navigate = useNavigate();
  const onSubmit = () => {
    if(localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0){
      navigate("/dashboard")
    }
    
    if (isCaptchaVerfied || captchaRef === null) {
      axios.post(process.env.REACT_APP_VM_IP + "/app/Recover_Password", {
        email: userName
      }).then(res => {
        if (res.data.status === "OK") {
          setIsForm(false)
          // setMessage("A link is sent to registered email ID. Click it to recover Password")
        }
        else if (res.data.status === "FAIL") {
          setErrorMessage("Email ID doesn't Exist. Please Check Again.")
          setIsSnackBarOpen(true)
        }
        else {
          setErrorMessage("Server Error")
          setIsSnackBarOpen(true)
        }
      }).catch(e => {
        setErrorMessage("Server Error")
        setIsSnackBarOpen(true)
      })

    } else {
      setErrorMessage("Please verify the captcha")
      setIsSnackBarOpen(true)
    }

  }
  const onResend = () => {
    axios.post(process.env.REACT_APP_VM_IP + "/app/Recover_Password", {
      email: userName
    }).then(res => {
      if (res.data.status === "OK") {
        setErrorMessage("Code has been resent to your Email ID.")
        setIsSuccessSnackBarOpen(true)
      }
      else if (res.data.status === "FAIL") {
        setErrorMessage("Email ID doesn't Exist. Please Check Again.")
        setIsSnackBarOpen(true)
      }
      else {
        setErrorMessage("Server Error")
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
    })

  }

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

  const onCloseSnackBar = () => {
    setIsSnackBarOpen(false)
  }
  const onCloseSuccessSnackBar = () => {
    setIsSuccessSnackBarOpen(false)
  }
  const onChangeNumber1 = (e) => {
    if (singleNumber(e.target.value)) {
      setNumber1(e.target.value)
    }
  }
  const onChangeNumber2 = (e) => {
    if (singleNumber(e.target.value)) {
      setNumber2(e.target.value)
    }
  }
  const onChangeNumber3 = (e) => {
    if (singleNumber(e.target.value)) {
      setNumber3(e.target.value)
    }
  }
  const onChangeNumber4 = (e) => {
    if (singleNumber(e.target.value)) {
      setNumber4(e.target.value)
    }
  }
  const onChangeNumber5 = (e) => {
    if (singleNumber(e.target.value)) {
      setNumber5(e.target.value)
    }
  }
  const onChangeNumber6 = (e) => {
    if (singleNumber(e.target.value)) {
      setNumber6(e.target.value)
    }
  }
  const onCheckSubmit = () => {
    let number = number1 + number2 + number3 + number4 + number5 + number6
    axios.post(process.env.REACT_APP_VM_IP + "/app/Verify_Email", {
      email: userName,
      code: number
    }).then(res => {
      if (res.data.status === "OK") {
        setIsPasswordForm(true)
      }
      else if (res.data.status === "FAIL") {
        setErrorMessage("Invalid Code. Please Check Again.")
        setIsSnackBarOpen(true)
      }
      else {
        setErrorMessage("Server Error")
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
    })
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
  const onSubmitPassword = () => {
    let encrypt_password = bcrypt.hashSync(password, "$2a$10$CwTycUXWue0Thq9StjUM0u")
    axios.post( process.env.REACT_APP_VM_IP + ":8000/app/Update_Password", {
      email: userName,
      password: encrypt_password
    }).then(res => {
      if (res.data.status === "OK") {
        setErrorMessage("Password Change Successfully")
        setIsSuccessSnackBarOpen(true)
      }
      else {
        setErrorMessage("Server Error")
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
    })
  }
  const onSuccessfullPasswordSnackBarClose = () => {
    navigate("/")
  }
  let isButtonDisabled = !(userName.length !== 0 && !userNameError);
  let isCheckButtonDisabled = !(number1.length !== 0 && number2.length !== 0 && number3.length !== 0 && number4.length !== 0 && number5.length !== 0 && number6.length !== 0);
  let isSubmitPasswordButtonDisabled = !(password.length !== 0 && confirmPassword.length !== 0 && !passwordError && !confirmPasswordError);
  return (
    <ThemeProvider theme={theme}>
      <Snackbar open={isSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSnackBar}>
        <Alert onClose={onCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      {!isForm && !isPasswordForm && (<Snackbar open={isSuccessSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSuccessSnackBar}>
        <Alert onClose={onCloseSuccessSnackBar} severity="success" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>)}
      {isPasswordForm && <Snackbar open={isSuccessSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onSuccessfullPasswordSnackBarClose}>
        <Alert onClose={onSuccessfullPasswordSnackBarClose} severity="success" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>}

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
          <Typography component="h1" variant="h5">
            Recover Password
          </Typography>
          {!isForm && !isPasswordForm && (<div>
            A code is sent to your registered Email ID which will be valid for 5 minutes. Please Enter the code below.
          </div>)}
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {isForm && (<div>
              <TextField
                margin="normal"
                required
                fullWidth
                value={userName}
                onChange={onChangeUserName}
                id="username"
                label="Email ID"
                error={userNameError}
                helperText={userNameErrorMessage}
              />
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
                Submit
              </Button>
            </div>)}
            {isPasswordForm && (<div>
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
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={onSubmitPassword}
                disabled={isSubmitPasswordButtonDisabled}
              >
                Submit
              </Button>
            </div>)}
            {!isForm && !isPasswordForm && (<div>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={2}>
                  <TextField
                    name="number1"
                    required
                    fullWidth
                    id="number1"
                    autoFocus
                    onChange={onChangeNumber1}
                    value={number1}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    id="number2"
                    name="number2"
                    onChange={onChangeNumber2}
                    value={number2}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    id="number3"
                    name="number3"
                    onChange={onChangeNumber3}
                    value={number3}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    id="number4"
                    name="number4"
                    onChange={onChangeNumber4}
                    value={number4}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    id="number5"
                    name="number5"
                    onChange={onChangeNumber5}
                    value={number5}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    id="number6"
                    name="number6"
                    onChange={onChangeNumber6}
                    value={number6}
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={onCheckSubmit}
                disabled={isCheckButtonDisabled}
              >
                Submit
              </Button>
              <Link align="center" onClick={onResend}>Resend Code</Link>
            </div>
            )}
          </Box>
        </Box>

      </Container>
    </ThemeProvider>
  );

}