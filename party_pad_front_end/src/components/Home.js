import { Box, Container } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TypewriterComponent from "typewriter-effect";

export default function Home() {
    const navigate = useNavigate()
    useEffect(() => {
        if (localStorage.getItem('user') !== null && localStorage.getItem('user').length !== 0) {
            navigate("/dashboard")
        }
    }, [])
    return (
        <Box className="home">
            <Container style={{paddingTop: "20vh", fontSize:"3rem",color:"gray", fontWeight: "bold", width:"50vw"}}>
                <TypewriterComponent
                    onInit={(typewriter) => {

                        typewriter

                            .typeString("Your Party Starts Here")
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString("Plan Your Party NOW")
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString("Want to Throw an EPIC Party")
                            .pauseFor(2000)
                            .typeString(" but need a PAD")
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString("SIGN UP Today")
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString("Have a SPACE and need EXTRA CASH")
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString("SIGN UP Today")
                            .pauseFor(2000)
                            .start();
                    }}
                />
            </Container>
        </Box>
    )

}