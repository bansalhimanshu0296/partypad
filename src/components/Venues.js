import React from "react"
import Venue from "./Venue"
export default function Venues(props){
    
    return(
        <div>
            {props.data.map((venue)=>(
                <Venue key={venue.Venue.venue_id} venueName={venue.Venue.venue_name} venueDesc={venue.Venue.venue_description}
                venueAddrCity={venue.Venue_Address.venue_addr_city} venueAddrState={venue.Venue_Address.venue_addr_state}/>
            ))} 
        </div>
    )
}