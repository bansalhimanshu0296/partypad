import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Carousel from 'react-material-ui-carousel';
import { Box } from "@mui/system";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import venue from "../img/venue.jpg"
import { IconButton, Modal, Typography } from "@mui/material";
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import {
    DateRangePicker
} from "@mui/x-date-pickers-pro/DateRangePicker";
import TextField from '@mui/material/TextField';
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useNavigate } from "react-router-dom";
import Geocode from "react-geocode";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Stack from '@mui/material/Stack';


const Alert = React.forwardRef((
    props,
    ref,
) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
function Map({
    center,
    zoom,
}) {
    const ref = useRef();

    useEffect(() => {
        const map = new window.google.maps.Map(ref.current, {
            center,
            zoom,
        });
        new window.google.maps.Marker({
            position: center,
            map: map,
        });
    }, []);

    return <div ref={ref} id="map" style={{ height: "50vh" }} />;
}
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,

};


export default function VenueInformation() {

    let [value, setValue] = useState([null, null])
    let [selectedDates, setSelectedDates] = useState([])
    let [newReservedDates, setNewReservedDates] = useState([])
    let [isErrorSnackBarOpen, setIsErrorSnackBarOpen] = useState(false)
    let [isSuccessSnackBarOpen, setIsSuccessSnackBarOpen] = useState(false)
    let [errorMessage, setErrorMessage] = useState("")
    let [totalCost, setTotalCost] = useState(0)
    let [maintainanceCost, setMaintainanceCost] = useState(0)
    let [rent, setRent] = useState(0)
    let [tax, setTax] = useState(0)
    let [center, setCenter] = useState({ lat: 0, lng: 0 })
    let [isMessage, setIsMessage] = useState(false)
    let [message, setMessage] = useState("")
    let [isChatSuccessSnackBarOpen, setIsChatSuccessSnackBarOpen] = useState(false)
    let [isBookmarked, setIsBookmarked] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        if (localStorage.getItem('user') === null || localStorage.getItem('user').length === 0) {
            navigate("/")
        }
        if (localStorage.getItem("role") === "Owner") {
            navigate("/dashboard")
        }
        axios.post(process.env.REACT_APP_VM_IP + "/app/Check_Bookmark_Exists", {
            venueId: props.Venue.venue_id,
            email: localStorage.getItem('user')
        }).then(res => {
            if (res.data.status === "OK") {
                setIsBookmarked(res.data.result)
            } else {
                setErrorMessage("Server Error");
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error");
            setIsErrorSnackBarOpen(true)
            console.log("Server Error")
        })

        axios.post(process.env.REACT_APP_VM_IP + "/app/Fetch_Dates", {
            venueId: props.Venue.venue_id
        }).then((res) => {
            if (res.data.status === "OK") {
                setSelectedDates(res.data.data)
            } else {
                setErrorMessage(res.data.message);
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            console.log("Server Error")
        })
        Geocode.setApiKey(process.env.REACT_APP_GEOCODE_KEY);

        // set response language. Defaults to english.
        Geocode.setLanguage("en");
        Geocode.fromAddress(props.Venue_Address.venue_addr_line1 + ", " + props.Venue_Address.venue_addr_line2 + " " + props.Venue_Address.venue_addr_city + " " + props.Venue_Address.venue_addr_state + " " + props.Venue_Address.venue_addr_zip + " (US)").then((res) => {
            const { lat, lng } = res.results[0].geometry.location;
            console.log(lat, lng)
            setCenter({ lat: lat, lng: lng })
        })
    }, [])

    const props = useLocation().state
    let images = props.Venue.venue_image
    if (images.length === 0) {
        images.push(venue)
    }
    let navButtonsAlwaysInvisible = false
    if (images.length === 1) {
        navButtonsAlwaysInvisible = true
    }
    const onCloseErrorSnackBar = () => {
        setIsErrorSnackBarOpen(false)
    }
    const onCloseSuccessSnackBar = () => {
        navigate("/")
    }
    const disableSelectedDate = (date) => {
        if (selectedDates.length !== 0)
            return selectedDates.includes(new Date(date).toISOString().split('T')[0])
        return false
    }
    const onChangeDate = (newValue) => {
        if (newValue[1] === null) {
            setValue(newValue)
        } else {
            let dateToReserve = []
            let startDate = new Date(newValue[0])
            let endDate = new Date(newValue[1])
            while (startDate < endDate) {
                if (!selectedDates.includes(startDate.toISOString().split('T')[0])) {
                    dateToReserve.push(startDate.toISOString().split('T')[0].replaceAll("-", "/"))
                } else {
                    setErrorMessage(startDate.toISOString().split('T')[0] + " is already Reserved, select different dates")
                    setIsErrorSnackBarOpen(true)
                    setValue([null, null])
                    return
                }
                startDate = new Date(startDate.setDate(startDate.getDate() + 1));
            }
            setValue(newValue)
            setNewReservedDates(dateToReserve);
            setTax((0.2 * parseFloat(props.Venue.venue_price) * dateToReserve.length).toFixed(2))
            setRent((parseFloat(props.Venue.venue_price) * dateToReserve.length).toFixed(2))
            setMaintainanceCost(20 * dateToReserve.length)
            setTotalCost((1.2 * parseFloat(props.Venue.venue_price) * dateToReserve.length + 20 * dateToReserve.length).toFixed(2))
        }
    }
    const onReserve = () => {
        if (value[0] === null || value[1] === null) {
            setErrorMessage("Please Select Date before Rervation")
            setIsErrorSnackBarOpen(true)
        } else {
            axios.post(process.env.REACT_APP_VM_IP + "/app/Book_Dates", {
                "email": localStorage.getItem("user"),
                "venueId": props.Venue.venue_id,
                "dates": JSON.stringify({ "dateList": newReservedDates })
            }).then(res => {
                if (res.data.status === "OK") {
                    setErrorMessage("Place have been reserved for you. Have Fun")
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

    }
    const onSendMessage = () => {
        if (message === "") {
            setErrorMessage("Message is Empty");
            setIsErrorSnackBarOpen(true)
        } else {
            const body = {
                senderEmail: localStorage.getItem('user'),
                receiverId: props.Venue.user_id,
                message: message
            };
            axios.post(process.env.REACT_APP_VM_IP + "/app/Send_Message", body).then(res => {
                if (res.data.status === "OK") {
                    setMessage("")
                    setIsMessage(false)
                    setErrorMessage("Message sent to Venue Owner Successfully")
                    setIsChatSuccessSnackBarOpen(true)
                } else {
                    setMessage("")
                    setIsMessage(false)
                    setErrorMessage(res.data.message)
                    setIsErrorSnackBarOpen(true)
                }
            }).catch(e => {
                setMessage("")
                setIsMessage(false)
                setErrorMessage("Server Error")
                setIsErrorSnackBarOpen(true)
                console.log("Server Error")
            })

        }
    }
    const onCloseChatSuccessSnackBar = () => {
        setIsChatSuccessSnackBarOpen(false)
    }
    const onBookmark = () => {
        const body = {
            email: localStorage.getItem('user'),
            venueId: props.Venue.venue_id
        }
        axios.post(process.env.REACT_APP_VM_IP + "/app/Add_Venue_Bookmark", body).then(res => {
            if (res.data.status === "OK") {
                setIsBookmarked(true)
            } else {
                setErrorMessage(res.data.message)
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error")
            setIsErrorSnackBarOpen(true)
        })
    }
    const onRemoveBookmark = () => {
        const body = {
            email: localStorage.getItem('user'),
            venueId: props.Venue.venue_id
        }
        axios.post(process.env.REACT_APP_VM_IP + "/app/Remove_Venue_Bookmark", body).then(res => {
            if (res.data.status === "OK") {
                setIsBookmarked(false)
            } else {
                setErrorMessage(res.data.message)
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error")
            setIsErrorSnackBarOpen(true)
        })
    }
    return (
        <Box style={{ paddingTop: "5vh", height: "71.5vh", overflowY: "scroll" }}>
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
            <Snackbar open={isChatSuccessSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseChatSuccessSnackBar}>
                <Alert onClose={onCloseChatSuccessSnackBar} severity="success" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Modal
                open={isMessage}
                onClose={(e) => { setIsMessage(false) }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Message
                    </Typography>
                    <TextareaAutosize
                        aria-label="maximum height"
                        placeholder="Message"
                        value={message}
                        style={{ width: "100%", height: "300px", fontSize: "1.5rem" }}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Stack direction="row-reverse" spacing={2} style={{ paddingTop: "20px" }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={(e) => { setMessage(""); setIsMessage(false) }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onSendMessage}
                        >
                            Send Message
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} style={{ textAlign: "left" }}>
                        <Typography component="h1" variant="h5" >
                            {props.Venue.venue_name}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} style={{ textAlign: "left" }}>
                        <Typography variant="subtitle1" color="text.secondary" >
                            {props.Venue_Address.venue_addr_line1 !== "" && props.Venue_Address.venue_addr_line1 + ", "}
                            {props.Venue_Address.venue_addr_line2 !== "" && props.Venue_Address.venue_addr_line2 + ", "}
                            {props.Venue_Address.venue_addr_city !== "" && props.Venue_Address.venue_addr_city + ", "}
                            {props.Venue_Address.venue_addr_state !== "" && props.Venue_Address.venue_addr_state}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} style={{ height: "40vh" }}>
                        <Carousel
                            indicators={false}
                            navButtonsAlwaysInvisible={navButtonsAlwaysInvisible}
                            style={{ height: "100%" }}>
                            {
                                images.map((image, idx) => (
                                    <img
                                        key={idx}
                                        alt={props.Venue.venue_name}
                                        src={image}
                                        style={{ width: "100%", height: "35vh" }}
                                    />
                                ))}
                        </Carousel>
                    </Grid>
                    <Grid item xs={12} sm={8} style={{ textAlign: "left" }}>
                        <Typography component="h2" variant="h5" >
                            {props.Venue.venue_type !== "" && props.Venue.venue_type}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" >
                            {props.Venue.venue_people_count !== "" && props.Venue.venue_people_count + " Guests "}
                            {props.Venue.venue_size !== "" && props.Venue.venue_size + " sq. F"}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            <IconButton style={{ fontSize: "1rem" }} onClick={() => { setMessage(""); setIsMessage(true) }}>
                                <ChatIcon /> &nbsp;Send Message
                            </IconButton>
                            {isBookmarked ? <IconButton style={{ fontSize: "1rem" }} onClick={onRemoveBookmark}>
                                <FavoriteOutlinedIcon /> &nbsp;Unlike
                            </IconButton> : <IconButton style={{ fontSize: "1rem" }} onClick={onBookmark}>
                                <FavoriteBorderOutlinedIcon /> &nbsp;Like
                            </IconButton>}

                        </Typography>
                        <Divider />
                        {props.Venue.venue_description !== "NaN" && props.Venue.venue_description !== "" && props.Venue.venue_description}
                    </Grid>
                    <Grid item xs={12} sm={4} style={{ textAlign: "left" }}>
                        <Paper elevation={8} style={{ padding: "15px" }}>
                            <Container>
                                <Typography component="h2" variant="h6" >
                                    {props.Venue.venue_price !== "" && "$" + props.Venue.venue_price}
                                    {props.Venue.venue_price === "" && "$0"}
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    <sup>*</sup> Taxes & Cleaning Fess may be applicable
                                </Typography>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                    localeText={{ start: 'Check-in', end: 'Check-out' }}
                                >
                                    <DateRangePicker
                                        value={value}
                                        minDate={new Date().setDate(new Date().getDate() + 1)}
                                        onChange={onChangeDate}
                                        shouldDisableDate={disableSelectedDate}
                                        renderInput={(startProps, endProps) => (
                                            <React.Fragment>
                                                <TextField {...startProps} />

                                                <TextField {...endProps} />
                                            </React.Fragment>
                                        )}
                                    />
                                </LocalizationProvider>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={onReserve}
                                    style={{ backgroundColor: "red" }}
                                >
                                    Reserve
                                </Button>
                                {newReservedDates.length !== 0 && (
                                    <TableContainer>
                                        <Table>
                                            <TableRow>
                                                <TableCell component="th" scope="row">
                                                    {"$" + props.Venue.venue_price + " X " + newReservedDates.length}
                                                </TableCell>
                                                <TableCell align="right">{"$" + rent}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row">
                                                    Cleaning Cost
                                                </TableCell>
                                                <TableCell align="right">{"$" + maintainanceCost}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row">
                                                    Tax
                                                </TableCell>
                                                <TableCell align="right">{"$" + tax}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row">
                                                    Total
                                                </TableCell>
                                                <TableCell align="right">{"$" + totalCost}</TableCell>
                                            </TableRow>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Container>

                        </Paper>

                    </Grid>
                    <Grid item xs={12} style={{ textAlign: "left" }}>
                        <Typography component="h2" variant="h6" >
                            Where You will be
                        </Typography>
                    </Grid>
                    <Grid item xs={12} style={{ height: "50vh" }}>
                        <Wrapper apiKey={process.env.REACT_APP_MAP_API}>
                            <Map
                                center={center}
                                zoom={15}
                                style={{ flexGrow: "1", height: "100%" }}
                                onClick={(e) => { console.log(e.latlng) }}
                            >
                            </Map>

                        </Wrapper>
                    </Grid>
                </Grid>

            </Container>
        </Box>
    )
}

