const express = require('express');
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
    console.log(req.body);

    //sends the info directly back to the client - use only for testing endpoints
    res.json(req.body);
});

//makes the server listen
//ports are the exact destination on the host
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});