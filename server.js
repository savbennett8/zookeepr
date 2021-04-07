const express = require('express');
const fs = require('fs');
//mod built into node - provides utilities for working w/file & directory paths
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();
const { animals } = require('./data/animals.json');
const apiRoutes = require('./routes/apiRoutes');
const htmlRoutes = require('./routes/htmlRoutes');

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

app.use('/api', apiRoutes);
app.use('/', htmlRoutes);

// -------------------------------------//

//makes the server listen
//ports are the exact destination on the host
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});