import json
import os
from datetime import datetime, timezone
from uuid import uuid4

import boto3
from botocore.exceptions import ClientError
from pydantic import BaseModel, Field, ValidationError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


class Post(BaseModel):
    post_id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    posted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Request(BaseModel):
    body: str

def lambda_handler(event, context):
    try:
        request = Request.model_validate(event)
        post = Post.model_validate_json(request.body)
    except ValidationError as e:
        return _response(400, {"error": e.errors()})

    try:
        table.put_item(Item=post.model_dump(mode="json"))
    except ClientError as e:
        print(f"DynamoDB error: {e.response['Error']['Message']}")
        return _response(500, {"error": "could not save item"})

    return _response(201, post.model_dump(mode="json"))


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }