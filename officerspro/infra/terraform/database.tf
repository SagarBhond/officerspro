resource "aws_db_subnet_group" "main" {
  name       = "officerspro-database"
  subnet_ids = aws_subnet.database[*].id
}

resource "aws_db_instance" "main" {
  identifier                  = "officerspro"
  engine                      = "mysql"
  engine_version              = "8.0"
  instance_class              = var.database_instance_class
  allocated_storage           = 20
  max_allocated_storage       = 100
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = "officerspro"
  username                    = "officerspro_admin"
  manage_master_user_password = true
  db_subnet_group_name        = aws_db_subnet_group.main.name
  vpc_security_group_ids      = [aws_security_group.database.id]
  publicly_accessible         = false
  multi_az                    = var.database_multi_az
  backup_retention_period     = 7
  deletion_protection         = var.database_deletion_protection
  skip_final_snapshot         = false
  final_snapshot_identifier   = "officerspro-final"
}

resource "aws_iam_role" "database_bootstrap" {
  name = "officerspro-database-bootstrap"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_instance_profile" "database_bootstrap" {
  name = "officerspro-database-bootstrap"
  role = aws_iam_role.database_bootstrap.name
}

resource "aws_instance" "database_bootstrap" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.database_bootstrap_instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.database_bootstrap.id]
  iam_instance_profile        = aws_iam_instance_profile.database_bootstrap.name
  associate_public_ip_address = true
  user_data = templatefile("${path.module}/../ec2/database-bootstrap-user-data.sh.tftpl", {
    aws_region               = var.aws_region
    rds_host                 = aws_db_instance.main.address
    rds_admin_secret_arn     = aws_db_instance.main.master_user_secret[0].secret_arn
    database_init_script_b64 = base64encode(file("${path.module}/../database/init-rds-databases.sh"))
  })
  user_data_replace_on_change = true

  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 12
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  depends_on = [
    aws_iam_role_policy_attachment.database_bootstrap_ssm,
    aws_iam_role_policy.database_bootstrap_secrets
  ]
}

resource "aws_secretsmanager_secret" "database_users" {
  for_each                = local.database_services
  name                    = "/officerspro/database/${each.key}"
  description             = "MySQL credentials for the ${each.key} OfficersPro service"
  recovery_window_in_days = 30
}

resource "aws_iam_role_policy_attachment" "database_bootstrap_ssm" {
  role       = aws_iam_role.database_bootstrap.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "database_bootstrap_secrets" {
  name = "officerspro-bootstrap-database-secrets"
  role = aws_iam_role.database_bootstrap.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [aws_db_instance.main.master_user_secret[0].secret_arn]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:CreateSecret",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue"
        ]
        Resource = ["arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/officerspro/database/*"]
      }
    ]
  })
}
