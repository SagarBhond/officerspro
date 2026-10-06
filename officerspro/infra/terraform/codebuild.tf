resource "aws_cloudwatch_log_group" "codebuild_ecr" {
  name              = "/aws/codebuild/officerspro-ecr-image-builder"
  retention_in_days = 30
}

resource "aws_codebuild_project" "ecr_builder" {
  name                   = "officerspro-ecr-image-builder"
  description            = "Build OfficersPro backend images in AWS and push them to ECR."
  service_role           = aws_iam_role.codebuild_ecr.arn
  build_timeout          = 120
  queued_timeout         = 60
  concurrent_build_limit = 1

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true

    environment_variable {
      name  = "AWS_REGION"
      value = var.aws_region
    }
  }

  source {
    type      = "S3"
    location  = "${var.s3_bucket_name}/officerspro/codebuild/source.tar.gz"
    buildspec = <<-YAML
      version: 0.2
      phases:
        pre_build:
          commands:
            - docker version
            - |
              archive="$(find . -maxdepth 3 -type f -name 'source-*.tar.gz' -print -quit)"
              if [ -n "$archive" ]; then
                tar -xzf "$archive" -C .
              fi
              if [ ! -f officerspro/scripts/publish-all-services.sh ]; then
                echo "Could not find officerspro/scripts/publish-all-services.sh after extracting the source archive." >&2
                find . -maxdepth 5 -type f -name publish-all-services.sh -print >&2
                exit 1
              fi
        build:
          commands:
            - bash officerspro/scripts/publish-all-services.sh
      YAML
  }

  logs_config {
    cloudwatch_logs {
      status      = "ENABLED"
      group_name  = aws_cloudwatch_log_group.codebuild_ecr.name
      stream_name = "build"
    }
  }

  depends_on = [aws_iam_role_policy.codebuild_ecr]
}
