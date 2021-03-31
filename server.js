const express = require('express');
const fs = require('fs');
//mod built into node - provides utilities for working w/file & directory paths
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();
const { animals } = require('./data/animals.json');

// ----------- Middleware ----------- //
// --------- both functions need to be setup every time a server is looking to 
// --------- accept POST data ------- //
//parse incoming string or array data
//'express...' method built into Express to convert POST data into
//key/value pairs that can be accessed in req.body.
//'extended: true' option informs the server that there could be
//sub-array data so it needs to look deep into the POST data
app.use(express.urlencoded({ extended: true }));
//parse incoming JSON data into req.body
app.use(express.json());

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    //note that we saved the animalsArray as filteredResults here
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        //save personalityTraits as a dedicated array
        //if personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        //loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            //Check the trait agains each animal in the filteredresults array.
            //Remember, it's initially a copy of the animalsArray,
            //but here we're updating it for each train in the .forEach() loop.
            //For each train being targeted by the filter, the filteredResults
            //array will then contain only the entries that ocntain the train,
            //so at the end we'll have an array of animals that have every one
            //of the trains when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }

    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);

    fs.writeFileSync(
        //joins the value of '__dirname' which reps the directory of the file 
        //we execute the code in, w the path to the 'animals.json' file 
        path.join(__dirname, './data/animals.json'),
        //'null' means we're not editing any existing data
        //'2' says we want to leave white space between values 
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
}

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

//makes the server listen
//ports are the exact destination on the host
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});