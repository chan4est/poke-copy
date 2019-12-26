const express = require('express');
const request = require('request');
const fs = require('fs')
const app = express();

var poke_map;

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};


var index_html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Pokemon Copier</title>
        <style>
            .grid-container {
                display: grid;
                background-color: #2196F3;
                padding: 10px;
            }
            .btn {
                background-color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.8);
                padding: 20px;
                font-size: 30px;
                text-align: center;
            }
        </style>
        <meta name="Pokemon" content="width=device-width, initial-scale=1">
    </head>

    <body>
            <div class="grid-container">
    {}      
            </div>

        <!-- 2. Include library -->
        <script src="https://cdn.jsdelivr.net/npm/clipboard@2/dist/clipboard.min.js"></script>

        <!-- 3. Instantiate clipboard by passing a string selector -->
        <script>
            var clipboard = new ClipboardJS('.btn');
        </script>
    </body>

    </html>
`

async function get_names() {
    await request('https://pokemon-names-api.herokuapp.com/pokemon/', function (err, res, body) {
        // console.log(body);
        poke_map = JSON.parse(body);
        // console.log(typeof poke_map)
        // console.log(poke_map)
        remove_index()
        create_index()
    })
}

function remove_index() {
    const path = "./index.html"
    try {
        fs.unlinkSync(path)
    } catch (err) {
        console.error(err)
    }
}



function create_index() {
    var index = "";
    var my_str = `\t\t
        <button class="btn" data-clipboard-text="{}"> 
            {} - {} 
        </button> </br>
    \n`

    for (i in poke_map) {
        const row = poke_map[i]
        const line = my_str.format(row[1], row[0], row[1])
        index += line
    }

    fs.writeFile("index.html", index_html.format(index), (err) => {
        if (err) {
            console.log("Error writing to index.html")
        }
    })
}

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/index.html');
})

// IMPORTANT! NEED THIS FOR AUTO PORT ON HEROKU
app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    get_names();
});