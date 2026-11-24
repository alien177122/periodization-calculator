# Проверка split deep link (2026-10-23)

URL: https://ensemble-opens-organised-greetings.trycloudflare.com/?tab=split&split=e780520c-dc12-412b-8e64-fdb0ca387835

- Туннель: cloudflared → `127.0.0.1:5173` (Vite dev)
- Health: 200
- Deep link: tab/split в URL, `data-active-tab=split`
- Без сессии: экран входа, split UI скрыт
- Split id в локальной gym.db на ПК нет; после логина — из данных пользователя
