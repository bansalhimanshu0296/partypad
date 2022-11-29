import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import venue from '../img/venue.jpg'
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Link } from '@mui/material';




export default function Booking(props) {
    let image = venue
    if (props.booking.Venue.venue_image.length !== 0) {
        image = props.booking.Venue.venue_image[0]
    }
    return (
        <Card style={{ marginTop: "1.5vh", cursor: "pointer" }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                    <CardMedia
                        component="img"
                        sx={{ width: 151, height: 151 }}
                        image={image}
                        alt={props.booking.Venue.venue_name}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "left" }}>
                        <CardContent sx={{ flex: '1 0 auto' }}>
                            <Typography component="div" variant="h5">
                                {props.booking.Venue.venue_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                From:&nbsp;
                                {props.booking.Booking.booking_start_date}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                To:&nbsp;
                                {props.booking.Booking.booking_end_date}
                            </Typography>
                        </CardContent>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Typography style={{ paddingTop: "40%" }}>
                        <Link style={{ textDecoration: "none" }} onClick={() => props.onCancelBooking(props.booking.Booking.booking_id)}>Cancel Booking</Link>
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    )
}