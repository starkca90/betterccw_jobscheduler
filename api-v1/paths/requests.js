const axios = require('axios')

const db_path = 'http://' + process.env.DB_DRIVER_HOST + '/' + process.env.DB_DRIVER_VER + '/' + process.env.DB_DRIVER_PATH_REQUESTS

module.exports = function() {
    const operations = {
        GET
    }

    function GET(req, res, next) {
        console.log(req.query)

        if(req.query.requester !== undefined) {
            console.log('requester Present')

            axios.get(db_path, {params: {requester: req.query.requester.toString()}}).then((response) => {
                res.status(response.status).send(response.data)
            }).catch(error => {
                if(error.response.status === 404)
                    res.status(404).send()
                else {
                    console.log(error)
                    res.status(500).send('ERROR')
                }
            })
        } else {
            res.status(400)
            res.send('One of the request inputs is not valid.')
        }
    }

     GET.apiDoc = {
        summary: "Returns all requests requester has",
        operationId: "getRequests",
        parameters: [
            {
                in: "query",
                name: "requester",
                required: true,
                type: "string"
            }
        ],
        responses: {
            200: {
                description: "Information about the jobs made by the requester",
                schema: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/Job"
                    }
                }
            },
            400: {
                description: "Expected parameter missing"
            }
        }
    }

    return operations
}