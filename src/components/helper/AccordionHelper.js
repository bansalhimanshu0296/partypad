import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import Typography from '@mui/material/Typography';
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Box } from "@mui/system";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';


const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '&:before': {
      display: 'none',
    },
  }));
  
  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:'rgba(255, 255, 255, .05)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));
  
  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
    
  }));

  export default function AccordionHelper(props){
      return(
        <Box sx={{border:'1px solid rgba(0, 0, 0, .125)'}}>
          <Accordion expanded={props.expanded === 'panel0'} onChange={props.handleChange('panel0')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography>Location Type</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <RadioGroup
              onChange = {props.onChangeType}
              value = {props.venueTypeResult}
            >
            <FormControlLabel value="" control={<Radio />} label="Any"/>
            {props.venueType.map((type)=>(
            
                <FormControlLabel value={type} control={<Radio />} label={type} key={type}/>
            
            ))}
          </RadioGroup>
          </AccordionDetails>
        </Accordion>
          <Accordion expanded={props.expanded === 'panel1'} onChange={props.handleChange('panel1')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography>Size Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
          <FilledInput
              id="filled-adornment-size"
              value={props.minSizeValue}
              onChange={props.onChangeMinSize}
              endAdornment={<InputAdornment position="end">sq.F</InputAdornment>}
              
            />
            
            <FormHelperText id="standard-weight-helper-text">Min Size</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
            <FilledInput
              id="filled-adornment-size"
              value={props.maxSizeValue}
              onChange={props.onChangeMaxSize}
              endAdornment={<InputAdornment position="end">sq.F</InputAdornment>}
              aria-describedby="filled-weight-helper-text"
            />
            <FormHelperText id="standard-weight-helper-text">Max Size</FormHelperText>
            </Grid>
            
          </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={props.expanded === 'panel2'} onChange={props.handleChange('panel2')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography>People Count</Typography>
          </AccordionSummary>
          <AccordionDetails>
              <TextField
                  required
                  fullWidth
                  id="PeopleCount"
                  name="PeopleCount"
                  label="People Count"
                  onChange = {props.onChangePeopleCount}
                  value = {props.peopleCount}
                  
              />

          </AccordionDetails>
        </Accordion>
        <Accordion expanded={props.expanded === 'panel3'} onChange={props.handleChange('panel3')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography>Price Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
          <FilledInput
              id="filled-adornment-price"
              value={props.minPriceValue}
              onChange={props.onChangeMinPrice}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
            <FormHelperText id="standard-weight-helper-text">Min Price</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
            <FilledInput
              id="filled-adornment-price"
              value={props.maxPriceValue}
              onChange={props.onChangeMaxPrice}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              aria-describedby="filled-weight-helper-text"
            />
            <FormHelperText id="standard-weight-helper-text">Max Price</FormHelperText>
            </Grid>
          </Grid>
          </AccordionDetails>
          
        </Accordion>
        <Link onClick={props.onApplyingFilter} 
        variant="body2">
        Apply Filters
        </Link>
      </Box>

      )
  }
  