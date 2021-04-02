const express = require('express');
const fs = require('fs');
//mod built into node - provides utilities for working w/file & directory paths
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();
const { animals } = require('./data/animals.json');

// ----------- Middleware ----------- //
// ---- use it when creating a server front end & JSON data ----- //

// --------- both functions need to be setup every time a server is  
// --------- looking to accept POST data ------- //
//parse incoming string or array data
//'express.urlencoded' method built into Express to convert POST data into
//key/value pairs that can be accessed in req.body.
//'extended: true' option informs the server that there could be
//sub-array data so it needs to look deep into the POST data
app.use(express.urlencoded({ extended: true }));
//parse incoming JSON data into req.body
app.use(express.json());

//allows the files in 'public' to be static/accessible
app.use(express.static('public'));

// -------------------------------------//

//adds the route that the front-end can request data from
//get(route the client will fetch from, callback function to execute each time this route is accessed w/GET request)
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

//a param route must come after the other GET route
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

//this creates a route that listens for POST requests for the server to accept data
app.post('/api/animals', (req, res) => {
    //req.body is where our incoming content will be
    //set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        //add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);

        //sends the info directly back to the client - use only for testing endpoints
        res.json(animal);
    }
});

// '/' is the route (to the root of the server) used to create a homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

//in case user makes request for route that doesn't exist--sends to homepage
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

//makes the server listen
//ports are the exact destination on the host
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});