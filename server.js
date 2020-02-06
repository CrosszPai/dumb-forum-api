let express = require('express')
let fs = require('fs')
let app = express()
let cors = require('cors')
let nanoid = require('nanoid')
let path = require('path')
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
let PORT = process.env.PORT || 1234
const filePath = path.join(__dirname, 'data.json')
let exist = fs.existsSync(filePath)
let app_data = {
    posts: [],
    user: []
}

if (exist) {
    try {
        app_data = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
    } catch (err) {
        app_data = app_data = {
            posts: [],
            user: []
        }
    }
} else {
    fs.openSync(filePath, 'w', (err) => {
        throw err
    })
}

app.post('/api/user/login', (req, res) => {
    let { username, password } = req.body
    if (!(username && password)) {
        res.status(400).send('Check username or password')
        return
    }
    let index = app_data.user.findIndex(v => v.username === username && v.password === password)
    if (index === -1) {
        res.status(401).send('not found user')
    } else {
        res.status(200).send('success')
    }
})

app.post('/api/user', (req, res) => {
    let { username, password } = req.body
    let index = app_data.user.findIndex(v => v.username === username)
    if (index !== -1) {
        res.status(401).send('username already taken')
    } else {
        app_data.user.push({
            username,
            password
        })
        fs.writeFileSync(filePath, JSON.stringify(app_data))
        res.status(200).send('success')
    }
})

app.get('/api/posts', (req, res) => {
    res.json(app_data.posts.map(v => {
        return {
            id: v.id,
            name: v.name,
            topic: v.topic
        }
    })
    )
})

app.post('/api/posts', (req, res) => {
    let { name, topic, content } = req.body
    console.log(req.body)
    let tempId = nanoid(6)
    app_data.posts.push({
        id: tempId,
        name,
        topic,
        content,
        comment: []
    })
    fs.writeFileSync(filePath, JSON.stringify(app_data))
    res.status(201).send(tempId)
})

app.get('/api/posts/:id', (req, res) => {
    let { id } = req.params
    let target = app_data.posts.filter(v => v.id === id)
    res.json(target.pop())
})

app.post('/api/posts/:id/reply', (req, res) => {
    let { id } = req.params
    let { name, reply } = req.body
    let targetIndex = app_data.posts.findIndex(v => v.id === id)
    app_data.posts[targetIndex].comment.push({
        name,
        reply
    })
    fs.writeFileSync(filePath, JSON.stringify(app_data))
    res.status(202).send('Reply success')
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})
