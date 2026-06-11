---
name: deploy-docker-production
description: Build and run a local (production) Next.js Docker image safely. Use this skill when the user wants to build a Docker image for a Next.js app and run it with an env file, especially when the image version tag must be checked locally before building.
---

# Docker Next.js Local Deploy Skill

## Purpose

Use this skill to build and run a Next.js application with Docker using a versioned image tag.

Default target command pattern:

```bash
docker build -t nextjs-wha-app:1.0.0 .

docker run --restart=always -d \
  --name my-nextjs-wha-app \
  --env-file .env.production \
  -p 4000:3000 \
  nextjs-wha-app:1.0.0
```

The agent must not blindly build over an existing version tag. Always check whether the requested image version already exists on the local machine before running `docker build`.

## Inputs

Ask for or infer these values:

```text
IMAGE_NAME=nextjs-wha-app
IMAGE_VERSION=1.0.0
IMAGE_TAG=nextjs-wha-app:1.0.0
CONTAINER_NAME=my-nextjs-wha-app
ENV_FILE=.env.production
HOST_PORT=4000
CONTAINER_PORT=3000
```

If the user already provides these values, use the provided values. Do not rename the image, container, port, or env file unless the user asks.

## Safety Rules

Before running any command:

1. Confirm the current working directory is the project root.
2. Confirm `Dockerfile` exists.
3. Confirm the env file exists.
4. Confirm Docker is installed and running.
5. Check whether the requested image tag already exists locally.
6. Check whether the requested container name already exists.
7. Never print secrets from `.env.production`.
8. Do not run `docker system prune`, `docker image prune`, `docker volume prune`, or destructive cleanup commands unless the user explicitly asks.
9. Do not stop, remove, or replace an existing container without explicit confirmation from the user.
10. Do not use the `latest` tag unless the user explicitly asks.

## Preflight Checks

Run these checks first:

```bash
pwd
ls -la
test -f Dockerfile && echo "OK: Dockerfile found" || echo "ERROR: Dockerfile not found"
test -f .env.production && echo "OK: .env.production found" || echo "ERROR: .env.production not found"
docker --version
docker info >/dev/null && echo "OK: Docker daemon is running" || echo "ERROR: Docker daemon is not running"
```

If `Dockerfile` is missing, stop and report the issue.

If `.env.production` is missing, stop and report the issue. Do not create a placeholder env file unless the user asks.

If Docker daemon is not running, stop and tell the user to start Docker Desktop or Docker Engine.

## Version Tag Check

Before building, check whether the requested image tag already exists:

```bash
docker image inspect nextjs-wha-app:1.0.0 >/dev/null 2>&1 \
  && echo "EXISTS: nextjs-wha-app:1.0.0" \
  || echo "AVAILABLE: nextjs-wha-app:1.0.0"
```

Also list existing local versions for this image:

```bash
docker images nextjs-wha-app --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}"
```

If `nextjs-wha-app:1.0.0` already exists:

1. Do not run `docker build`.
2. Report that the version already exists locally.
3. Suggest the next patch version, for example `1.0.1`, if appropriate.
4. Ask the user whether to use a new version or explicitly rebuild the same tag.

Only rebuild an existing tag if the user clearly confirms.

## Container Name Check

Before running the container, check whether the container name already exists:

```bash
docker ps -a --filter "name=^/my-nextjs-wha-app$" \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

If a container named `my-nextjs-wha-app` already exists:

1. Do not run another container with the same name.
2. Report the existing container status.
3. Ask the user whether to stop/remove it or use a different container name.
4. Do not remove it automatically.

## Build Command

If the version tag does not exist, run:

```bash
docker build -t nextjs-wha-app:1.0.0 .
```

After build, verify the image exists:

```bash
docker image inspect nextjs-wha-app:1.0.0 >/dev/null \
  && echo "OK: image built successfully" \
  || echo "ERROR: image not found after build"
```

## Run Command

If the image exists and the container name is available, run:

```bash
docker run --restart=always -d \
  --name my-nextjs-wha-app \
  --env-file .env.production \
  -p 4000:3000 \
  nextjs-wha-app:1.0.0
```

## Post-run Validation

After running the container, validate with:

```bash
docker ps --filter "name=^/my-nextjs-wha-app$" \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

docker logs --tail=80 my-nextjs-wha-app

curl -I http://localhost:4000
```

Expected result:

1. Container status should be `Up`.
2. Port mapping should include `0.0.0.0:4000->3000/tcp` or equivalent.
3. Logs should not show fatal errors.
4. `curl -I http://localhost:4000` should return an HTTP response such as `200`, `301`, `302`, `307`, or `308`.

If `curl` fails, inspect logs and report the likely cause.

## Common Failure Handling

### Image tag already exists

Do not overwrite silently.

Report:

```text
Image tag nextjs-wha-app:1.0.0 already exists locally.
Recommended action: use a new patch version such as nextjs-wha-app:1.0.1, or explicitly confirm rebuilding the same tag.
```

### Container name already exists

Do not remove automatically.

Report:

```text
Container my-nextjs-wha-app already exists.
Please confirm whether to stop/remove it, or provide a different container name.
```

### Port already in use

Check:

```bash
lsof -i :4000
```

Report the process using the port and ask whether the user wants to change `HOST_PORT`.

### Env file missing

Report:

```text
.env.production was not found. I cannot run the container with --env-file until this file exists.
```

Do not print or infer secrets.

### Docker daemon not running

Report:

```text
Docker is installed but the daemon is not running. Start Docker Desktop or Docker Engine, then run the preflight checks again.
```

## Final Response Format

When finished, report:

```text
Result:
- Image: nextjs-wha-app:1.0.0
- Container: my-nextjs-wha-app
- Env file: .env.production
- Port: http://localhost:4000
- Restart policy: always
- Validation: passed/failed

Commands used:
<list important commands>

Notes:
<any warnings, existing image/container conflicts, or follow-up action>
```

If the workflow stops because of an existing version tag, missing env file, existing container, Docker error, or port conflict, clearly state the blocking issue and the safest next command.
