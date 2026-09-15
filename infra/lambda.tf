data "archive_file" "get_all_posts" {
  type        = "zip"
  source_file = "${path.module}/../api/get_all_posts.py"
  output_path = "${path.module}/../dist/get_all_posts.zip"
}

data "archive_file" "put_post" {
  type        = "zip"
  source_file = "${path.module}/../api/put_post.py"
  output_path = "${path.module}/../dist/put_post.zip"
}

data "archive_file" "delete_post" {
  type        = "zip"
  source_file = "${path.module}/../api/delete_post.py"
  output_path = "${path.module}/../dist/delete_post.zip"
}

resource "aws_lambda_function" "delete_post_lambda" {
  function_name = "delete_post"

  runtime = "python3.14"
  handler = "delete_post.lambda_handler"

  role = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.posts.name
    }
  }

  filename         = data.archive_file.delete_post.output_path
  source_code_hash = data.archive_file.delete_post.output_base64sha256

  layers = [
    aws_lambda_layer_version.dependencies.arn
  ]
}

resource "aws_lambda_function" "get_all_posts_lambda" {
  function_name = "get_all_posts"

  runtime = "python3.14"
  handler = "get_all_posts.lambda_handler"

  role = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.posts.name
    }
  }

  filename         = data.archive_file.get_all_posts.output_path
  source_code_hash = data.archive_file.get_all_posts.output_base64sha256

  layers = [
    aws_lambda_layer_version.dependencies.arn
  ]
}

resource "aws_lambda_function" "put_post_lambda" {
  function_name = "put_post"

  runtime = "python3.14"
  handler = "put_post.lambda_handler"

  role = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.posts.name
    }
  }

  filename         = data.archive_file.put_post.output_path
  source_code_hash = data.archive_file.put_post.output_base64sha256

  layers = [
    aws_lambda_layer_version.dependencies.arn
  ]
}