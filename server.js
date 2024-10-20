const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "cmd" directory
app.use(express.static(path.join(__dirname, 'cmd')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cmd', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});