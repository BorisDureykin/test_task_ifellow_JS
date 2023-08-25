# Проект "route_processing"

Проект "route_processing" - это Express.js приложение для обработки маршрутов и предоставления веб-страниц для работы с задачами и решениями.

## Запуск проекта

1. Убедитесь, что у вас установлен Node.js.
2. Клонируйте репозиторий.
3. Перейдите в директорию проекта `route_processing`.
4. Установите зависимости: `npm install`.
5. Запустите приложение: `npm start`.
6. Откройте браузер и перейдите по адресу http://localhost:3000.

## Маршруты

- `/` - главная страница с списком задач.
- `/task/:task` - страница с информацией о задаче.
- `/editTask/:task` - страница редактирования задачи.
- `/solution/:task` - страница с решениями задачи.
- `/addtask` - страница добавления новой задачи.


# Проект "task_processing"

Проект "task_processing" - это Express.js приложение для работы с задачами и решениями через REST API.

## Запуск проекта

1. Убедитесь, что у вас установлен Node.js.
2. Клонируйте репозиторий.
3. Перейдите в директорию проекта `task_processing`.
4. Установите зависимости: `npm install`.
5. Запустите приложение: `npm start`.
6. API будет доступно по адресу http://localhost:3002.

## API Маршруты

- `GET /api/v1/task` - получение списка задач.
- `GET /api/v1/task/:id` - получение задачи по ID.
- `POST /api/v1/task` - создание новой задачи.
- `PUT /api/v1/task/:id` - изменение задачи по ID.
- `DELETE /api/v1/task/:id` - удаление задачи по ID.
- `POST /api/v1/solution` - создание решения.
- `GET /api/v1/task_solution/:id` - получение решений для задачи.
- `PUT /api/v1/solution/:id` - изменение решения по ID.
- `DELETE /api/v1/solution/:id` - удаление решения по ID.

## API Тестирование

- Использовать Postman
- Осуществить импорт из файла test_task_ifellow_JS.postman_collection
- Проверить работу API и сохранение решений в db 