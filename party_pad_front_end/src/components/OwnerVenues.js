import React from "react"
import OwnerVenue from "./OwnerVenue"
export default function OwnerVenues(props) {

    return (
        <div>
            {props.data.map((venue) => (
                <OwnerVenue key={venue.Venue.venue_id} venue={venue} onRemoveVenue={props.onRemoveVenue}/>
            ))}
        </div>
    )
}