import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardMedia, Container, Grid, Link, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from "react-router-dom";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import venue from '../img/venue.jpg'


const Alert = React.forwardRef((
    props,
    ref,
) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const theme = createTheme();

export default function Dashboard() {
    let [venues, setVenues] = useState([])
    let [bookings, setBookings] = useState([])
    let [bookmarks, setBookmarks] = useState([])
    let [errorMessage, setErrorMessage] = useState("")
    let [isSnackBarOpen, setIsSnackBarOpen] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        if (localStorage.getItem('user') === null || localStorage.getItem('user').length === 0) {
            navigate("/")
        }
        if (localStorage.getItem('role') === "Owner") {
            axios.post(process.env.REACT_APP_VM_IP + "/app/Dashboard_Owner", {
                email: localStorage.getItem('user')
            }).then(res => {
                if (res.data.status === "OK") {
                    setVenues(res.data.data.recentVenues)
                    setBookings(res.data.data.upcomingBookings)
                } else {
                    setErrorMessage("Server Error")
                    setIsSnackBarOpen(true)
                }
            }).catch(e => {
                setErrorMessage("Server Error")
                setIsSnackBarOpen(true)
            })
        } else {
            axios.post(process.env.REACT_APP_VM_IP + "/app/Dashboard_Member", {
                email: localStorage.getItem('user')
            }).then(res => {
                if (res.data.status === "OK") {
                    setBookings(res.data.data.upcomingBookings)
                    setBookmarks(res.data.data.recentBookmarks)
                } else {
                    setErrorMessage("Server Error")
                    setIsSnackBarOpen(true)
                }
            }).catch(e => {
                setErrorMessage("Server Error")
                setIsSnackBarOpen(true)
            })
        }
    }, [])
    const onCloseSnackBar = () => {
        setIsSnackBarOpen(false)
    }
    //console.log(bookings)
    return (
        <ThemeProvider theme={theme}>
            <Snackbar open={isSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSnackBar}>
                <Alert onClose={onCloseSnackBar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Box style={{ paddingTop: "4vh", height: "80.5vh", overflowY:"scroll"}}>
                <Container>
                    <Grid container spacing={2} style={{ paddingTop: "5vh" }}>
                        <Grid container direction="column" style={{ textAlign: "left" }}>
                            <Typography component="div" variant="h4">
                                Dashboard
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Accordion expanded={true} disabled>
                                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                    <Typography>Upcoming Bookings</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {
                                        bookings.map((booking, idx) => (
                                            <Card key={idx} style={{marginTop:"2vh"}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={3}>
                                                        <CardMedia
                                                            component="img"
                                                            sx={{ width: 120, height: 120 }}
                                                            image={booking.Venue.venue_image.length !== 0 ? booking.Venue.venue_image[0] : venue}
                                                            alt={booking.Venue.venue_name}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "left" }}>
                                                            <CardContent sx={{ flex: '1 0 auto' }}>
                                                                <Typography component="div" variant="h6" >
                                                                    {booking.Venue.venue_name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" >
                                                                    From:
                                                                    {booking.Booking.booking_start_date}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" >
                                                                    To:
                                                                    {booking.Booking.booking_end_date}
                                                                </Typography>
                                                            </CardContent>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        ))
                                    }
                                    {bookings.length !== 0 && <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "right" }} style={{ paddingTop: "2vh" }}><Link style={{ textDecoration: "none" }} href="/booking">Manage Bookings</Link></Box>}
                                    {bookings.length === 0 &&
                                        <Typography>No Upcoming Bookings</Typography>}
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                        {localStorage.getItem('role') === "Owner" && <Grid item xs={6}>
                            <Accordion expanded={true} disabled>
                                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                    <Typography>Recent Added Venues</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {
                                        venues.map((ven, idx) => (
                                            <Card key={idx} style={{marginTop:"2vh"}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={3}>
                                                        <CardMedia
                                                            component="img"
                                                            sx={{ width: 120, height: 120 }}
                                                            image={ven.Venue.venue_image.length !== 0 ? ven.Venue.venue_image[0] : venue}
                                                            alt={ven.Venue.venue_name}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "left" }}>
                                                            <CardContent sx={{ flex: '1 0 auto' }}>
                                                                <Typography component="div" variant="h6" >
                                                                    {ven.Venue.venue_name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" >
                                                                    {ven.Venue_Address.venue_addr_city + ", " + ven.Venue_Address.venue_addr_state}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" >
                                                                    {"$" + ven.Venue.venue_price}
                                                                </Typography>
                                                            </CardContent>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        ))
                                    }
                                    {venues.length !== 0 && <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "right" }} style={{ paddingTop: "2vh" }}><Link style={{ textDecoration: "none" }} href="/managevenue">Manage Venues</Link></Box>}
                                    {venues.length === 0 &&
                                        <Typography>No Venues</Typography>}
                                </AccordionDetails>
                            </Accordion>
                        </Grid>}
                        {localStorage.getItem('role') === "Member" && <Grid item xs={6}>
                            <Accordion expanded={true} disabled>
                                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                    <Typography>Recent Bookmarks</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {
                                        bookmarks.map((ven, idx) => (
                                            <Card key={idx} style={{marginTop:"2vh"}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={3}>
                                                        <CardMedia
                                                            component="img"
                                                            sx={{ width: 120, height: 120 }}
                                                            image={ven.Venue.venue_image.length !== 0 ? ven.Venue.venue_image[0] : venue}
                                                            alt={ven.Venue.venue_name}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "left" }}>
                                                            <CardContent sx={{ flex: '1 0 auto' }}>
                                                                <Typography component="div" variant="h6" >
                                                                    {ven.Venue.venue_name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" >
                                                                    {ven.Venue_Address.venue_addr_city + ", " + ven.Venue_Address.venue_addr_state}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" >
                                                                    {"$" + ven.Venue.venue_price}
                                                                </Typography>
                                                            </CardContent>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        ))
                                    }
                                    {bookmarks.length !== 0 && <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "right" }} style={{ paddingTop: "2vh" }}><Link style={{ textDecoration: "none" }} href="/bookmark">Manage Bookmarks</Link></Box>}
                                    {bookmarks.length === 0 &&
                                        <Typography>No Bookmarks</Typography>}
                                </AccordionDetails>
                            </Accordion>
                        </Grid>}
                    </Grid>
                </Container>

            </Box>
        </ThemeProvider>
    )
}