import React from "react"
import Booking from "./Booking"
export default function Bookings(props) {

    return (
        <div>
            {props.data.map((booking) => (
                <Booking key={booking.Booking.booking_id} booking={booking} onCancelBooking={props.onCancelBooking} />
            ))}
        </div>
    )
}