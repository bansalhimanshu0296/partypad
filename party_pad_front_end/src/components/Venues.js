import React from "react"
import Venue from "./Venue"
export default function Venues(props) {

    return (
        <div>
            {props.data.map((venue) => (
                <Venue key={venue.Venue.venue_id} venue={venue} />
            ))}
        </div>
    )
}