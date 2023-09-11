import Venues from "./Venues";
import React, { useEffect, useState } from "react"
import { Box } from "@mui/system";
import { Pagination } from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AccordionHelper from "./helper/AccordionHelper";
import Search from "./Search";
import Grid from '@mui/material/Grid';
import { checkIfNumber } from "./validation";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef((
  props,
  ref,
) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const theme = createTheme();

export default function Browse() {
  let [paginationPage, setPaginationPage] = useState(1);
  let [pageNumbers, setPageNumbers] = useState(0)
  let [data, setData] = useState([])
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState("");
  let [venueType, setVenueType] = useState([])
  let [venueTypeResult, setVenueTypeResult] = useState("")
  let [state, setState] = useState([{ value: "", label: "--" }])
  let [stateResult, setStateResult] = useState("")
  let [minSizeValue, setMinSizeValue] = useState("")
  let [maxSizeValue, setMaxSizeValue] = useState("")
  let [peopleCount, setPeopleCount] = useState("")
  let [minPriceValue, setMinPriceValue] = useState("")
  let [maxPriceValue, setMaxPriceValue] = useState("")
  let [cities, setCities] = useState([{ value: "", label: "--" }])
  let [cityResult, setCityResult] = useState("")
  let [searchValue, setSearchValue] = useState("")
  let [noData, setNoData] = useState("")
  let [errorMessage, setErrorMessage] = useState("")
  let [isSnackBarOpen, setIsSnackBarOpen] = useState(false)
  const handleChange = (panel) => (
    event,
    newExpanded
  ) => {
    setExpanded(newExpanded ? panel : false);
  };

  useEffect(() => {
    if (localStorage.getItem('user') === null || localStorage.getItem('user').length === 0) {
      navigate("/")
    }
    if (localStorage.getItem("role") === "Owner") {
      navigate("/dashboard")
    }
    setCities([{ value: "", label: "--" }])
    setCityResult("")
    setSearchValue("")
    axios.post(process.env.REACT_APP_VM_IP + "/app/Search_Venue", {
      page: 1,
      searchValue: "",
      sizeRangeStart: "",
      sizeRangeEnd: "",
      venueType: "",
      peopleCount: "",
      priceRangeStart: "",
      priceRangeEnd: "",
      venueAddrCity: "",
      venueAddrState: ""
    }).then(res => {
      if (res.data.status === "OK") {
        if (res.data.data.totalCount === 0) {
          setNoData("No Data Present for your search.")
        } else {
          setNoData("")
        }
        if (res.data.data.totalCount % 10 === 0) {
          setPageNumbers(Math.floor(res.data.data.totalCount / 10))
        }
        else {
          setPageNumbers(Math.floor(res.data.data.totalCount / 10) + 1)
        }
        setData(res.data.data.searchResult)
      } else {
        setErrorMessage(res.data.message)
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
      console.log("Server Error")
    })
    axios.get(process.env.REACT_APP_VM_IP + "/app/Fetch_Venue_Types").then(res => {
      if (res.data.status === "OK") {
        setVenueType(res.data.data)
        setVenueTypeResult("")
      } else {
        setErrorMessage(res.data.message)
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
      console.log("Server Error")
    })
    axios.get("https://parseapi.back4app.com/classes/Usstatesdataset_States?keys=postalAbreviation", {
      headers: {
        'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
        'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
      }
    }).then(res => {
      if (res.status === 200) {
        let state_arr = [{ value: "", label: "--" }]
        res.data.results.map(element => state_arr.push({ value: element.postalAbreviation, label: element.postalAbreviation }))
        setStateResult("")
        setState(state_arr)
      } else {
        let state_arr = [{ value: "", label: "--" }]
        setErrorMessage("3rd Party Server Error")
        setIsSnackBarOpen(true)
        setStateResult("")
        setState(state_arr)
      }
    }).catch(e => {
      let state_arr = [{ value: "", label: "--" }]
      setStateResult("")
      setState(state_arr)
      setErrorMessage("3rd Party Server Error")
      setIsSnackBarOpen(true)
      console.log("Server Error")
    })
  }, [])
  const onChangeType = (e) => {
    setVenueTypeResult(e.target.value)
  }
  const onCloseSnackBar = () => {
    setIsSnackBarOpen(false)
  }
  const onApplyingFilter = () => {
    axios.post(process.env.REACT_APP_VM_IP + "/app/Search_Venue", {
      page: 1,
      searchValue: searchValue,
      sizeRangeStart: minSizeValue,
      sizeRangeEnd: maxSizeValue,
      venueType: venueTypeResult,
      peopleCount: peopleCount,
      priceRangeStart: minPriceValue,
      priceRangeEnd: maxPriceValue,
      venueAddrCity: cityResult,
      venueAddrState: stateResult
    }).then(res => {
      if (res.data.status === "OK") {
        setPaginationPage(1);
        if (res.data.data.totalCount === 0) {
          setNoData("No Data Present for your search.")
        } else {
          setNoData("")
        }
        if (res.data.data.totalCount % 10 === 0) {
          setPageNumbers(Math.floor(res.data.data.totalCount / 10))
        }
        else {
          setPageNumbers(Math.floor(res.data.data.totalCount / 10) + 1)
        }
        setData(res.data.data.searchResult)
      } else {
        setErrorMessage(res.data.message)
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
      console.log("Server Error")
    })
  }
  const onChangeMinSize = (e) => {

    if (checkIfNumber(e.target.value)) {
      setMinSizeValue(e.target.value)
    }
  }
  const onChangeMaxSize = (e) => {
    if (checkIfNumber(e.target.value)) {
      setMaxSizeValue(e.target.value)
    }
  }
  const onChangePeopleCount = (e) => {
    if (checkIfNumber(e.target.value)) {
      setPeopleCount(e.target.value)
    }
  }
  const onChangeMinPrice = (e) => {
    if (checkIfNumber(e.target.value)) {
      setMinPriceValue(e.target.value)
    }
  }
  const onChangeMaxPrice = (e) => {
    if (checkIfNumber(e.target.value)) {
      setMaxPriceValue(e.target.value)
    }
  }
  const handleStateChange = (e) => {
    setStateResult(e.target.value)
    if (e.target.value === "") {
      setCities([{ value: "", label: "--" }])
      setCityResult("")
    } else {
      axios.get("https://parseapi.back4app.com/classes/Usabystate_" + e.target.value + "?limit=1500&keys=name", {
        headers: {
          'X-Parse-Application-Id': '11NvTUXBKzkpomi5tz6hwgvAOwBI4zyDpDVLZLN8', // This is your app's application id
          'X-Parse-REST-API-Key': 'yxkgosbhI7LIQrkIBepO0uSiq1GTbeKEOP1HJBi1', // This is your app's REST API key
        }
      }).then(res => {
        if (res.status === 200) {
          let city_arr = [{ value: "", label: "--" }]
          res.data.results = res.data.results.sort((a, b) => {
            return a.name.localeCompare(b.name)
          })
          res.data.results.map(element => city_arr.push({ value: element.name, label: element.name }))
          setCities(city_arr)
          setCityResult("")
        } else {
          let city_arr = [{ value: "", label: "--" }]
          setCities(city_arr)
          setCityResult("")
          setErrorMessage("3rd Party Server Error")
          setIsSnackBarOpen(true)
        }
      }).catch(e => {
        let city_arr = [{ value: "", label: "--" }]
        setCities(city_arr)
        setCityResult("")
        setErrorMessage("3rd Party Server Error")
        setIsSnackBarOpen(true)
        console.log("Server Error")
      })
    }
  }
  const onHandleCityChange = (e) => {
    setCityResult(e.target.value)
  }

  const onSearchValueChange = (e) => {
    setSearchValue(e.target.value)
  }
  const handleChangePage = (
    event,
    newPage,
  ) => {
    axios.post(process.env.REACT_APP_VM_IP + "/app/Search_Venue", {
      page: newPage,
      searchValue: searchValue,
      sizeRangeStart: minSizeValue,
      sizeRangeEnd: maxSizeValue,
      venueType: venueTypeResult,
      peopleCount: peopleCount,
      priceRangeStart: minPriceValue,
      priceRangeEnd: maxPriceValue,
      venueAddrCity: cityResult,
      venueAddrState: stateResult
    }).then(res => {
      if (res.data.status === "OK") {
        setPaginationPage(newPage)
        if (res.data.data.totalCount === 0) {
          setNoData("No Data Present for your search.")
        } else {
          setNoData("")
        }
        if (res.data.data.totalCount % 10 === 0) {
          setPageNumbers(Math.floor(res.data.data.totalCount / 10))
        }
        else {
          setPageNumbers(Math.floor(res.data.data.totalCount / 10) + 1)
        }
        setData(res.data.data.searchResult)
      } else {
        setErrorMessage(res.data.errorMessage)
        setIsSnackBarOpen(true)
      }
    }).catch(e => {
      setErrorMessage("Server Error")
      setIsSnackBarOpen(true)
      console.log("Server Error")
    })

  };
  return (
    <ThemeProvider theme={theme}>
      <Snackbar open={isSnackBarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={onCloseSnackBar}>
        <Alert onClose={onCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9} style={{ paddingLeft: "38px" }}>
          <Search state={state} stateResult={stateResult} handleStateChange={handleStateChange}
            cities={cities} cityResult={cityResult} onHandleCityChange={onHandleCityChange}
            searchValue={searchValue} onSearchValueChange={onSearchValueChange} onSearch={onApplyingFilter} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <AccordionHelper handleChange={handleChange} expanded={expanded} venueType={venueType}
            venueTypeResult={venueTypeResult} onChangeType={onChangeType} minSizeValue={minSizeValue}
            maxSizeValue={maxSizeValue} onChangeMaxSize={onChangeMaxSize} onChangeMinSize={onChangeMinSize}
            peopleCount={peopleCount} onChangePeopleCount={onChangePeopleCount}
            maxPriceValue={maxPriceValue} minPriceValue={minPriceValue} onChangeMinPrice={onChangeMinPrice}
            onChangeMaxPrice={onChangeMaxPrice} onApplyingFilter={onApplyingFilter} />
        </Grid>
        <Grid item xs={12} sm={9}>
          <Box style={{ height: "68vh", overflowY: "scroll" }}>
            <Container component="main" maxWidth="lg">
              <CssBaseline />
              {data.length !== 0 && <Venues data={data} />}
              {data.length === 0 && noData}
            </Container>
          </Box>
          {pageNumbers !== 0 && <Pagination count={pageNumbers} page={paginationPage} style={{ paddingTop: "15px" }} onChange={handleChangePage} />}


        </Grid>
      </Grid>
    </ThemeProvider>
  )
}