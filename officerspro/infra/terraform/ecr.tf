resource "aws_ecr_repository" "backend" {
  name                 = "officerspro/backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "officerpro/frontend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "keycloak" {
  name                 = "officerspro/keycloak"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "complaint_fir" {
  name                 = "officerspro/complaint-fir"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "microservices" {
  for_each             = local.microservices
  name                 = "officerspro/${each.key}"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "images" {
  for_each = merge({
    backend       = aws_ecr_repository.backend.name
    frontend      = aws_ecr_repository.frontend.name
    keycloak      = aws_ecr_repository.keycloak.name
    complaint_fir = aws_ecr_repository.complaint_fir.name
  }, { for key, repository in aws_ecr_repository.microservices : key => repository.name })
  repository = each.value
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Retain the newest 20 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 20
      }
      action = { type = "expire" }
    }]
  })
}
