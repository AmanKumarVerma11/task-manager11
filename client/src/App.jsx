import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography } from '@mui/material';
import { store } from './store'; // Updated import path
import TaskList from './components/TaskList';

const theme = createTheme();

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Task Management App
            </Typography>
          </Toolbar>
        </AppBar>
        <Container>
          <TaskList />
        </Container>
      </ThemeProvider>
    </Provider>
  );
}

export default App;