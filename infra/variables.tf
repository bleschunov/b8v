variable "domain_name" {
  description = "Main domain name"
  type        = string
}

variable "create_api_domain" {
  type    = bool
  default = false
}