.PHONY: up down build logs ps front up-production down-production

ENV_FILE ?= .env.local

up:
	docker compose --env-file $(ENV_FILE) up -d

down:
	docker compose --env-file $(ENV_FILE) down

build:
	docker compose --env-file $(ENV_FILE) build

logs:
	docker compose --env-file $(ENV_FILE) logs -f

ps:
	docker compose --env-file $(ENV_FILE) ps

front:
	bash .devcontainer/frontend.sh

up-production:
	docker compose --env-file $(ENV_FILE) -f docker-compose.prod.yml up -d

down-production:
	docker compose --env-file $(ENV_FILE) -f docker-compose.prod.yml down
