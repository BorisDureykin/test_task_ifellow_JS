/**
 * Модуль для создания объекта, с помощью которого выполняются операции с базой данных
 */
import sqlite3 from 'sqlite3'

// Имя файла базы данных, можно указать путь к файлу (если он должен быть расположен не в корне проекта)
const dbsource = 'db.sqlite'

// Создание объекта для работы с базой данных
// Функция обратного вызова запускается при создании объекта
// с ее помощью формируется структура базы данных
const db = new sqlite3.Database(dbsource, err => {

    // обработка ошибки подключения к базе данных
    if(err) {
        console.error(err.message)
        throw err
    }

    // создание таблицы task (задачи)
    db.run(`CREATE TABLE IF NOT EXISTS task (
        id integer primary key autoincrement,
        name text unique,
        description text
    )`, err => {
        if(!err) {
            console.log('Table task created')
        }
    })

    // создание таблицы solution (решения)
    db.run(`CREATE TABLE IF NOT EXISTS solution (
        id integer primary key autoincrement,
        name text,
        language text,
        description text

    )`, err => {
        if(!err) {
            console.log('Table solution created')
        }
    })

    // создание таблицы task_solution (связь задачи и решения)
    // одной задаче может соответствовать несколько решений
    db.run(`CREATE TABLE IF NOT EXISTS task_solution (
        id integer primary key autoincrement,
        task_id integer REFERENCES task(id),
        solution_id integer REFERENCES solution(id),
        UNIQUE(task_id, solution_id)
    )`, err => {
        if(!err) {
            console.log('Table task_solution created')
        }
    })
})

export default db