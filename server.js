let express = require('express')
let fs = require('fs')
let cors = require('cors')
let nanoid = require('nanoid')
let path = require('path')

const { Client } = require('pg')
const client = new Client({
    host: 'ec2-3-234-109-123.compute-1.amazonaws.com',
    user: 'avrrhvttuasjer',
    password: '4e85ad72f51e0239d08abb7ae72018b19f609a0015454f6af2c775c4facc3462',
    database: 'd4naqt4ilruq0e',
    ssl: true
})

client.connect()

let app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let PORT = process.env.PORT || 1234

app.post('/api/user/login', (req, res) => {
    let { username, password } = req.body
    if (!(username && password)) {
        res.status(400).send('Check username or password')
        return
    }

    client.query('SELECT * FROM account WHERE username=$1', [username], (err, data) => {
        if (err) {
            res.json({ 'message': 'user not found' })
        }
        else if (data.rows[0] == undefined) {
            res.json({ 'message': 'user not found' })
        }
        else {
            if (data.rows[0]['password'] != password) {
                res.json({ 'message': 'password not matched' })
            }
            else {
                res.json({ 'message': 'logged in' })
            }
        }
    })

})

app.post('/api/user', (req, res) => {
    let { username, password } = req.body
    client.query('INSERT INTO account(username,password) VALUES ($1,$2)', [username, password],
        (err) => {
            if (err) {
                console.log(err.stack)
            }
        })
    res.status(201).send("User created")
})

app.get('/api/posts', async (req, res) => {
    client.query('SELECT * FROM post', (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            res.json(data.rows)
        }
    })
})

app.post('/api/posts', (req, res) => {
    let { name, topic, content } = req.body
    client.query('INSERT INTO post(username,topic,content) VALUES ($1,$2,$3)', [name, topic, content],
        (err) => {
            if (err) {
                console.log(err.stack)
            }
        })
    res.status(201).send("Post created")
})

app.get('/api/posts/:id', (req, res) => {
    let { id } = req.params
    let forsend;
    client.query('SELECT * FROM post WHERE id=$1', [id], (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            forsend = data.rows[0]
        }
    })
    client.query('SELECT * FROM comment WHERE post_id=$1', [id], (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(data.rows)
            res.json({...forsend,comment:[...data.rows]})
        }
    })
})

app.post('/api/posts/:id/reply', (req, res) => {
    let { id } = req.params
    let { name, reply } = req.body
    client.query('INSERT INTO comment(post_id,username,reply) VALUES ($1,$2,$3)', [id, name, reply],
        (err) => {
            if (err) {
                console.log(err.stack)
            }
        })
    res.status(202).send('Reply success')
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})

