const axios = require('axios')
const moment = require('moment')
const btoa = require('btoa')

const db_path = 'http://' + process.env.DB_DRIVER_HOST + '/' + process.env.DB_DRIVER_VER + '/' + process.env.DB_DRIVER_PATH

module.exports = function() {
    const operations = {
        GET,
        POST,
        PATCH
    }

    function GET(req, res, next) {
        console.log(req.query)

        if(req.query.job !== undefined) {
            console.log('job Present')
            console.log(req.query.job)

            axios.get(db_path, {params: {job: req.query.job.toString()}}).then((response) => {
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

    function POST(req, res, next) {
        console.log('Job POST Received')
        let reqBody = req.body

        if(reqBody.jobStatus !== 'new') {
            res.status(400)
            res.send('jobStatus suggests this is not a new request, use PATCH to update a job')
            return
        }

        if(reqBody.startTime === undefined)
            reqBody.startTime = moment().format()

        if(reqBody.jobID === undefined) {
            reqBody.jobID = btoa(reqBody.requester + ':' + reqBody.startTime)
        }

        // TODO: Create worker

        axios.post(db_path, reqBody, {
            headers: {'Content-Type': 'application/json'}
        }).then((response) => {
            res.status(response.status).send(reqBody)
        }).catch(error => {
            console.error(error)
            res.status(500).send('ERROR')
        })
    }

    function PATCH(req, res, next) {
        const jobID = req.headers['if-match']

        axios.get(db_path, {params: {job: jobID}}).then((response) => {
            let modified = false
            let job

            if (Array.isArray(response.data) && response.data.length === 1) {
                job = response.data[0]
            } else {
                res.status(404).send('Unable to locate requested job')
            }

            const patches = req.body

            try {
                patches.forEach(patch => {

                    if((patch.path === 'parameters' || patch.path === 'jobID' || patch.path === 'startTime' || patch.path === 'requester') && patch.op !== 'test')
                        throw new Error('Unable to PATCH requested Path: Patch = {op: \"' + patch.op + '\", path: \"' + patch.path + '\"}')


                    switch(patch.op) {
                        case "add":
                            modified = true
                            job[patch.path] = patch.value
                            break
                        case "remove":
                            if(job[patch.path] !== undefined) {
                                modified = true
                                delete(job[patch.path])
                            } else
                                throw new Error('Remove Failure: Path Does not Exist Patch = {op: \"remove\", path: \"' + patch.path + '}')
                            break
                        case "replace":
                            if(job[patch.path] !== undefined) {
                                modified = true
                                job[patch.path] = patch.value
                            } else
                                throw new Error('Replace Failure: Path Does not Exist Patch = {op: \"replace\", path: \"' + patch.path + '\", value: \"' + patch.value + '\"}')
                            break
                        case "test":
                            if(job[patch.path] !== patch.value) {
                                throw new Error('Test Failure: CurrentValue = ' + job[patch.path] + ' Patch = {op: \"test\", path: \"' + patch.path + '\", value: \"' + patch.value + '\"}')
                            }
                            break
                        default:
                            throw new Error('Unsupported op: Patch = {op: \"' + patch.op + '\", path: \"' + patch.path + '\"}')

                    }
                })
            } catch(exception) {
                res.status(422).send(exception.message)
                return
            }

            if(modified) {
                axios.post(db_path, job, {
                    headers: {'Content-Type': 'application/json'}
                }).then((response) => {
                    console.log(response)
                    res.status(204).send()
                }).catch(error => {
                    console.error(error)
                    res.status(500).send('ERROR')
                })
            } else {
                res.status(204).send()
            }


        }).catch(error => {
            console.log(error)
            res.status(500).send('ERROR')
        })

    }

    GET.apiDoc = {
        summary: "Returns information about the requested Job",
        operationId: "getJobs",
        parameters: [
            {
                in: "query",
                name: "job",
                required: true,
                type: "string"
            }
        ],
        responses: {
            200: {
                description: "Information about the job that match the requested job",
                schema: {
                    type: "object",
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

    POST.apiDoc = {
        summary: "Creates a new job and creates a worker",
        operationId: "createJobs",
        parameters: [
            {
                in: "body",
                name: "job",
                schema: {
                    $ref: "#/definitions/NewJob"
                }

            }
        ],
        responses: {
            200: {
                description: "Job Created",
                schema: {
                    type: "object",
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

    PATCH.apiDoc = {
        summary: "Updates an existing job",
        operationId: "updateJobs",
        parameters: [
            {
                in: "body",
                name: "job",
                schema: {
                    $ref: "#/definitions/UpdateJob"
                }
            }
        ],
        responses: {
            200: {
                description: "Job Updated"
            }
        }
    }

    return operations
}