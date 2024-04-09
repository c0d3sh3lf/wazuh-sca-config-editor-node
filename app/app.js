const express = require('express');
const multer = require('multer');
const fs = require('fs');
const yaml = require('js-yaml');
const app = express();
const port = 3000;
const upload_dir = 'uploads/';

// Setup the storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, upload_dir)
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.yaml')
    }
});

const upload = multer({ storage: storage });

app.use(express.json({ limit: '5mb' }));

// Endpoint to get the YAML content
app.post('/fetch-config', upload.single('ruleset'), (req, res) => {
    try {
        //Read the file and parse its contents
        const fileContents = fs.readFileSync(req.file.path, 'utf-8');
        const data = yaml.load(fileContents);

        // Send the parsed content as a JSON response
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading YAML file');
    } finally {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });
    }
});

app.post('/fetch-yaml', (req, res) => {
    try {
        // Getting the configuration from the POST body.
        const configData = req.body;

        //Fetching the filename from the body
        const filename = configData.policy.file;

        //Converting the JSON to YAML
        const yamlData = yaml.dump(configData);

        // Setting headers to prompt download a YAML file
        res.setHeader('Content-Type', 'application/x-yaml');
        res.setHeader('Content-Disposition',`attachment; filename=${filename}`);

        //Sending the YAML data as file content
        res.send(yamlData);
    } catch (error) {
        console.error('Error converting to YAML: ', error);
        res.status(500).send('Failed to convert to YAML');
    }
});


app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});