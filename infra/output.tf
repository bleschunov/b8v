
output "website_domain" {
  description = "Website domain"
  value       = var.domain_name
}

output "api_domain" {
  description = "API custom domain"
  value       = local.api_domain
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for the website DNS record"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "api_gateway_domain_name" {
  description = "API Gateway regional domain name for the API DNS record"
  value       = var.create_api_domain ? aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].target_domain_name : null
}

output "api_gateway_hosted_zone_id" {
  description = "Hosted zone ID required for an ALIAS record to API Gateway"
  value       = var.create_api_domain ? aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].hosted_zone_id : null
}

output "certificate_validation_records" {
  description = "DNS records required to validate the ACM certificates"
  value = {
    website = {
      for option in aws_acm_certificate.website.domain_validation_options :
      option.domain_name => {
        name  = option.resource_record_name
        type  = option.resource_record_type
        value = option.resource_record_value
      }
    }

    api = {
      for option in aws_acm_certificate.api.domain_validation_options :
      option.domain_name => {
        name  = option.resource_record_name
        type  = option.resource_record_type
        value = option.resource_record_value
      }
    }
  }
}
