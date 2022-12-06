import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { validName, checkIfNumber } from "./validation";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import venue from "../img/venue.jpg"
import { Button } from "@mui/material";
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useLocation, useNavigate } from "react-router-dom";

const Alert = React.forwardRef((
    props,
    ref,
) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const theme = createTheme();

export default function EditVenue() {
    const navigate = useNavigate()
    let [states, setStates] = useState([{ value: "", label: "--" }])
    let [state, setState] = useState("")
    let [propertyName, setPropertyName] = useState("")
    let [rent, setRent] = useState("")
    let [propertySize, setPropertySize] = useState("")
    let [city, setCity] = useState("")
    let [zip, setZip] = useState("")
    let [desc, setDesc] = useState("")
    let [peopleCount, setPeopleCount] = useState("")
    let [propertytype, setPropertyType] = useState("")
    let [types, setTypes] = useState("")
    let [propertyAddress1, setPropertyAddress1] = useState("")
    let [propertyAddress2, setPropertyAddress2] = useState("")
    let [cities, setCities] = useState([{ value: "", label: "--" }])
    let [zips, setZips] = useState([{ value: "", label: "--" }])
    let [image, setImage] = useState([venue, venue, venue, venue, venue, venue, venue, venue])
    let [imageFile, setImageFile] = useState([null, null, null, null, null, null, null, null])
    let [openState, setOpenState] = useState(false)
    let [openCity, setOpenCity] = useState(false)
    let [openZip, setOpenZip] = useState(false)
    let [openType, setOpenType] = useState(false)
    let [render, setRender] = useState(false)
    let [isErrorSnackBarOpen, setIsErrorSnackBarOpen] = useState(false)
    let [isSuccessSnackBarOpen, setIsSuccessSnackBarOpen] = useState(false)
    let [errorMessage, setErrorMessage] = useState("")
    let [isEdit, setIsEdit] = useState(false)
    const props = useLocation().state

    useEffect(() => {
        if (localStorage.getItem('user') === null || localStorage.getItem('user').length === 0) {
            navigate("/")
        }
        if (localStorage.getItem("role") !== "Owner") {
            navigate("/dashboard")
        }
        const venue = props.venue
        setIsEdit(!(props.view === "edit"))
        axios.get("https://parseapi.back4app.com/classes/Usstatesdataset_States?keys=postalAbreviation", {
            headers: {
                'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
                'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
            }
        }).then(res => {
            if (res.status === 200) {
                let state_arr = [{ value: "", label: "--" }]
                res.data.results.map(element => state_arr.push({ value: element.postalAbreviation, label: element.postalAbreviation }))
                setState(venue.Venue_Address.venue_addr_state)
                setStates(state_arr)
            } else {
                let state_arr = [{ value: "", label: "--" }]
                setState("")
                setStates(state_arr)
                setErrorMessage("3rd Party API Server Error")
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            let state_arr = [{ value: "", label: "--" }]
            setState("")
            setStates(state_arr)
            setErrorMessage("3rd Party API Server Error")
            setIsErrorSnackBarOpen(true)
            console.log("Server Error")
        })
        axios.get(process.env.REACT_APP_VM_IP + "/app/Fetch_Venue_Types").then(res => {
            if (res.data.status === "OK") {
                setTypes(res.data.data)
                setPropertyType(venue.Venue.venue_type)
            } else {
                setErrorMessage(res.data.message)
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error")
            setIsErrorSnackBarOpen(true)
            console.log("Server Error")
        })
        if (venue.Venue_Address.venue_addr_state !== "") {
            axios.get("https://parseapi.back4app.com/classes/Usabystate_" + venue.Venue_Address.venue_addr_state + "?limit=1500&keys=name", {
                headers: {
                    'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
                    'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
                }
            }).then(res => {
                if (res.status === 200) {
                    let city_arr = [{ value: "", label: "--" }]
                    res.data.results = res.data.results.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })
                    res.data.results.map(element => city_arr.push({ value: element.name, label: element.name }))
                    setCities(city_arr)
                    setCity(venue.Venue_Address.venue_addr_city)

                } else {
                    let city_arr = [{ value: "", label: "--" }]
                    setCities(city_arr)
                    setCity("")
                    setErrorMessage("3rd Party API Server Error")
                    setIsErrorSnackBarOpen(true)
                }
            }).catch(e => {
                let city_arr = [{ value: "", label: "--" }]
                setCities(city_arr)
                setCity("")
                setErrorMessage("3rd Party API Server Error")
                setIsErrorSnackBarOpen(true)
                console.log("Server Error")
            })
        }
        if (venue.Venue_Address.venue_addr_city !== "") {
            const where = encodeURIComponent(JSON.stringify({
                "Primary_city": venue.Venue_Address.venue_addr_city,
                "State": venue.Venue_Address.venue_addr_state
            }));
            axios.get(`https://parseapi.back4app.com/classes/US_Zip_Code?keys=US_Zip_Code&where=${where}`, {
                headers: {
                    'X-Parse-Application-Id': 'aE79wHM9EudKOTLWVaIJ1hR0hygU4CAVGvGfetjP', // This is the fake app's application id
                    'X-Parse-Master-Key': 'An2S02k3ly1LioZ0AQaKbKsafGnIe8IOrXTooFSn',
                }
            }).then(res => {
                if (res.status === 200) {
                    let zip_arr = [{ value: "", label: "--" }]
                    res.data.results.map(element => zip_arr.push({ value: element.US_Zip_Code, label: element.US_Zip_Code }))
                    setZips(zip_arr)
                    setZip(venue.Venue_Address.venue_addr_zip)
                } else {
                    setZips([{ value: "", label: "--" }])
                    setZip("")
                    setErrorMessage("3rd Party API Server Error")
                    setIsErrorSnackBarOpen(true)
                }
            }).catch(e => {
                setZips([{ value: "", label: "--" }])
                setZip("")
                setErrorMessage("3rd Party API Server Error")
                setIsErrorSnackBarOpen(true)
                console.log("Server Error")
            })
        }
        setPropertyName(venue.Venue.venue_name)
        setRent(venue.Venue.venue_price)
        setPropertySize(venue.Venue.venue_size)
        setPeopleCount(venue.Venue.venue_people_count)
        if (venue.Venue.venue_description !== "NaN")
            setDesc(venue.Venue.venue_description)
        setPropertyAddress1(venue.Venue_Address.venue_addr_line1)
        setPropertyAddress2(venue.Venue_Address.venue_addr_line2)
        for (let i = 0; i < venue.Venue.venue_image.length; i++) {
            image[i] = venue.Venue.venue_image[i]
            fetch(image[i]).then((response) => {
                response.blob().then((blob) => {
                    let name_split = image[i].split("/")
                    imageFile[i] = new File([blob], name_split[name_split.length - 1], { "type": blob.type })
                })
            });
        }
        setRender(true)
    }, [])

    const handleClose = () => {
        setOpenState(false);
    };

    const handleOpen = () => {
        setOpenState(true);
    };
    const handleStateChange = (e) => {
        setState(e.target.value)
        if (e.target.value === "") {
            setCities([{ value: "", label: "--" }])
            setCity("")
            setZips([{ value: "", label: "--" }])
            setZip("")
        } else {
            axios.get("https://parseapi.back4app.com/classes/Usabystate_" + e.target.value + "?limit=1500&keys=name", {
                headers: {
                    'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
                    'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
                }
            }).then(res => {
                if (res.status === 200) {
                    let city_arr = [{ value: "", label: "--" }]
                    res.data.results = res.data.results.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })
                    res.data.results.map(element => city_arr.push({ value: element.name, label: element.name }))
                    setCities(city_arr)
                    setCity("")
                    setZips([{ value: "", label: "--" }])
                    setZip("")
                } else {
                    let city_arr = [{ value: "", label: "--" }]
                    setCities(city_arr)
                    setCity("")
                    setZips([{ value: "", label: "--" }])
                    setZip("")
                    setErrorMessage("3rd Party API Server Error")
                    setIsErrorSnackBarOpen(true)

                }
            }).catch(e => {
                let city_arr = [{ value: "", label: "--" }]
                setCities(city_arr)
                setCity("")
                setZips([{ value: "", label: "--" }])
                setZip("")
                setErrorMessage("3rd Party API Server Error")
                setIsErrorSnackBarOpen(true)
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
    const handleCityChange = (e) => {
        setCity(e.target.value)
        if (e.target.value === "") {
            setZips([{ value: "", label: "--" }])
            setZip("")
        } else {
            const where = encodeURIComponent(JSON.stringify({
                "Primary_city": e.target.value,
                "State": state
            }));
            axios.get(`https://parseapi.back4app.com/classes/US_Zip_Code?keys=US_Zip_Code&where=${where}`, {
                headers: {
                    'X-Parse-Application-Id': 'aE79wHM9EudKOTLWVaIJ1hR0hygU4CAVGvGfetjP', // This is the fake app's application id
                    'X-Parse-Master-Key': 'An2S02k3ly1LioZ0AQaKbKsafGnIe8IOrXTooFSn',
                }
            }).then(res => {
                if (res.status === 200) {
                    let zip_arr = [{ value: "", label: "--" }]
                    res.data.results.map(element => zip_arr.push({ value: element.US_Zip_Code, label: element.US_Zip_Code }))
                    setZips(zip_arr)
                    setZip("")
                } else {
                    setZips([{ value: "", label: "--" }])
                    setZip("")
                    setErrorMessage("3rd Party API Server Error")
                    setIsErrorSnackBarOpen(true)
                }
            }).catch(e => {
                setZips([{ value: "", label: "--" }])
                setZip("")
                setErrorMessage("3rd Party API Server Error")
                setIsErrorSnackBarOpen(true)
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
    const handleCloseType = () => {
        setOpenType(false);
    };

    const handleOpenType = () => {
        setOpenType(true);
    };


    //   const onChangePropertyName = (e) => {
    //     setPropertyName(e.target.value)
    //     if (validName(e.target.value) || e.target.value.length === 0) {
    //       setPropertyNameErrorMessage("")
    //       setPropertyNameError(false)
    //     } else {
    //       setPropertyNameErrorMessage("Only Alpha Characters Allowed")
    //       setPropertyNameError(true)
    //     }
    //   }
    const onChangeRent = (e) => {
        if (checkIfNumber(e.target.value)) {
            setRent(e.target.value)
        }
    }
    const onChangeSize = (e) => {
        if (checkIfNumber(e.target.value)) {
            setPropertySize(e.target.value)
        }
    }
    const onChangeCount = (e) => {
        if (checkIfNumber(e.target.value)) {
            setPeopleCount(e.target.value)
        }
    }
    const onChangeImage = (e) => {
        if (e.target.files.length === 0) {

            let image_index = e.target.id.charAt(e.target.id.length - 1);
            let image_arr = image
            image_arr[parseInt(image_index)] = venue
            setImage(image_arr)
            let imageFile_arr = imageFile
            imageFile_arr[parseInt(image_index)] = null
            setImageFile(imageFile_arr)
            setRender(!render)
        } else {

            let image_index = e.target.id.charAt(e.target.id.length - 1);
            let image_arr = image
            image_arr[parseInt(image_index)] = URL.createObjectURL(e.target.files[0])
            setImage(image_arr)
            let imageFile_arr = imageFile
            imageFile_arr[parseInt(image_index)] = e.target.files[0]
            setImageFile(imageFile_arr)
            setRender(!render)
        }
    }
    const onUpdateVenue = () => {
        var formData = new FormData();
        formData.append("email", localStorage.getItem('user'))
        formData.append("venueName", propertyName)
        formData.append("venueId", props.venue.Venue.venue_id)
        formData.append("venueDesc", desc)
        formData.append("venueSize", propertySize)
        formData.append("venueType", propertytype)
        formData.append("venuePeopleCount", peopleCount)
        formData.append("venuePrice", rent)
        formData.append("venueAddrLine1", propertyAddress1)
        formData.append("venueAddrLine2", propertyAddress2)
        formData.append("venueAddrCity", city)
        formData.append("venueAddrState", state)
        formData.append("venueAddrZip", zip)
        imageFile.map((img, idx) => {
            if (img !== null) {
                formData.append("venueImages", img);
            }
        })

        axios.post(process.env.REACT_APP_VM_IP + "/app/Update_Venue", formData, {
            header: {
                'Content-Type': 'multipart/form-data',
            }
        }).then(res => {
            if (res.data.status === "OK") {
                setErrorMessage("New Venue Added")
                setIsSuccessSnackBarOpen(true)
            } else {
                setErrorMessage(res.data.message)
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error")
            setIsErrorSnackBarOpen(true)
            console.log("Server Error")
        })


    }
    const onCloseErrorSnackBar = () => {
        setIsErrorSnackBarOpen(false)
    }
    const onCloseSuccessSnackBar = () => {
        navigate("/")
    }
    let isDisabled = !(propertyName !== "" && propertyAddress1 !== "" && city !== "" && zip !== "" && state !== "" && propertySize !== "" && peopleCount !== "" && rent !== "")
    return (
        <ThemeProvider theme={theme}>
            <Snackbar open={isErrorSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseErrorSnackBar}>
                <Alert onClose={onCloseErrorSnackBar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Snackbar open={isSuccessSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSuccessSnackBar}>
                <Alert onClose={onCloseSuccessSnackBar} severity="success" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Box style={{ paddingTop: "2vh", overflowY:"scroll"}}>
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            name="propertyName"
                            required
                            fullWidth
                            id="propertyName"
                            label="Property Name"
                            autoFocus
                            onChange={(e) => setPropertyName(e.target.value)}
                            value={propertyName}
                            disabled={isEdit}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="addressline1"
                            required
                            fullWidth
                            id="addressline1"
                            label="Address Line 1"
                            onChange={(e) => setPropertyAddress1(e.target.value)}
                            value={propertyAddress1}
                            disabled={isEdit}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="addressline2"
                            
                            fullWidth
                            id="addressline2"
                            label="Address Line 2"
                            onChange={(e) => setPropertyAddress2(e.target.value)}
                            value={propertyAddress2}
                            disabled={isEdit}
                        />
                    </Grid>

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
                                disabled={isEdit}
                            >
                                {states.map((stateName, idx) => (
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
                                disabled={isEdit}
                            >
                                {cities.map((stateName, idx) => (
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
                                onChange={(e) => setZip(e.target.value)}
                                disabled={isEdit}
                            >
                                {zips.map((stateName, idx) => (
                                    <MenuItem value={stateName.value} key={idx}>{stateName.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth style={{ marginTop: "auto" }}>
                            {types.length !== 0 && <>
                                <InputLabel id="demo-controlled-open-select-label">Property Type</InputLabel>
                                <Select
                                    labelId="demo-controlled-open-select-label"
                                    id="demo-controlled-open-select"
                                    open={openType}
                                    onClose={handleCloseType}
                                    onOpen={handleOpenType}
                                    value={propertytype}
                                    label="Property Type"
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    disabled={isEdit}
                                >
                                    {types.map((type, idx) => (
                                        <MenuItem value={type} key={idx}>{type}</MenuItem>
                                    ))}
                                </Select></>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            name="propertyValue"
                            required
                            fullWidth
                            id="propertyValue"
                            label="Property Rent"
                            disabled={isEdit}
                            onChange={onChangeRent}
                            value={rent}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            name="propertySize"
                            required
                            fullWidth
                            id="propertySize"
                            label="Property Size"
                            disabled={isEdit}
                            onChange={onChangeSize}
                            value={propertySize}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} >
                        <TextField
                            name="peopleCount"
                            required
                            fullWidth
                            id="peopleCount"
                            label="People Count"
                            disabled={isEdit}
                            onChange={onChangeCount}
                            value={peopleCount}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            name="desc"

                            fullWidth
                            id="des"
                            label="Description"
                            onChange={(e) => setDesc(e.target.value)}
                            value={desc}
                            disabled={isEdit}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} direction="column" container style={{ textAlign: "left", marginTop:"-2vh", marginBottom:"-2vh" }}>
                        <Typography variant="h6" gutterBottom>Images</Typography>
                    </Grid>
                    {image.map((imgs, idx) => (
                        <Grid container item xs={12} sm={3} key={idx} className="profileimage1">
                            <img
                                alt="Location"
                                src={imgs}
                                id={"image" + idx}
                                style={{ width: "100%", heigth: "20vh" }}
                            />
                            <div id={"middle" + idx}>
                                <div id={"text" + idx}>
                                    <label for="upload-photo">Upload Image</label>
                                    <input type='file' id={"upload-photo" + idx} onChange={onChangeImage} disabled={isEdit} />
                                </div>
                            </div>
                        </Grid>

                    ))}
                    <Grid item xs={0} sm={10}>

                    </Grid>
                    <Grid item xs={12} sm={2} direction="column" container style={{ textAlign: "right" }}>
                        {isEdit ? <Button
                            variant="contained"
                            onClick={() => setIsEdit(false)}
                        >
                            Edit Venue
                        </Button> : <Button
                            variant="contained"
                            onClick={onUpdateVenue}
                            disabled={isDisabled}
                        >
                            Update Venue
                        </Button>}
                    </Grid>
                </Grid>

            </Container>
        </Box>
        </ThemeProvider>
    )


}