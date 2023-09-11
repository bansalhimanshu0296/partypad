import { Box, Container, Divider, Grid, IconButton, Paper, TextField, Typography } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";
import React, { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Alert = React.forwardRef((
    props,
    ref,
) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Chat = React.memo(({ userName, getmessages, user, unread, setUnread }) => {
    let [chat, setChat] = useState({})
    let [unreadChat, setUnreadChat] = useState({})
    let chatTimer = null
    let [chatMessage, setChatMessage] = useState("")
    let [errorMessage, setErrorMessage] = useState("")
    let [isErrorSnackBarOpen, setIsErrorSnackBarOpen] = useState(false)

    useEffect(() => {
        getChat()
        getmessages();
        chatTimer = setInterval(getChat, 1000)
        return () => {
            clearInterval(chatTimer)
        }
    }, [user, unread])

    const getChat = () => {
        let body = {
            receiverEmail: localStorage.getItem('user'),
            senderId: user
        }

        axios.post(process.env.REACT_APP_VM_IP + "/app/Retrieve_Chat", body).then(res => {
            if (res.data.status === "OK") {
                let data = {}
                let i = 0;
                for (; i < res.data.data.length - unread; i++) {
                    let chat = res.data.data[i];
                    if (data.hasOwnProperty(chat.timestamp.substring(0, 10))) {
                        data[chat.timestamp.substring(0, 10)].push({
                            message: chat.message, message_type: chat.message_type, delivered: chat.delivery_flag, time: new Date(chat.timestamp).toLocaleTimeString('en',
                                { timeStyle: 'short', hour12: false, timeZone: 'UTC' })
                        });
                    } else {
                        data[chat.timestamp.substring(0, 10)] = [{
                            message: chat.message, message_type: chat.message_type, delivered: chat.delivery_flag, time: new Date(chat.timestamp).toLocaleTimeString('en',
                                { timeStyle: 'short', hour12: false, timeZone: 'UTC' })
                        }]
                    }
                }
                setChat(data)
                data = {}
                for (; i < res.data.data.length; i++) {
                    let chat = res.data.data[i];
                    if (data.hasOwnProperty(chat.timestamp.substring(0, 10))) {
                        data[chat.timestamp.substring(0, 10)].push({
                            message: chat.message, message_type: chat.message_type, time: new Date(chat.timestamp).toLocaleTimeString('en',
                                { timeStyle: 'short', hour12: false, timeZone: 'UTC' })
                        });
                    } else {
                        data[chat.timestamp.substring(0, 10)] = [{
                            message: chat.message, message_type: chat.message_type, time: new Date(chat.timestamp).toLocaleTimeString('en',
                                { timeStyle: 'short', hour12: false, timeZone: 'UTC' })
                        }]
                    }
                }
                setUnreadChat(data)
            } else {
                setErrorMessage("Server Error")
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error")
            setIsErrorSnackBarOpen(true)
        })
    }
    const sendMessage = () => {
        if (chatMessage !== "") {
            const body = {
                senderEmail: localStorage.getItem('user'),
                receiverId: user,
                message: chatMessage
            }
            axios.post(process.env.REACT_APP_VM_IP + "/app/Send_Message", body).then(res => {
                if (res.data.status === "OK") {
                    setChatMessage("")
                    setUnread(0)
                    
                } else {
                    setErrorMessage(res.data.message)
                    setIsErrorSnackBarOpen(true)
                }
            }).catch(e => {
                setErrorMessage("Server Error")
                setIsErrorSnackBarOpen(true)
                console.log("Server Error")
            })
        }
    }
    const onCloseErrorSnackBar = () => {
        setIsErrorSnackBarOpen(false)
    }
    const SendButton = () => (
        <IconButton onClick={sendMessage}>
            <SendIcon />
        </IconButton>
    )
    return (
        <Box sx={{
            marginTop: 2.1,
            display: 'flex',
            flexDirection: 'column',
            textAlign: "left",
            paddingBottom: "2px"
        }}>
            <Snackbar open={isErrorSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseErrorSnackBar}>
                <Alert onClose={onCloseErrorSnackBar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Container style={{ height: "71vh", overflowY: "auto", paddingBottom: "4px" }}>
                {Object.keys(chat).map((date) => (
                    <>
                        <Divider style={{ marginTop: "5px", marginBottom: "5px" }}>{date}</Divider>
                        {chat[date].map((message) => (
                            <>
                                {message["message_type"] === "received" ? <Grid container spacing={8} style={{ paddingTop: "12vh", paddingLeft: "4.5vw" }}>
                                    <Grid items xs={9} style={{ marginTop: "5px" }}>
                                        <Paper elevation={8} style={{ padding: "15px" }}>
                                            <Container>
                                                <Typography variant="body2" color="text.secondary">
                                                    {userName}
                                                </Typography>
                                                <Typography>
                                                    {message["message"]}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" style={{ textAlign: "right" }}>
                                                    {message["time"]}
                                                </Typography>
                                            </Container>
                                        </Paper>
                                    </Grid>
                                    <Grid items xs={3}></Grid>
                                </Grid> : <Grid container spacing={8} style={{ paddingTop: "12vh" }}>
                                    <Grid items xs={3}>
                                    </Grid>
                                    <Grid columns xs={9} style={{ marginTop: "5px" }}>
                                        <Paper elevation={8} style={{ padding: "15px" }}>
                                            <Container>
                                                <Typography variant="body2" color="text.secondary" style={{ textAlign: "right" }}>
                                                    You
                                                </Typography>
                                                <Typography style={{ textAlign: "right" }}>
                                                    {message["message"]}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" >
                                                    {message["time"]}
                                                    &nbsp;
                                                    {message["delivered"] ? <DoneAllIcon style={{ fontSize: "1rem" }} /> : <CheckIcon style={{ fontSize: "1rem" }} />}
                                                </Typography>

                                            </Container>
                                        </Paper>
                                    </Grid>

                                </Grid>}
                            </>
                        ))}
                    </>
                ))}
                {JSON.stringify(unreadChat) !== "{}" && <Divider style={{ marginTop: "5px", marginBottom: "5px", color: "red" }}>New Message</Divider>}
                {Object.keys(unreadChat).map((date) => (
                    <>
                        <Divider style={{ marginTop: "10px", marginBottom: "5px" }}>{date}</Divider>
                        {unreadChat[date].map((message) => (
                            <Grid container spacing={8} style={{ paddingTop: "12vh", paddingLeft: "4.5vw" }}>
                                <Grid items xs={9} style={{ marginTop: "5px" }}>
                                    <Paper elevation={8} style={{ padding: "15px" }}>
                                        <Container>
                                            <Typography variant="body2" color="text.secondary">
                                                {userName}
                                            </Typography>
                                            <Typography>
                                                {message["message"]}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" style={{ textAlign: "right" }}>
                                                {message["time"]}
                                            </Typography>
                                        </Container>
                                    </Paper>
                                </Grid>
                                <Grid items xs={3}></Grid>
                            </Grid>

                        ))}
                    </>
                ))}
            </Container>
            <Container>
                <TextField
                    onChange={e => setChatMessage(e.target.value)}
                    value={chatMessage}
                    fullWidth
                    label="Message"
                    InputProps={{ endAdornment: <SendButton /> }}
                    style={{ marginTop: "2vh" }}

                />
            </Container>

        </Box>
    )
})
export default Chat;