import json
import os
import typing as t

import boto3
from botocore.exceptions import ClientError
from pydantic import BaseModel, Field, RootModel
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


class Post(BaseModel):
    post_id: str
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    posted_at: datetime


PostsResponse = RootModel[list[Post]]

class PostsResponse(BaseModel):
    items: PostsResponse = Field(alias="Items")


def lambda_handler(event, context):
    try:
        posts = PostsResponse.model_validate(table.scan()).items

    except ClientError as e:
        print(f"DynamoDB error: {e.response['Error']['Message']}")
        return _response(500, {"error": "Could not fetch posts"})

    posts.root.sort(key=lambda p: p.posted_at, reverse=True)
    return _response(200, posts.model_dump(mode="json"))


def _response(status_code: int, body: Any):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(body),
    }