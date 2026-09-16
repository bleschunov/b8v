resource "aws_apigatewayv2_api" "api" {
  name          = "posts-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://b8v.dev"]
    allow_methods = ["GET"]
  }
}

resource "aws_apigatewayv2_integration" "get_all_posts_lambda" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_all_posts_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "put_post_lambda" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.put_post_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "delete_post_lambda" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.delete_post_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_all_posts" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /posts"
  target    = "integrations/${aws_apigatewayv2_integration.get_all_posts_lambda.id}"
}

resource "aws_apigatewayv2_route" "put_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "PUT /post"
  target    = "integrations/${aws_apigatewayv2_integration.put_post_lambda.id}"

  authorization_type = "AWS_IAM"
}

resource "aws_apigatewayv2_route" "delete_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "DELETE /post"
  target    = "integrations/${aws_apigatewayv2_integration.delete_post_lambda.id}"

  authorization_type = "AWS_IAM"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gateway" {
  for_each = {
    get    = aws_lambda_function.get_all_posts_lambda
    create = aws_lambda_function.put_post_lambda
    delete = aws_lambda_function.delete_post_lambda
  }

  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_domain_name" "api" {
  count = var.create_api_domain ? 1 : 0

  domain_name = local.api_domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  count = var.create_api_domain ? 1 : 0

  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api[0].id
  stage       = aws_apigatewayv2_stage.default.id
}
