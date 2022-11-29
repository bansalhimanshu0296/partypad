import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function Copyright(props) {
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={20}>
      
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="/">
        Party Pad
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
    </Paper>
  );
}
