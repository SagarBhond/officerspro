#!/usr/bin/env bash
set -euo pipefail

: "${IMAGE_URI:?Set IMAGE_URI to an immutable frontend ECR image tag}"
: "${AWS_REGION:?Set AWS_REGION}"

if [[ ! "$IMAGE_URI" =~ ^[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com/officerpro/frontend:[[:xdigit:]]{40}$ ]]; then
  printf 'IMAGE_URI must be the immutable officerpro/frontend image tagged with a commit SHA.\n' >&2
  exit 2
fi

command -v docker >/dev/null || { printf 'Docker is required on the frontend instance.\n' >&2; exit 1; }
command -v aws >/dev/null || { printf 'AWS CLI is required on the frontend instance.\n' >&2; exit 1; }
command -v curl >/dev/null || { printf 'curl is required on the frontend instance.\n' >&2; exit 1; }

registry="${IMAGE_URI%%/*}"
aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$registry"
docker pull "$IMAGE_URI"

candidate=officerspro-frontend-candidate
container=officerspro-frontend
docker rm -f "$candidate" >/dev/null 2>&1 || true
docker run -d \
  --name "$candidate" \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/cache/nginx \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --publish 127.0.0.1:18080:8080 \
  "$IMAGE_URI" >/dev/null

healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:18080/ >/dev/null 2>&1; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  docker logs "$candidate" >&2
  docker rm -f "$candidate" >/dev/null
  printf 'New frontend image failed its local health check; the active container was left unchanged.\n' >&2
  exit 1
fi

old_image=""
if docker inspect "$container" >/dev/null 2>&1; then
  old_image="$(docker inspect --format '{{.Config.Image}}' "$container")"
  docker rm -f "$container" >/dev/null
fi

restore_previous_image() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  if [[ -n "$old_image" ]]; then
    docker run -d \
      --name "$container" \
      --restart unless-stopped \
      --read-only \
      --tmpfs /tmp \
      --tmpfs /var/cache/nginx \
      --cap-drop ALL \
      --security-opt no-new-privileges:true \
      --publish 80:8080 \
      "$old_image" >/dev/null
    printf 'Restored previous frontend image %s.\n' "$old_image" >&2
  fi
}

if ! docker run -d \
  --name "$container" \
  --restart unless-stopped \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/cache/nginx \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --publish 80:8080 \
  "$IMAGE_URI" >/dev/null; then
  restore_previous_image
  exit 1
fi
docker rm -f "$candidate" >/dev/null

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1/ >/dev/null 2>&1; then
    printf 'Frontend is serving image %s on port 80.\n' "$IMAGE_URI"
    exit 0
  fi
  sleep 2
done

docker logs "$container" >&2
restore_previous_image
if [[ -z "$old_image" ]]; then
  printf 'New frontend failed its port 80 health check; no previous image was available to restore.\n' >&2
fi
exit 1
