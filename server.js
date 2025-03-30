const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/votingDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Schema & Model
const voteSchema = new mongoose.Schema({
    option: String,
    votes: { type: Number, default: 0 }
});
const Vote = mongoose.model('Vote', voteSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initialize candidates if not already present
async function initializeCandidates() {
    const candidates = ['Ram Sharma', 'Anand Bikram Shahi', 'Akshay Sharma', 'Raju'];
    for (let candidate of candidates) {
        await Vote.updateOne({ option: candidate }, { $setOnInsert: { votes: 0 } }, { upsert: true });
    }
}
initializeCandidates();

// Home route
app.get('/', async (req, res) => {
    const options = await Vote.find();
    res.render('index', { options });
});

// Vote route
app.post('/vote', async (req, res) => {
    const { option } = req.body;
    await Vote.findOneAndUpdate({ option }, { $inc: { votes: 1 } }, { upsert: true });
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
