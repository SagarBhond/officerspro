resource "aws_acm_certificate" "keycloak" {
  domain_name       = var.keycloak_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "keycloak_certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.keycloak.domain_validation_options :
    option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  }

  zone_id         = data.aws_route53_zone.public.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "keycloak" {
  certificate_arn         = aws_acm_certificate.keycloak.arn
  validation_record_fqdns = [for record in aws_route53_record.keycloak_certificate_validation : record.fqdn]
}

resource "aws_lb_listener_certificate" "keycloak" {
  count           = var.certificate_arn == "" ? 0 : 1
  listener_arn    = aws_lb_listener.https[0].arn
  certificate_arn = aws_acm_certificate_validation.keycloak.certificate_arn
}

resource "aws_route53_record" "keycloak" {
  zone_id = data.aws_route53_zone.public.zone_id
  name    = var.keycloak_domain
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
