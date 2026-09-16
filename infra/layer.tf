resource "terraform_data" "build_layer" {
  triggers_replace = [
    filemd5("${path.module}/../api/requirements.txt"),
    "v4"
  ]

  provisioner "local-exec" {
    command = <<-EOT
      rm -rf ${path.module}/../dist/layer_build
      mkdir -p ${path.module}/../dist/layer_build/python

      pip3 install \
        -r ${path.module}/../api/requirements.txt \
        -t ${path.module}/../dist/layer_build/python \
        --platform manylinux2014_x86_64 \
        --only-binary=:all:
    EOT
  }
}

data "archive_file" "layer" {
  depends_on = [terraform_data.build_layer]

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