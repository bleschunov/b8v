provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  s3_origin_id = "myS3Origin"
  api_domain   = "api.${var.domain_name}"
}

terraform {
  backend "s3" {
    bucket       = "b8v-blog-terraform-state"
    key          = "terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}