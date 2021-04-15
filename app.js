const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const v1ApiDoc = require('./api-v1/api-doc')

const {initialize} = require('express-openapi')
const swaggerUi = require('swagger-ui-express')

const app = express()

app.use(logger('dev'))
app.use(express.json({
    type: 'application/json'
}))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.listen(3030)

initialize({
    app,
    apiDoc: v1ApiDoc,
    errorMiddleware: function(err, req, res, next) {
        console.error(err)

        res.status(err.status).send(err.errors)
    },
    paths: "./api-v1/paths"
})

app.use(
    "/api-documentation",
    swaggerUi.serve,
    swaggerUi.setup(null, {
        swaggerOptions: {
            url: "http://localhost:3030/v1/api-docs",
            explorer: true
        }
    })
)

module.exports = app
