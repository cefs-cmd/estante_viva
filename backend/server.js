const express = require('express');
const cors = require('cors');

const app = express();
const db = require('./db');

const PORT = 3000;

app.use(cors());
app.use(express.json());


// VALIDAR OS DADOS DO LIVRO

function validarLivro(body) {

    const titulo = String(body.titulo || body.title || '').trim();
    const autor = String(body.autor || '').trim();

    const precoInformado = body.preco;

    const quantidadeInformada = body.quantidade !== undefined
        ? body.quantidade
        : body.quantidade_estoque;

    const preco = Number(precoInformado);
    const quantidade = Number(quantidadeInformada);

    if (titulo === '' || autor === '') {
        return { erro: 'Preencha o título e o autor.' };
    }

    if (
        precoInformado === undefined ||
        precoInformado === null ||
        precoInformado === '' ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        return { erro: 'Informe um preço válido.' };
    }

    if (
        quantidadeInformada === undefined ||
        quantidadeInformada === null ||
        quantidadeInformada === '' ||
        !Number.isInteger(quantidade) ||
        quantidade < 0
    ) {
        return { erro: 'Informe uma quantidade inteira igual ou maior que zero.' };
    }

    return {
        dados: {
            titulo,
            autor,
            preco,
            quantidade
        }
    };

}


// GET - LISTAR E PESQUISAR LIVROS

app.get('/api/livros', (req, res) => {

    const titulo = (req.query.titulo || '').trim();

    let sql = `
        SELECT id, titulo, autor, preco,
        quantidade_estoque AS quantidade
        FROM tb_livro
    `;

    let params = [];

    if (titulo !== '') {

        sql += ' WHERE titulo LIKE ?';

        params.push(`%${titulo}%`);

    }

    db.query(sql, params, (err, results) => {

        if (err) {
            console.error('ERRO NA CONSULTA SQL:', err);
        }

        res.status(200).json(results);

    });

});


// GET - BUSCAR UM LIVRO PELO ID

app.get('/api/livros/:id', (req, res) => {

    db.query(
        `SELECT id, titulo, autor, preco,
        quantidade_estoque AS quantidade
        FROM tb_livro WHERE id = ?`,
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Livro não encontrado.' });
            }

            res.status(200).json(results[0]);

        }
    );

});


// POST - CADASTRAR UM LIVRO

app.post('/api/livros', (req, res) => {

    const validacao = validarLivro(req.body || {});

    if (validacao.erro) {
        return res.status(400).json({ error: validacao.erro });
    }

    const { titulo, autor, preco, quantidade } = validacao.dados;

    db.query(
        `INSERT INTO tb_livro
        (titulo, autor, preco, quantidade_estoque)
        VALUES (?, ?, ?, ?)`,
        [titulo, autor, preco, quantidade],
        (err, results) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                id: results.insertId,
                titulo,
                autor,
                preco,
                quantidade
            });

        }
    );

});


// PUT - ATUALIZAR UM LIVRO

app.put('/api/livros/:id', (req, res) => {

    const validacao = validarLivro(req.body || {});

    if (validacao.erro) {
        return res.status(400).json({ error: validacao.erro });
    }

    const { titulo, autor, preco, quantidade } = validacao.dados;

    const id = req.params.id;

    // Primeiro verifica se o livro existe.
    db.query(
        'SELECT id FROM tb_livro WHERE id = ?',
        [id],
        (err, results) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Livro não encontrado.' });
            }

            // Se existir, atualiza os dados.
            db.query(
                `UPDATE tb_livro
                SET titulo = ?, autor = ?, preco = ?, quantidade_estoque = ?
                WHERE id = ?`,
                [titulo, autor, preco, quantidade, id],
                (err) => {

                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(200).json({
                        id,
                        titulo,
                        autor,
                        preco,
                        quantidade
                    });

                }
            );

        }
    );

});


// DELETE - EXCLUIR UM LIVRO

app.delete('/api/livros/:id', (req, res) => {

    db.query(
        'DELETE FROM tb_livro WHERE id = ?',
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Livro não encontrado.' });
            }

            res.status(204).send();

        }
    );

});


// INICIAR SERVIDOR

app.listen(PORT, () => {

    console.log(`Servidor rodando na porta ${PORT}`);

});
