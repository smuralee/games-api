/**
 *    Copyright 2020 Suraj Muraleedharan
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

const express = require("express");
const app = express()
const db = require("./db.js");
const os = require("os");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

console.log("Games server starting...");

app.get('/', function (req, res) {
    let remoteAddr = req.socket.remoteAddress;
    console.log("Received request from " + remoteAddr);
    res.end(
        "Received request from " +
        remoteAddr +
        "\n" +
        "You've hit " +
        os.hostname() +
        "\n"
    );
});

app.get("/games", (req, res, next) => {
    const sql = "select * from games";
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(404).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

app.get("/games/:id", (req, res, next) => {
    const sql = "select * from games where id = ?"
    const params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(404).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": row
        })
    });
});

app.post("/games/", (req, res, next) => {
    const data = {
        name: req.body.name,
        publisher: req.body.publisher
    };
    const sql = 'INSERT INTO games (name, publisher) VALUES (?,?)'
    const params = [data.name, data.publisher]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        })
    });
});

app.put("/games/:id", (req, res, next) => {
    const data = {
        name: req.body.name,
        publisher: req.body.publisher
    };
    db.run(
        `UPDATE games
         set name      = coalesce(?, name),
             publisher = COALESCE(?, publisher)
         WHERE id = ?`,
        [data.name, data.publisher, req.params.id],
        (err, result) => {
            if (err) {
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data
            })
        });
});


app.delete("/games/:id", (req, res, next) => {
    db.run(
        'DELETE FROM games WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message": "deleted", rows: this.changes})
        });
});

app.listen(8080)
