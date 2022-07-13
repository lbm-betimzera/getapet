const express = require('express')
const cors = require('cors')

const app = express()

//config json
app.use(express.json())

// solve cors

app.use(cors({ credentials: true, origin: 'http://localhost:3000'}))

//public folder images
app.use(express.static('public'))

//routes

const UserRoutes = require('./routes/UserRoutes')
const { register } = require('./controllers/UserController')

app.use('/users', UserRoutes)

// app.use('/users/register', register)

app.get('/', (req,res)=> {
    res.json({message: 'BEM VINDO AO INDEX.JS'})
})

app.listen(5000)