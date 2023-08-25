import express from 'express'
import { engine } from 'express-handlebars'
import http from 'http'
import bodyParser from 'body-parser'
import axios from 'axios';
import { dirname } from "path";
import { fileURLToPath } from "url";

// создание экземпляра приложения
const app = express();
const _dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;
app.use(express.static(`${_dirname}/assets`, {
    extensions:['css','ico','png','js']
}));
// промежуточное ПО (middleware) для обработки тела запроса и ответа
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

// настройка шаблонизатора Handlebars
app.engine('hbs', engine({
    extname: '.hbs', // расширение файлов шаблонов
    defaultLayout: 'main' // название макета по умолчанию
}));

// назначение Handlebars шаблонизатором по умолчанию
app.set('view engine', 'hbs');


// Функция для выполнения http-запросов !!!!
function performHttpRequest(path, method, headers, body) {
     const httpOptions = {
            hostname: 'task_processing', //localhost   task_processing
            port: 3002,
            path: path,
            method: method,
            headers: headers
                    };
    return new Promise((resolve, reject) => {
        const request = http.request(httpOptions, response => {
            let responseData = '';
            response.on('data', data => {
                responseData += data;
            });
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        });
        request.on('error', error => {
            reject(error);
        });
        if (body) {
            request.write(body);
        }
        request.end();
    });
};

// Функция для получения списка задач !!!!
async function getTaskList() {
    const path = '/api/v1/task';
    const method = 'GET';
    const taskList = await performHttpRequest(path, method);
    return taskList.data;
};

// Функция для получения задачи по ID !!!!
async function getTask(id) {
    let path = '/api/v1/task/';
    path = path+id;
    const method = 'GET';
    const task = await performHttpRequest(path, method);
    return task.data;
};

// Функция для получения решений задачи по ID !!!!
async function getSolutionsTask(id) {
    let path = '/api/v1/task_solution/';
    path = path+id;
    const method = 'GET';
    const solutions = await performHttpRequest(path, method);
    return solutions.data;
};



// обработка корневого маршрута (главная страница) !!!!
app.get('/', async (req, res) => {
    try { //создаем константы и переменные
        const taskList = await getTaskList();
        res.render('home', { // рендеринг отрисовка страницы
            title: 'Tasks',
            taskList: taskList,
        });
    } catch (error) { // Обработка ошибок
        res.render('home', {
            title: 'Tasks',
           taskList: [],
        });
    };
});

// обработка маршрута отображения страницы задачи !!!!
app.get('/task/:task', async (req, res) => {
     const id = `${req.params.task}`;
     const viewsTask = `viewsTask_${req.params.task}`
     const taskList = await getTaskList();
     const task = await getTask(id)

    try {
        res.render('viewsTask', {
            title: `${viewsTask}`,
            task: task,
            taskList: taskList
        });
    } catch (error) {
        res.render('page404', {
            title: 'Page Not Found',
        });
    };
});

// обработка маршрута отображения страницы РЕДАКТИРОВАНИЯ задачи !!!!
app.get('/editTask/:task', async (req, res) => {
     const id = `${req.params.task}`;
     const viewsTask = `viewsTask_${req.params.task}`
     const taskList = await getTaskList();
     const task = await getTask(id)
    try {
        res.render('editTask', {
            title: `${viewsTask}`,
            task: task,
            taskList: taskList
        });
    } catch (error) {
        res.render('page404', {
            title: 'Page Not Found',
        });
    };
});

// обработка маршрута отображения страницы РЕШЕНИЙ задачи !!!!
app.get('/solution/:task', async (req, res) => {
     const id = `${req.params.task}`;
     const viewsTask = `viewsTask_${req.params.task}`
     const taskList = await getTaskList();
     const task = await getTask(id)
     const solutions = await getSolutionsTask(id)
    try {
        res.render('solutionTask', {
            title: `${viewsTask}`,
            task: task,
            taskList: taskList,
            solutions: solutions,
        });
    } catch (error) {
        res.render('page404', {
            title: 'Page Not Found',
            task: [],
            taskList: [],
            solution:[],
        });
    };
});

// обработка маршрута отображения страницы создания задачи !!!!
app.get('/addtask', async (req, res) => {
    try {
        const taskList = await getTaskList();
        res.render('addTask', {
            title: 'addTask',
            taskList: taskList

        });
    } catch (error) {
        res.render('page404', {
            title: 'Page Not Found',
            taskList: []
        });
    };
});

// Обработка маршрута на app.js для добавления, удаления и изменения задачи !!!!
app.post('/addTask/:id', async (req, res) => {
    try {
        const httpMethod = req.body._method;
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify(req.body);
        let path = `/api/v1/task/${req.params.id}`;

        if (httpMethod === 'POST') {
            path = '/api/v1/task';
            await performHttpRequest(path, httpMethod, headers, body);
            res.send(`<script>alert("Task add"); window.location.href = "/addTask"; </script>`);
        } else if (httpMethod === 'PUT') {
            console.log(1)
            await performHttpRequest(path, httpMethod, headers, body);
            res.send(`<script>alert("Task update"); window.location.href = "/task/${req.params.id}"; </script>`);
        } else if (httpMethod === 'DELETE'){
            await performHttpRequest(path, httpMethod);
            res.send(`<script>alert("Task Delete"); window.location.href = "/"; </script>`);
        }
    }  catch (error) {
        // В случае возникновения ошибки при выполнении запроса
        if (error.response) {
            // Если ответ с ошибкой пришел от сервера API
            res.status(error.response.status).json(error.response.data);
        } else {
            // Если произошла другая внутренняя ошибка
            res.status(500).json({
                error: 'Internal server error'
            });
        };
    };
});

// Обработка маршрута на server.js для добавления, удаления и изменения решения !!!!
app.post('/addSolution/:id', async (req, res) => {
    try {
        let path = `/api/v1/solution/${req.params.id}`;
        const httpMethod = req.body._method;
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify(req.body);
        const id = req.params.id

        if (httpMethod === 'POST') {
            path = '/api/v1/solution';
            await performHttpRequest(path, httpMethod, headers, body);
            res.send(`<script>alert("Solution add"); window.location.href = "/solution/${req.body.task_id}"; </script>`);
        } if (httpMethod === 'PUT') {
            await performHttpRequest(path, httpMethod, headers, body);
            res.send(`<script>alert("Solution update"); window.location.href = "/solution/${req.body.taskID}"; </script>`);
        } else if (httpMethod === 'DELETE'){
            await performHttpRequest(path, httpMethod);
            res.send(`<script>alert("Solution Delete"); window.location.href = "/solution/${req.body.taskID}"; </script>`);
        }
    } catch (error) {
        res.render('page404', {
            title: 'Page Not Found',
        });
    };
});


// обработка марщрута для отображения страницы ошибки (страница не найдена)
app.get('**', async (req, res) => {
    const taskList = await getTaskList();
    res.status(404).render('page404', {
            title: 'Error',
            taskList: taskList,

        })
});


// запуск сервера (прослушивание порта 3000)
app.listen(port, () => {
    console.log('App started')
});
