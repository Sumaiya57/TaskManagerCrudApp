const express = require('express');
const fs = require('fs'); // Import the 'fs' module for file system operations
const app = express();
app.use(express.json());

// Initialize tasks array
let tasks = [];

// Function to read tasks from data.json file
function readTasksFromFile() {
    try {
        const data = fs.readFileSync('data.json'); // Read data from file
        tasks = JSON.parse(data); // Parse JSON data into tasks array
    } catch (err) {
        tasks = []; // If file doesn't exist or empty, initialize tasks as empty array
    }
}

// Function to write tasks to data.json file
function writeTasksToFile() {
    fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2)); // Write tasks array to file
}

// Generate a random task ID
function generateTaskId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Load tasks from file on server start
readTasksFromFile();

// POST endpoint to add a new task
app.post('/tasks', (req, res) => {
    const { title, description, status } = req.body;
    if (!title || !status) {
        return res.status(400).json({ error: 'Title and status are required' });
    }
    const task = {
        id: generateTaskId(),
        title,
        description: description || '',
        status
    };
    tasks.push(task);
    writeTasksToFile(); // Write tasks to file after adding new task
    res.status(201).json(task);
});

// GET endpoint to retrieve all tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// GET endpoint to retrieve a specific task by ID
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(task => task.id === req.params.id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
});

// PUT endpoint to update a task by ID
app.put('/tasks/:id', (req, res) => {
    const { title, description, status } = req.body;
    const task = tasks.find(task => task.id === req.params.id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    writeTasksToFile(); // Write tasks to file after updating task
    res.json(task);
});

// DELETE endpoint to delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    const index = tasks.findIndex(task => task.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    tasks.splice(index, 1);
    writeTasksToFile(); // Write tasks to file after deleting task
    res.sendStatus(204);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
