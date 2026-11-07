# Локальный контур: только Mac + PC

Обновлено: 2026-10-24. Решение Steve: проект и документы на диске, не в облачном Context.

## Источник правды

| Что | Mac | PC |
|-----|-----|-----|
| Код | `~/Desktop/Calculator/Web_Calculator` (git) | `Desktop\Сортировка\Разработка\React_Project` или синхрон через git |
| Документы агента | `Web_Calculator/docs/project/` | зеркало `Desktop\Calculator\docs\project\` при необходимости |
| iOS | `~/Desktop/Calculator/ios` | — |

Синхрон Mac ↔ PC: **git** (`periodization-calculator`), не дублирующие правки в двух копиях без pull.

## Что нельзя «выключить» полностью

- Чат **Cursor Project** и координатор по умолчанию в облаке Cursor — это инфраструктура продукта.
- Вкладка **Context** может дублировать store на серверах Cursor.

## Что делаем practically

1. Все deliverable-файлы пишем в **`docs/project/`** в репо и коммитим (или держим untracked локально, но открываем из Finder).
2. Агентам: работать только через **self-hosted worker** (MacBook / DESKTOP-E907GUP), без cloud VM.
3. Не открывать планы по ссылкам `file:///cursor/stores/...` из чата — только локальные пути.
4. `preferences.md` в репо: `docs/project/PREFERENCES-SNAPSHOT.md` при обновлении.

## Workers

- Mac: `~/Desktop/Calculator/Web_Calculator`
- PC: Windows-копия калькулятора (не пустой `Desktop\React_Project`)

## Диалог «только 2 устройства»

Задачи формулировать привязкой к Mac или PC; артефакты — пути на диске; push на GitHub — по желанию, не обязателен для локальной работы.
