const apiDoc = {
    swagger: "2.0",
    basePath: "/v1",
    info: {
        title: "Provides centralized access to BetterCCW\'s job scheduler",
        version: "1.0.0"
    },
    definitions: {
        JobParameters: {
          type: "object",
          properties: {
               cookie: {
                   description: "Auth cookie",
                   type: "string"
               },
              searchParameters: {
                   description: "Parameters Cisco is expecting to collect data",
                  type: "object"
              },
              localParameters: {
                   description: "Parameters used locally to filter results from Cisco",
                  type: "object"
              }
          }
        },
        Job: {
            type: "object",
            properties: {
                jobID: {
                    description: "ID of the Job, defaults to \"\<requester\>:\<startTime\>\" in Base64",
                    type: "string",
                    example: "c3RhcmtjYTkwQGdtYWlsLmNvbToyMDIxLTA0LTE1VDE3OjQ2OjI0LjQ4OFoK"
                },
                jobStatus: {
                    description: "Current status of Job",
                    type: "string",
                    default: "new"
                },
                startTime: {
                    description: "Time the Job started in UTC",
                    type: "string",
                    format: "date-time",
                    example: "2021-04-15T17:46:24.488Z"
                },
                endTime: {
                    description: "Time the Job ended in UTC",
                    type: "string",
                    format: "date-time"
                },
                requester: {
                    description: "Email of the requester",
                    type: "string",
                    example: "starkca90@gmail.com"
                },
                parameters: {
                    "$ref": "#/definitions/JobParameters"
                }
            }
        },
        NewJob: {
            type: "object",
            allOf: [
                {
                    $ref: "#/definitions/Job"
                }
            ],
            required: [
                "requester",
                "parameters"
            ]
        },
        UpdateJob: {
            type: "array",
            items: {
                type: "object"
            }
        }
    },
    paths: {}
}

module.exports = apiDoc