import json
import os

import boto3
from botocore.exceptions import ClientError
from pydantic import BaseModel, Json, ValidationError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

class Request(BaseModel):
    body: Json

def lambda_handler(event, context):
    try:
        request = Request.model_validate(event)
        post_id = request.body
    except ValidationError as e:
        return _response(400, {"error": e.errors()})

    try:
        table.delete_item(Key={"post_id": post_id})
    except ClientError as e:
        print(f"DynamoDB error: {e.response['Error']['Message']}")
        return _response(500, {"error": "could not delete item"})

    return _response(204, "")


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
    }