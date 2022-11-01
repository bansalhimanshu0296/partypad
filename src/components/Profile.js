import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Box } from "@mui/system";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { Button } from "@mui/material";
import { validName } from "./validation";
import { Typography } from "@mui/material";
import { checkIfNumber } from "./validation";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Rating from '@mui/material/Rating';


const Alert = React.forwardRef ((
    props,
    ref,
  ) =>{
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  

export default function Profile(){
    let [fname, setFname] = useState("");
    let [lname, setLname] = useState("");
    let [addressLine1, setaddressLine1] = useState("");
    let [addressLine2, setaddressLine2] = useState("");
    let [states, setStates] = useState([{value:"", label:"--"}])
    let [state, setState] = useState("")
    let [cities, setCities] = useState([{value:"", label:"--"}])
    let [city, setCity] = useState("")
    let [zips, setZips] = useState([{value:"", label:"--"}])
    let [zip, setZip] = useState("")
    let [phone, setPhone] = useState("")
    let [bio, setBio] = useState("")
    let [gender, setGender] = useState("")
    let [update, setUpdate] = useState(false)
    let [openState, setOpenState] = useState(false)
    let [openCity, setOpenCity] = useState(false)
    let [openZip, setOpenZip] = useState(false)
    let [openGender, setOpenGender] = useState(false)
    let [firstNameError, setFirstNameError] = useState(false)
    let [firstNameErrorMessage, setFirstNameErrorMessage] = useState("")
    let [lastNameError, setLastNameError] = useState(false)
    let [lastNameErrorMessage, setLastNameErrorMessage] = useState("")
    let [isSnackBarOpen, setIsSnackBarOpen] = useState(false)
    let [isSuccessSnackBarOpen, setIsSuccessSnackBarOpen] = useState(false)
    let [errorMessage, setErrorMessage] = useState("")
    let rating=0
    let navigate = useNavigate();
    useEffect(()=>{
        if(localStorage.getItem('user') === undefined || localStorage.getItem('user').length===0){
            navigate("/")
        }
        if(localStorage.getItem('role') === "Member"){
            navigate("/browser")
        }
        let user =  localStorage.getItem('user')
        axios.get("https://parseapi.back4app.com/classes/Usstatesdataset_States?keys=postalAbreviation",{
            headers: {
                'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
                'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
              }
        }).then(res=>{
            if(res.status === 200){
              let state_arr = [{value:"", label:"--"}]
              res.data.results.map(element=> state_arr.push({value:element.postalAbreviation, label:element.postalAbreviation}))
              setStates(state_arr)
            }else{
              let state_arr = [{value:"", label:"--"}]
              setStates(state_arr)
              console.log("Server Error")
            }
        }).catch(e=>{
          let state_arr = [{value:"", label:"--"}]
          setStates(state_arr)
          console.log("Server Error")
        })
        let state = ""
        let city = ""
        axios.post("http://"+process.env.REACT_APP_VM_IP+":8000/app/Fetch_Profile",{
            email: user
        }).then(res=>{
            if(res.data.status === "OK"){
                setFname(res.data.data.firstName);
                setLname(res.data.data.lastName)
                setBio(res.data.data.profileBio);
                setGender(res.data.data.profileGender)
                setaddressLine1(res.data.data.profileAddressLine1)
                setaddressLine1(res.data.data.profileAddressLine2)
                setState(res.data.data.profileAddressState)
                state = res.data.data.profileAddressState
                setCity(res.data.data.profileAddressCity)
                city = res.data.data.profileAddressCity
                rating = res.data.data.profileRating
                setZip(res.data.data.profileAddressZip)
                if(res.data.data.profilePhone !== null){
                    setPhone(res.data.data.profilePhone)
                }
                if(state!==""){
                    axios.get("https://parseapi.back4app.com/classes/Usabystate_"+state+"?limit=1500&keys=name",{
                    headers: {
                    'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
                    'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
                    }
                }).then(res=>{
              if(res.status === 200){
                let city_arr = [{value:"", label:"--"}]
                res.data.results.map(element=> city_arr.push({value:element.name, label:element.name}))
                setCities(city_arr)
                if(state !== "" && city !==""){
                    const where = encodeURIComponent(JSON.stringify({
                        "Primary_city": city,
                        "State": state
                    }));
                    axios.get(`https://parseapi.back4app.com/classes/US_Zip_Code?keys=US_Zip_Code&where=${where}`,{
                        headers: {
                            'X-Parse-Application-Id': 'aE79wHM9EudKOTLWVaIJ1hR0hygU4CAVGvGfetjP', // This is the fake app's application id
                            'X-Parse-Master-Key': 'An2S02k3ly1LioZ0AQaKbKsafGnIe8IOrXTooFSn',
                        }
                    }).then(res=>{
                        if(res.status ===200)
                        {let zip_array = [{value:"", label:"--"}]
                        res.data.results.map(element=> zip_array.push({value:element.US_Zip_Code, label:element.US_Zip_Code}))
                        setZips(zip_array)}
                        else{
                            let zip_array = [{value:"", label:"--"}]
                            setZips(zip_array)
                            console.log("Server Error")
                        }
                    }).catch(e=>{
                        let zip_array = [{value:"", label:"--"}]
                        setZips(zip_array)
                        console.log("Server Error")
                    })
                }
                
              }else{
                let city_arr = [{value:"", label:"--"}]
                setCities(city_arr)
                
                console.log("Server Error")
              }
            }).catch(e=>{
              let city_arr = [{value:"", label:"--"}]
              setCities(city_arr)
              
              console.log("Server Error")
            })
            }
            }else{
                console.log('Server Error')
            }
        }).catch(e=>{
            console.log('Server Error')
        })
        
    
    },[])
    const handleClose = () => {
        setOpenState(false);
      };
    
      const handleOpen = () => {
        setOpenState(true);
      };
    const handleStateChange =(e) =>{
        setState(e.target.value)
   if(e.target.value === ""){
     setCities([{value:"", label:"--"}])
     setCity("")
     setZips([{value:"", label:"--"}])
     setZip("")
   }else{
    axios.get("https://parseapi.back4app.com/classes/Usabystate_"+e.target.value+"?limit=1500&keys=name",{
      headers: {
          'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
          'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
        }
    }).then(res=>{
      if(res.status === 200){
        let city_arr = [{value:"", label:"--"}]
        res.data.results.map(element=> city_arr.push({value:element.name, label:element.name}))
        setCities(city_arr)
        setCity("")
      }else{
        let city_arr = [{value:"", label:"--"}]
        setCities(city_arr)
        setCity("")
        setZips([{value:"", label:"--"}])
     setZip("")
        console.log("Server Error")
      }
    }).catch(e=>{
      let city_arr = [{value:"", label:"--"}]
      setCities(city_arr)
      setCity("")
      setZips([{value:"", label:"--"}])
     setZip("")
      console.log("Server Error")
    })
   }

    }

    const handleCloseCity = () => {
        setOpenCity(false);
      };
    
      const handleOpenCity = () => {
        setOpenCity(true);
      };
      const handleCityChange =(e) =>{
          setCity(e.target.value)
          if(e.target.value === ""){
            setZips([{value:"", label:"--"}])
            setZip("")
          }else{
            const where = encodeURIComponent(JSON.stringify({
                "Primary_city": e.target.value,
                "State": state
              }));
            axios.get(`https://parseapi.back4app.com/classes/US_Zip_Code?keys=US_Zip_Code&where=${where}`,{
                headers: {
                    'X-Parse-Application-Id': 'aE79wHM9EudKOTLWVaIJ1hR0hygU4CAVGvGfetjP', // This is the fake app's application id
                    'X-Parse-Master-Key': 'An2S02k3ly1LioZ0AQaKbKsafGnIe8IOrXTooFSn',
                  }
              }).then(res=>{
                if(res.status === 200){
                  let zip_arr = [{value:"", label:"--"}]
                  res.data.results.map(element=> zip_arr.push({value:element.US_Zip_Code, label:element.US_Zip_Code}))
                  setZips(zip_arr)
                  setZip("")
                }else{
                  setZips([{value:"", label:"--"}])
               setZip("")
                  console.log("Server Error")
                }
              }).catch(e=>{
                setZips([{value:"", label:"--"}])
               setZip("")
                console.log("Server Error")
              })
             }

    }
    const handleCloseZip = () => {
        setOpenZip(false);
      };
    
      const handleOpenZip = () => {
        setOpenZip(true);
      };
    const onChangePhone = (e) =>{
        if(checkIfNumber(e.target.value) & (e.target.value.length<=10)){
            setPhone(e.target.value)
        }

    }
    const onUpdate = () =>{
        if(!update){
            setUpdate(true)
        }else{
            // if(phone.length === 0){
            //     phone = 0
            // }
            const body={
                email:localStorage.getItem('user'),
                firstName:fname,
                lastName:lname,
                profileAddressLine1: addressLine1,
                profileAddressLine2: addressLine2,
                profileAddressCity: city,
                profileAddressState: state,
                profileAddressZip: zip,
                profileGender: gender,
                profilePhone: phone,
                profileDob: null,
                profileRating: rating,
                profileBio: ""
            }
            console.log(body)
            axios.post("http://"+process.env.REACT_APP_VM_IP+":8000/app/Add_Profile",body).then(res =>{
                
                if(res.data.status === "OK"){
                    setErrorMessage("Information for user updated")
                    setIsSuccessSnackBarOpen(true)
                    setUpdate(false)
                }else{
                    setErrorMessage("Server Error")
                    setIsSnackBarOpen(true)
                    setUpdate(false)
                }
            }).catch(e=>{
                console.log("Server Error")
            })
        }
    }
    const onChangeFirstName = (e) =>{
        setFname(e.target.value)
        if(validName(e.target.value) || e.target.value.length === 0){
            setFirstNameErrorMessage("")
            setFirstNameError(false)
        }else{
          setFirstNameErrorMessage("Only Alpha Characters Allowed")
          setFirstNameError(true)
        }
    }
    const onChangeLastName = (e) =>{
        setLname(e.target.value)
        if(validName(e.target.value) || e.target.value.length === 0){
            setLastNameErrorMessage("")
            setLastNameError(false)
        }else{
          setLastNameErrorMessage("Only Alpha Characters Allowed")
          setLastNameError(true)
        }
    
      }
    const onCloseSnackBar = () =>{
        setIsSnackBarOpen(false)
    }
    const onCloseSuccessSnackBar = () =>{
        setIsSuccessSnackBarOpen(false)
    }
    
    let isButtonDisabled = !(fname.length!==0 && !firstNameError && lname.length!==0 && !lastNameError && (phone.length === 0 || phone.length === 10))
    return(
        <Box style={{paddingTop:"5vh"}}>
       <Snackbar open={isSnackBarOpen} autoHideDuration={6000} anchorOrigin ={{vertical: 'top', horizontal: 'center'}} onClose={onCloseSnackBar}>
        <Alert onClose={onCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
            <Snackbar open={isSuccessSnackBarOpen} autoHideDuration={6000} anchorOrigin ={{vertical: 'top', horizontal: 'center'}} onClose={onCloseSuccessSnackBar}>
        <Alert onClose={onCloseSuccessSnackBar} severity="success" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
            <Container>
            <div style={{paddingBottom:"5vh"}}>
            <Typography component="h1" variant="h5" >
                Profile Information
            </Typography>
            <Rating value={rating} readOnly/>
            </div>
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
                  onChange = {onChangeFirstName}
                  error = {firstNameError}
                  value = {fname}
                  helperText = {firstNameErrorMessage}
                  disabled = {!update}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="family-name"
                  name="lastName"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  autoFocus
                  onChange = {onChangeLastName}
                  error = {lastNameError}
                  value = {lname}
                  helperText = {lastNameErrorMessage}
                  disabled = {!update}
                />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <TextField
                    margin="normal"
                    
                    fullWidth
                    value={addressLine1}
                    onChange = {(e) => setaddressLine1(e.target.value)}
                    disabled = {!update}
                    id="addressline1"
                    label="Address Line 1"
                    />            
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <TextField
                    margin="normal"
                    
                    fullWidth
                    value={addressLine2}
                    onChange = {(e) => setaddressLine2(e.target.value)}
                    disabled = {!update}
                    id="addressline2"
                    label="Address Line 2"
                    />            
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <InputLabel id="demo-controlled-open-select-label">State</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openState}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        value={state}
                        label="State"
                        onChange={handleStateChange}
                        disabled={!update}
                    >
                        {states.map((stateName,idx)=>(
                            <MenuItem value={stateName.value} key={idx}>{stateName.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>         
                </Grid>
                <Grid item xs={12} sm={4}>
                <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <InputLabel id="demo-controlled-open-select-label">City</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openCity}
                        onClose={handleCloseCity}
                        onOpen={handleOpenCity}
                        value={city}
                        label="City"
                        onChange={handleCityChange}
                        disabled={!update}
                    >
                        {cities.map((stateName,idx)=>(
                            <MenuItem value={stateName.value} key={idx}>{stateName.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>         
                </Grid>
                <Grid item xs={12} sm={4}>
                <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <InputLabel id="demo-controlled-open-select-label">Zip</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openZip}
                        onClose={handleCloseZip}
                        onOpen={handleOpenZip}
                        value={zip}
                        label="Zip"
                        onChange={(e)=>setZip(e.target.value)}
                        disabled={!update}
                    >
                        {zips.map((stateName,idx)=>(
                            <MenuItem value={stateName.value} key={idx}>{stateName.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>         
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <TextField
                    margin="normal"
                    fullWidth
                    value={phone}
                    onChange = {onChangePhone}
                    disabled = {!update}
                    id="phone"
                    label="Phone Number"
                    />            
                </Grid>
                <Grid item xs={12} sm={4} style={{marginTop:"auto"}}>
                <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <InputLabel id="demo-controlled-open-select-label">Gender</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openGender}
                        onClose={()=>setOpenGender(false)}
                        onOpen={()=>setOpenGender(true)}
                        value={gender}
                        label="Gender"
                        onChange={(e)=>setGender(e.target.value)}
                        disabled={!update}
                    > 
                    <MenuItem value="">--</MenuItem>
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    </Select>
                </FormControl>       
                </Grid>
            </Grid>
            {/* <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                 
                </Grid>
            </Grid> */}
            <Grid container spacing={2}>
                <Grid item xs={10} sm={10}>
                 
                </Grid>
                <Grid item xs={2} sm={2}>
                <Button
                fullWidth
                variant="contained"
                disabled={isButtonDisabled}
                onClick ={onUpdate}
                >
                    Update
                </Button>
                 
                </Grid>

            </Grid>

            </Container>
        </Box>
    )

}