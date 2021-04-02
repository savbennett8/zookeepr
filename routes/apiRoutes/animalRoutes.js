const { filterByQuery, findById, createNewAnimal, validateAnimal } = require('../../lib/animals');
const { animals } = require('../../data/animals');

const router = require('express').Router();

//adds the route that the front-end can request data from
//get(route the client will fetch from, callback function to execute each time this route is accessed w/GET request)
router.get('/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

//a param route must come after the other GET route
router.get('/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

//this creates a route that listens for POST requests for the server to accept data
router.post('/animals', (req, res) => {
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

module.exports = router;