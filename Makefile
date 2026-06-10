COMPOSE = docker compose -f docker-compose.prod.yaml

.PHONY: deploy up down restart logs shell ps

deploy:
	git pull
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
