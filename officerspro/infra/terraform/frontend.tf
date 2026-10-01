resource "aws_iam_role" "frontend_instance" {
  name = "officerspro-frontend-instance"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "frontend_instance_ssm" {
  role       = aws_iam_role.frontend_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "frontend_instance_ecr" {
  name = "officerspro-frontend-ecr-pull"
  role = aws_iam_role.frontend_instance.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = [aws_ecr_repository.frontend.arn]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "frontend" {
  name = "officerspro-frontend"
  role = aws_iam_role.frontend_instance.name
}

resource "aws_instance" "frontend" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.frontend_instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.frontend_instance.id]
  iam_instance_profile        = aws_iam_instance_profile.frontend.name
  associate_public_ip_address = true
  user_data = templatefile("${path.module}/../ec2/frontend-user-data.sh.tftpl", {
    aws_region = var.aws_region
  })
  user_data_replace_on_change = true

  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 20
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }
}
