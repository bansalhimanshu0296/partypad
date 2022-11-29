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

                            .typeString("Party Pad")

                            .pauseFor(1000)
                            .typeString(" Welcomes You")
                            .pauseFor(1000)
                            .deleteAll()
                            .typeString("One Stop for \n")
                            .pauseFor(1000)
                            .typeString(" All Party Venues")
                            .start();
                    }}
                />
            </Container>
        </Box>
    )

}