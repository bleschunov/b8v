data "archive_file" "layer" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/layer_build"
  output_path = "${path.module}/../dist/layer.zip"
}

resource "aws_lambda_layer_version" "dependencies" {
  layer_name = "pydantic"

  filename                 = data.archive_file.layer.output_path
  source_code_hash         = data.archive_file.layer.output_base64sha256
  compatible_architectures = ["x86_64"]

  compatible_runtimes = ["python3.14"]
}
