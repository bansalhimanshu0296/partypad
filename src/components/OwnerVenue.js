import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import venue from '../img/venue.jpg'
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';




export default function OwnerVenue(props) {
  const navigate = useNavigate()
  let image = venue
  if (props.venue.Venue.venue_image.length !== 0) {
    image = props.venue.Venue.venue_image[0]
  }
  const getVenueInformation = () => {
    navigate("/editvenue", { state: {venue:props.venue, view:"view"} })

  }
  return (
    <Card style={{ marginTop: "1.5vh", cursor: "pointer" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <CardMedia
            component="img"
            sx={{ width: 151, height: 151 }}
            image={image}
            alt={props.venue.Venue.venue_name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto", textAlign: "left" }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <Typography component="div" variant="h5" onClick={getVenueInformation}>
                {props.venue.Venue.venue_name}
              </Typography>
              {
                props.venue.Venue_Address.venue_addr_state.length !== 0 &&

                <Typography variant="subtitle1" color="text.secondary" component="div">
                  {props.venue.Venue_Address.venue_addr_city + ", " + props.venue.Venue_Address.venue_addr_state}
                </Typography>
              }
              <Typography variant="body2" color="text.secondary">
                Type:
                {props.venue.Venue.venue_type}
              </Typography>
              {props.venue.Venue.venue_size.length !== 0 && <Typography variant="body2" color="text.secondary">
                Venue Size:
                {props.venue.Venue.venue_size} sq.F
              </Typography>}
              {props.venue.Venue.venue_people_count.length !== 0 &&
                <Typography variant="body2" color="text.secondary">
                  People:
                  {props.venue.Venue.venue_people_count}
                </Typography>}
            </CardContent>
          </Box>
        </Grid>
        <Grid item xs={12} sm={3}>
            <Typography component="div" variant="h5" >{"$"+props.venue.Venue.venue_price}</Typography>
            <Typography style={{paddingTop:"40%"}}>
                <Link style={{textDecoration:"none"}} onClick={()=>{navigate("/editvenue", { state: {venue:props.venue, view:"edit"} })
}}>Edit Venue</Link>
                <Link style={{textDecoration:"none"}} onClick={()=>props.onRemoveVenue(props.venue.Venue.venue_id)}>&nbsp;&nbsp;Remove Venue</Link>
            </Typography>
        </Grid>
      </Grid>
    </Card>
  )
}