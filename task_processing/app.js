import express from 'express'
import db from './db/db.js'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

// обработка корневого маршрута для тестирования запуска приложения !!!!
app.get('/', (req, res) => {
    res.json({
        message: 'Ok'
    })
})


// обработка маршрута для получения списка задач !!!!
app.get('/api/v1/task', (req, res) => {
    // подготовка SQL-запроса
    const sql = `SELECT * FROM task ORDER BY name`
    // выполнение запроса для получения всех строк результата
    db.all(sql, [], (err, rows) => {

        // обработка ошибки в процессе выполнения запроса
        if (err) {
            res.status(400).json({
                error: err.message
            })
            return
        }
        // отправка ответа с результатом выполнения запроса
        res.json({

            data: rows
        })
    })
})

// обработка маршрута для получения задачи по ID !!!!
app.get('/api/v1/task/:id', (req, res) => {
    // подготовка SQL-запроса
     const sql = `SELECT * FROM task WHERE id = ?`
     const params = [req.params.id]

    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(404).json({
                error: err.message
            })
            return
        }
       res.json({
            data: row
        })
    })
})

// обработка маршрута для создания новой задачи// данные новой задачи передаются в теле запроса!!!!
app.post('/api/v1/task', (req, res) => {
    const errors = []// обработка ошибок
    if (!req.body.name) {
        errors.push('No name task')
    }
    if (!req.body.description) {
        errors.push('No description task')
    }
    if (errors.length) {
        res.status(400).json({
            error: errors.join(', ')
        })
        return
    }
    const sql = `INSERT INTO task (name, description) VALUES (?, ?)`
    const params = [req.body.name, req.body.description]

     // Проверяем уникальное ограничение на поле name перед добавлением задачи
    const uniqueCheckSql = `SELECT id FROM task WHERE name = ? LIMIT 1`
    db.get(uniqueCheckSql, [req.body.name], (err, row) => {
        if (err) {
            res.status(500).json({
                error: 'Internal server error'
            })
            return
        }
        if (row) {
            // Если Задача с таким именем уже существует, возвращаем ошибку
            res.status(400).json({
                error: 'Task with the same name already exists'
            })
            return
        }
    db.run(sql, params, function (err) { // выполнение запроса без получения результата
        if (err) {
            res.status(400).json({
                error: err.message
            })
        }
        res.json({
            id: this.lastID,
            name: req.body.name
            })
        })
    })
})

// обработка маршрута для изменения задачи !!!!
app.put('/api/v1/task/:id', (req, res) => {
     const errors = []
    if (!req.body.name) {
        errors.push('No name task')
    }
     if (!req.body.description) {
        errors.push('No description task')
    }
    if (errors.length) {
        res.status(400).json({
            error: errors.join(', ')
        })
        return
    }
    const sql = `UPDATE task SET name = ?, description = ? WHERE id = ?`
    const params = [req.body.name, req.body.description, req.params.id]
    // Проверяем уникальное ограничение на поле name перед изменением Задачи
    const uniqueCheckSql = `SELECT id FROM task WHERE name = ? LIMIT 1`
    db.get(uniqueCheckSql, [req.body.name], (err, row) => {
        if (err) {
            res.status(500).json({
                error: 'Internal server error'
            })
            return
        }
        if (row) {
            const sql = `UPDATE task SET  description = ? WHERE id = ?`
            const params = [ req.body.description, req.params.id]
        }

    db.run(sql, params, (err) => {
        if (err) {
            res.status(400).json({
                error: err.message
            })
        }
        res.json({
            id: req.params.id,
            name: req.body.name
            })
        })
    })
})

// обработка маршрута для удаления Задачи по идентификатору !!!!
app.delete('/api/v1/task/:id', (req, res) => {
    const sql = `DELETE FROM task WHERE id = ?`
    const params = [req.params.id]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                error: err.message
            })
        }
        res.json({
            id: req.params.id
        })
    })
})

// обработка маршрута для добавления решений по задаче !!!!
app.post('/api/v1/solution', (req, res) => {
    const errors = []
    if (!req.body.name) {
        errors.push('No name solution')
    }
    if (!req.body.description) {
        errors.push('No description solution')
    }
    if (!req.body.language) {
        errors.push('No language solution')
    }
    if (errors.length) {
        res.status(400).json({
            error: errors.join(', ')
        })
        return
    }
    const sql = `INSERT INTO solution (name, language, description) VALUES (?, ?, ?) `
    const params = [req.body.name, req.body.language, req.body.description]

         db.run(sql, params, function (err, result) {
            if (err) {
                res.status(400).json({
                    error: err.message
                })
                return
            }

            // кроме создания решения необходимо еще добавить связь задача_решение, если она указана
             if (req.body.task_id) {
                const taskSql = `INSERT INTO task_solution (solution_id, task_id) VALUES (?, ?)`;

                db.run(taskSql, [this.lastID, req.body.task_id], (err, result) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            }
            res.json({
                id: this.lastID,
                name: req.body.name
            });
        });
    });


// обработка маршрута для получения решений выполненных по задаче !!!!
app.get('/api/v1/task_solution/:id', (req, res) => {
     const sql = `SELECT * FROM task_solution
     JOIN solution ON solution.id = task_solution.solution_id
     WHERE task_solution.task_id=?`
     const params = [req.params.id]
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(404).json({
                error: err.message
            })
            return
        }
       res.json({
            data: rows
        })
    })
})

// обработка маршрута для изменения решения !!!!
app.put('/api/v1/solution/:id', (req, res) => {
     const errors = []

     if (!req.body.description) {
        errors.push('No description task')
    }
    if (errors.length) {
        res.status(400).json({
            error: errors.join(', ')
        })
        return
    }
    const sql = `UPDATE solution SET description = ? WHERE id = ?`
    const params = [req.body.description, req.params.id]

    db.run(sql, params, (err) => {

        if (err) {
            res.status(400).json({
                error: err.message
            })
        }
        res.json({
            id: req.params.id,
            name: req.body.name,
            language: req.body.language,
            description: req.body.description,
            })
        })
    })

// обработка маршрута для удаления Задачи по идентификатору !!!!
app.delete('/api/v1/solution/:id', (req, res) => {
    const sql = `DELETE FROM solution WHERE id = ?`
    const params = [req.params.id]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                error: err.message
            })
        }
        res.json({
            id: req.params.id
        })
    })
})

// middleware
app.use((req, res) => {
    res.status(404)
})

app.listen(3002, () => {
    console.log('Backend started')
})
