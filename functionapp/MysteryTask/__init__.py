import json
import logging

import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    response_body = []
    try:
        req_body = req.get_json()
        input_data = req_body["input_data"]

        for row in input_data:
            pass # FILL IN WITH YOUR CODE
            # response_body.append(...)



    # ERROR HANDLING
    except ValueError:
        return func.HttpResponse(
             json.dumps({"error": "Unable to read the json body."}),
             status_code=400,
             headers= {"Content-Type": "application/json"}
        )
    except KeyError:
        return func.HttpResponse(
             json.dumps({"error": "Unable to find the input_data key."}),
             status_code=400,
             headers= {"Content-Type": "application/json"}
        )
    except TypeError:
        message = "There was a TypeError"
        if not isinstance(input_data, list):
            message = "The input data is not a list type"
        return func.HttpResponse(
             json.dumps({"error": message}),
             status_code=400,
             headers= {"Content-Type": "application/json"}
        )



    # This is the success scenario
    return func.HttpResponse(
            json.dumps(response_body),
            status_code=200,
            headers= {"Content-Type": "application/json"}
            
    )
