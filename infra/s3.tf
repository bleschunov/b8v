resource "aws_s3_bucket" "s3_bucket" {
  bucket = "${var.domain_name}-s3-bucket"
}

resource "aws_s3_object" "index" {
  bucket = aws_s3_bucket.s3_bucket.id
  key    = "index.html"
  source = "../website/index.html"

  content_type = "text/html"
}

resource "aws_s3_object" "err404" {
  bucket = aws_s3_bucket.s3_bucket.id
  key    = "404.html"
  source = "../website/404.html"

  content_type = "text/html"
}
