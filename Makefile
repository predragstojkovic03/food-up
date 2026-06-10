-include .env
export

COMPOSE = docker compose -f docker-compose.prod.yaml

.PHONY: deploy up down restart logs shell ps migrate-create migrate-up migrate-down

deploy:
	git pull
	$(COMPOSE) run --rm migrate
	$(COMPOSE) up -d --build --no-deps app

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart app

logs:
	$(COMPOSE) logs -f $(s)

shell:
	$(COMPOSE) exec $(s) sh

ps:
	$(COMPOSE) ps

migrate-create:
	docker run --rm -v $(PWD)/apps/server/migrations:/migrations \
		migrate/migrate:latest \
		create -ext sql -dir /migrations -seq $(name)

migrate-up:
	$(COMPOSE) run --rm migrate

migrate-down:
	$(COMPOSE) run --rm migrate \
		-path=/migrations \
		-database="postgres://$${POSTGRES_USER}:$${POSTGRES_PASSWORD}@postgres:$${POSTGRES_PORT}/$${POSTGRES_DB}?sslmode=disable" \
		down 1
