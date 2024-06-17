const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Membuat note baru
app.post('/notes', (req, res) => {
    const { title, datetime, note } = req.body;
    const query = 'INSERT INTO notes (title, datetime, note) VALUES (?, ?, ?)';
    db.query(query, [title, datetime, note], (err, results) => {
        if (err) return res.status(500).send({ code: 500, message: 'Internal Server Error', error: err });
        res.status(201).send({ code: 201, message: 'Note created', data: { id: results.insertId } });
    });
});

// Menampilkan semua notes
app.get('/notes', (req, res) => {
    const query = 'SELECT * FROM notes';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send({ code: 500, message: 'Internal Server Error', error: err });
        res.status(200).send({ code: 200, message: 'Notes retrieved', data: results });
    });
});

// Menampilkan salah satu note berdasarkan ID
app.get('/notes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM notes WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send({ code: 500, message: 'Internal Server Error', error: err });
        if (results.length === 0) return res.status(404).send({ code: 404, message: 'Note not found' });
        res.status(200).send({ code: 200, message: 'Note retrieved', data: results[0] });
    });
});

// Mengubah note
app.put('/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, datetime, note } = req.body;
    const query = 'UPDATE notes SET title = ?, datetime = ?, note = ? WHERE id = ?';
    db.query(query, [title, datetime, note, id], (err, results) => {
        if (err) return res.status(500).send({ code: 500, message: 'Internal Server Error', error: err });
        if (results.affectedRows === 0) return res.status(404).send({ code: 404, message: 'Note not found' });
        res.status(200).send({ code: 200, message: 'Note updated' });
    });
});

// Menghapus note
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM notes WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send({ code: 500, message: 'Internal Server Error', error: err });
        if (results.affectedRows === 0) return res.status(404).send({ code: 404, message: 'Note not found' });
        res.status(200).send({ code: 200, message: 'Note deleted' });
    });
});

// Jalankan server
const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});