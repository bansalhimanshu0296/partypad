import { Badge, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Chat from "./Chat";
import { useNavigate } from "react-router-dom";


const Alert = React.forwardRef((
    props,
    ref,
) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Inbox() {
    let [userList, setUserList] = useState([])
    let [chatUser, setChatUser] = useState(0)
    let [chatUserName, setChatUserName] = useState("")
    let [unreadChat, setUnreadChat] = useState(0)
    let [errorMessage, setErrorMessage] = useState("")
    let [isErrorSnackBarOpen, setIsErrorSnackBarOpen] = useState(false)
    let interval = null
    const navigate = useNavigate()
    useEffect(() => {
        if (localStorage.getItem('user') === null || localStorage.getItem('user').length === 0) {
            navigate("/")
        }

        getmessages()
        interval = setInterval(getmessages, 60000);
        return () => {
            clearInterval(interval)
        }
    }, [])
    const getmessages = () => {
        axios.post(process.env.REACT_APP_VM_IP + "/app/Retrieve_Sender_List", {
            email: localStorage.getItem('user')
        }).then(res => {
            if (res.data.status === "OK") {
                setUserList(res.data.data)
            } else {
                setErrorMessage("Server Error")
                setIsErrorSnackBarOpen(true)
            }
        }).catch(e => {
            setErrorMessage("Server Error")
            setIsErrorSnackBarOpen(true)
        })
    }
    const getChat = (e) => {
        let name = ""
        let id = parseInt(e.target.id.slice(1))
        let unread = 0
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].user_id === id) {
                name = userList[i].user_name
                unread = userList[i].unread_messages
            }
        }
        setChatUserName(name)
        setChatUser(id)
        setUnreadChat(unread)
    }
    const onCloseErrorSnackBar = () => {
        setIsErrorSnackBarOpen(false)
    }
    return (
        <Box sx={{
            marginTop: 2.1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: "81.5vh", overflowY: "scroll",


        }}>
            <Snackbar open={isErrorSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseErrorSnackBar}>
                <Alert onClose={onCloseErrorSnackBar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Grid container spacing={2}>
                <Grid items xs={3} style={{ marginTop: "20px" }}>
                    {userList.map((user) => (
                        <Card style={{ cursor: "pointer" }} key={user.user_id} onClick={getChat} id={"0" + user.user_id}>
                            <CardContent sx={{ flex: '1 0 auto' }} id={"1" + user.user_id}>
                                <Badge badgeContent={user.unread_messages} color="error" id={"2" + user.user_id}>
                                    <Typography component="div" variant="h7" key={user.user_id} id={"3" + user.user_id}>{user.user_name}</Typography>
                                </Badge>
                                {user.unread_messages === 1 && <Typography variant="body2" color="text.secondary" id={"4" + user.user_id}>{user.unread_messages + " new message"}</Typography>}
                                {user.unread_messages > 1 && <Typography variant="body2" color="text.secondary" id={"4" + user.user_id}>{user.unread_messages + " new messages"}</Typography>}
                            </CardContent>
                        </Card>
                    ))}
                </Grid>
                <Grid items xs={9}>
                    {chatUser !== 0 && <Chat user={chatUser} getmessages={getmessages} userName={chatUserName} unread={unreadChat} style={{ width: "100%" }} />}
                </Grid>

            </Grid>

        </Box>
    )
}