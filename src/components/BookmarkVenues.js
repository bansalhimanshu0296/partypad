import React from "react"
import BookmarkVenue from "./BookmarkVenue"
export default function BookmarkVenues(props) {

    return (
        <div>
            {props.data.map((venue) => (
                <BookmarkVenue key={venue.Venue.venue_id} venue={venue} onRemoveBookmark={props.onRemoveBookmark} />
            ))}
        </div>
    )
}