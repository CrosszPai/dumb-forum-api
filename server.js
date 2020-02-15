let express = require('express')
let fs = require('fs')
let cors = require('cors')
let nanoid = require('nanoid')
let path = require('path')

const { Client } = require('pg')
const client = new Client({
    host: '13.76.33.58',
    user: 'postgres',
    password: 'P@$$',
    database: 'TueKan',
    ssl: true,
    port: '5432'
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

app.post('/api/user', async (req, res) => {
    let { username, password } = req.body
    await client.query('INSERT INTO account(username,password) VALUES ($1,$2)', [username, password],
        (err) => {
            if (err) {
                console.log(err.stack)
                res.status(406).send("already has user")
            }else{
                res.status(201).send("User created")
            }
        })

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
            res.json({ ...forsend, comment: [...data.rows] })
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

