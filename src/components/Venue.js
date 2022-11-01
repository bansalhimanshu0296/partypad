import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import venue from '../img/venue.jpg'
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';




export default function Venue(props){
    const getVenueInformation = () =>{

    }
    return(
        <Card style={{marginTop:"1.5vh"}}>
          <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
            <CardMedia
            component="img"
            sx={{ width: 151, height: 151 }}
            //image={props.img_src}
            image ={venue}
            alt={props.venueName}
            />
            </Grid>
            <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "left" }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h5" onClick={getVenueInformation}>
            {props.venueName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {props.venueAddrCity+", "+props.venueAddrState}
          </Typography>
          <Typography variant="body2" color="text.secondary">
          {props.venueDesc}
        </Typography>
        </CardContent>  
        </Box>
        </Grid>
        </Grid>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
      </Box> */}
        </Card>
    )
}