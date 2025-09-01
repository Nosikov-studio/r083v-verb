const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Подключение к базе данных
const db = new sqlite3.Database('./slovar.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных SQLite успешно установлено.');
  }
});

// Настройка Express
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Главный маршрут - отображение данных из таблицы tab1
app.get('/', (req, res) => {
  const query = 'SELECT * FROM tab1';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err.message);
      res.status(500).send('Ошибка при получении данных из базы данных');
      return;
    }
    
    // Получаем информацию о структуре таблицы
    db.all("PRAGMA table_info(tab1)", [], (err, columns) => {
      if (err) {
        console.error('Ошибка при получении информации о таблице:', err.message);
        res.status(500).send('Ошибка при получении информации о таблице');
        return;
      }
      
      res.render('index', { 
        data: rows, 
        columns: columns.map(col => col.name),
        totalRows: rows.length
      });
    });
  });
});
///////////////////////////////////////////////////////////////////////
//  маршрут тренажера
app.get('/u', (req, res) => {
  const query = 'SELECT * FROM tab1';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err.message);
      res.status(500).send('Ошибка при получении данных из базы данных');
      return;
    }
    
    // Получаем информацию о структуре таблицы
    db.all("PRAGMA table_info(tab1)", [], (err, columns) => {
      if (err) {
        console.error('Ошибка при получении информации о таблице:', err.message);
        res.status(500).send('Ошибка при получении информации о таблице');
        return;
      }
      const arr = [];
        for (let i = 0; i < rows.length; i++) {
        arr.push(i);
        }
      res.render('u', { 
        data: rows, 
        columns: columns.map(col => col.name),
        totalRows: rows.length,
        arr: arr
      });
    });
  });
});
/////////////////////////////////////////////////////////////////////////
// API маршрут для получения данных в формате JSON
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM tab1';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

//********************************************************* */
// Роут для получения поля text из таблицы tab2 по значению verb из tab1
// app.get('/text/:verb', (req, res) => {
//   const verb = req.params.verb;

//   const sql = `
//     SELECT tab2.text
//     FROM tab1
//     JOIN tab2 ON tab1.verb = tab2.word
//     WHERE tab1.verb = ?
//   `;

//   db.all(sql, [verb], (err, rows) => {
//     if (err) {
//       console.error('Ошибка выполнения запроса:', err.message);
//       res.status(500).json({ error: 'Ошибка сервера' });
//       return;
//     }
//     res.json(rows);
//   });
// });
app.get('/text/:verb', (req, res) => {
  const verb = req.params.verb;

  const sql = `
    SELECT tab2.text, tab2.pic
    FROM tab1
    JOIN tab2 ON tab1.verb = tab2.word
    WHERE tab1.verb = ?
  `;

  db.all(sql, [verb], (err, rows) => {
    if (err) {
      console.error('Ошибка выполнения запроса:', err.message);
      res.status(500).json({ error: 'Ошибка сервера' });
      return;
    }

    // Преобразуем blob pic в base64 строку, если pic есть
    const processedRows = rows.map(row => {
      let picBase64 = null;
      if (row.pic) {
        // row.pic это Buffer, преобразуем в base64
        picBase64 = row.pic.toString('base64');
      }
      return {
        text: row.text,
        pic: picBase64,
      };
    });

    res.json(processedRows);
  });
});
// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Обработка завершения работы приложения
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Ошибка при закрытии базы данных:', err.message);
    } else {
      console.log('Соединение с базой данных закрыто.');
    }
    process.exit(0);
  });
}); 