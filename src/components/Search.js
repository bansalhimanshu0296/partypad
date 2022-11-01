import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { React, useState} from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { Box } from "@mui/system";
import { Button } from '@mui/material';



export default function Search(props){
    const [open, setOpen] = useState(false);
    const [openCity, setOpenCity] = useState(false);
    const handleClose = () => {
        setOpen(false);
      };
    
      const handleOpen = () => {
        setOpen(true);
      };
      const handleCloseCity = () => {
        setOpenCity(false);
      };
    
      const handleOpenCity = () => {
        setOpenCity(true);
      };
        
    return(
        <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                margin="normal"
                required
                fullWidth
                value={props.searchValue}
                onChange = {props.onSearchValueChange}
                id="search"
                label="Search"
                />
              </Grid>
              <Grid item xs={12} sm={2} style={{marginTop:"auto"}}>
                <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <InputLabel id="demo-controlled-open-select-label">State</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={open}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        value={props.stateResult}
                        label="State"
                        onChange={props.handleStateChange}
                    >
                        {props.state.map((stateName,idx)=>(
                            <MenuItem value={stateName.value} key={idx}>{stateName.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} style={{marginTop:"auto"}}>
                <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <InputLabel id="demo-controlled-open-select-label">City</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openCity}
                        onClose={handleCloseCity}
                        onOpen={handleOpenCity}
                        value={props.cityResult}
                        label="City"
                        onChange={props.onHandleCityChange}
                        
                    >
                        {props.cities.map((city,idx)=>(
                            <MenuItem value={city.value} key={idx}>{city.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2} style={{marginTop:"auto", marginBottom:"auto"}}>
                <Button
                fullWidth
                variant="contained"
                
                onClick ={props.onSearch}
                >
                    Search
                </Button>
              </Grid>
            </Grid>
        </Box>
    )
}