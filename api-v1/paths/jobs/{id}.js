const axios = require('axios')

const db_path = 'http://' + process.env.DB_DRIVER_HOST + '/' + process.env.DB_DRIVER_VER + '/' + process.env.DB_DRIVER_PATH

module.exports = {
    parameters: [
        {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true
        }
    ],
    DELETE: DELETE
}

function DELETE(req, res, next) {
    // First attempt to get the job from the database
    axios.get(db_path, {params: {job: req.params.id}}).then((response) => {
        // A document was found, so job must exist
        console.log(response.data[0])

        //TODO: Perform other job cleanup

        axios.delete(db_path + '/' + req.params.id).then(response => {
            console.log(response)

            res.status(204).send()
        }).catch(error => {
            if(error.response.status === 404)
                res.status(404).send()
            else {
                console.log(error)
                res.status(500).send('ERROR')
            }
        })
    }).catch(error => {
        if(error.response.status === 404)
            res.status(404).send()
        else {
            console.log(error)
            res.status(500).send('ERROR')
        }
    })
}

DELETE.apiDoc = {
    summary: "Deletes an existing job",
    operationId: "deleteJobs",
    responses: {
        204: {
            description: "Job Deleted"
        },
        404: {
            description: "Unable to located specified job"
        }
    }
}