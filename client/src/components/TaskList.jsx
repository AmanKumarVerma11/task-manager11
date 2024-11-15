import { useSelector } from 'react-redux';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

const TaskList = () => {
  const tasks = useSelector((state) => state.tasks.tasks);

  return (
    <Paper elevation={3} style={{ padding: '20px', maxWidth: '500px', margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
        Task List
      </Typography>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id}>
            <ListItemText 
              primary={task.title} 
              secondary={`Status: ${task.status}`} 
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TaskList;