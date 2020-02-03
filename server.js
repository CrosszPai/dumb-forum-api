let express = require('express')
let fs = require('fs')
let app = express()
let cors = require('cors')
let faker = require('faker')
let nanoid = require('nanoid')
let path = require('path')
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
let PORT = process.env.PORT || 1234
let post = []
const filePath = path.join(__dirname, 'data.json')
let exist = fs.existsSync(filePath)

if (exist) {
    try {
        post = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
    } catch (err) {
        post = []
    }
} else {
    fs.openSync(filePath, 'w', (err) => {
        throw err
    })
}



app.get('/api/posts', (req, res) => {
    res.json(post.map(v => {
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
    post.push({
        id: nanoid(6),
        name,
        topic,
        content,
        comment: []
    })
    fs.writeFileSync(filePath, JSON.stringify(post))
    res.status(201).send('created')
})

app.get('/api/posts/:id', (req, res) => {
    let { id } = req.params
    let target = post.filter(v => v.id === id)
    res.json(target.pop())
})

app.put('/api/posts/:id/reply', (req, res) => {
    let { id } = req.params
    let { name, reply } = req.body
    let targetIndex = post.findIndex(v => v.id === id)
    post[targetIndex].comment.push({
        name,
        reply
    })
    fs.writeFileSync(filePath, JSON.stringify(post))
    res.status(202).send('Reply success')
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})