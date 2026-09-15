resource "aws_iam_role_policy" "dynamodb" {
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
      ]

      Resource = aws_dynamodb_table.posts.arn
    }]
  })
}