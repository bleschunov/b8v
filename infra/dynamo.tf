resource "aws_dynamodb_table" "posts" {
  name         = "posts"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "post_id"

  attribute {
    name = "post_id"
    type = "S"
  }
}