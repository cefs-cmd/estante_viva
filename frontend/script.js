const apiUrl = 'http://localhost:3000/api/livros';

const form = document.getElementById('book-form');
const bookList = document.getElementById('book-list');

const titleInput = document.getElementById('title');
const autorInput = document.getElementById('autor');
const precoInput = form.querySelector('.segundo-cadastro input[type="number"]');
const quantidadeInput = document.getElementById('quantidade');

const searchInput = document.querySelector('.buscar');
const searchButton = document.querySelector('.pesquisar');
const clearButton = document.querySelector('.limpar');

const formTitle = form.querySelector('h3');
const submitButton = form.querySelector('.cadastrar-button');

// Criando o botão de cancelar edição pelo JavaScript.
const cancelButton = document.createElement('button');

cancelButton.textContent = 'Cancelar edição';
cancelButton.type = 'button';
cancelButton.hidden = true;

form.querySelector('.segundo-cadastro').appendChild(cancelButton);

// Guarda o ID do livro que está sendo editado.
let editingId = null;


// CADASTRAR E EDITAR LIVROS

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const autor = autorInput.value.trim();
    const precoText = precoInput.value;
    const quantidadeText = quantidadeInput.value;

    const preco = Number(precoText);
    const quantidade = Number(quantidadeText);

    // VALIDANDO OS CAMPOS

    if (title === '' || autor === '') {
        alert('Preencha o título e o autor corretamente.');
        return;
    }

    if (precoText === '' || !Number.isFinite(preco) || preco <= 0) {
        alert('Informe um preço válido.');
        return;
    }

    if (quantidadeText === '' || !Number.isInteger(quantidade) || quantidade < 0) {
        alert('Informe uma quantidade inteira igual ou maior que zero.');
        return;
    }

    // ORGANIZANDO OS DADOS

    const bookData = {
        title,
        autor,
        preco,
        quantidade
    };

    try {
        const res = await fetch(
            editingId === null ? apiUrl : `${apiUrl}/${editingId}`,
            {
                method: editingId === null ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            }
        );

        if (!res.ok) throw new Error('Erro HTTP: ' + res.status);

        alert(editingId === null
            ? 'Livro cadastrado com sucesso!'
            : 'Livro atualizado com sucesso!');

        form.reset();

        resetForm();

        searchInput.value = '';

        loadBooks();

    } catch (err) {
        alert('Erro ao salvar livro: ' + err.message);
    }
});


// ADICIONAR LIVROS NA TABELA

function addBookTable(book) {
    const tr = document.createElement('tr');

    const title = book.title || book.titulo || '';

    const preco = Number(book.preco);

    const tdTitle = document.createElement('td');
    tdTitle.textContent = title;

    const tdAutor = document.createElement('td');
    tdAutor.textContent = book.autor;

    const tdPreco = document.createElement('td');
    tdPreco.textContent = Number.isFinite(preco)
        ? preco.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
        : '—';

    const tdQuantidade = document.createElement('td');
    tdQuantidade.textContent = book.quantidade;

    const tdActions = document.createElement('td');

    // BOTÃO EDITAR

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.type = 'button';

    editButton.addEventListener('click', () => {
        editBook(book.id);
    });

    // BOTÃO EXCLUIR

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.type = 'button';

    deleteButton.addEventListener('click', () => {
        deleteBook(book.id, title);
    });

    tdActions.appendChild(editButton);
    tdActions.appendChild(deleteButton);

    tr.appendChild(tdTitle);
    tr.appendChild(tdAutor);
    tr.appendChild(tdPreco);
    tr.appendChild(tdQuantidade);
    tr.appendChild(tdActions);

    bookList.appendChild(tr);
}


// CARREGAR LIVROS DO SERVIDOR

async function loadBooks(titulo = '') {
    try {
        const url = titulo.trim() === ''
            ? apiUrl
            : `${apiUrl}?titulo=${encodeURIComponent(titulo.trim())}`;

        const res = await fetch(url);

        if (!res.ok) throw new Error('Erro ao carregar livros: ' + res.status);

        const data = await res.json();

        const books = Array.isArray(data) ? data : data.livros;

        if (!Array.isArray(books)) {
            throw new Error('O servidor não retornou uma lista de livros.');
        }

        bookList.innerHTML = '';

        if (books.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');

            td.textContent = 'Nenhum livro encontrado no catálogo.';
            td.colSpan = 5;

            tr.appendChild(td);
            bookList.appendChild(tr);

            return;
        }

        books.forEach(addBookTable);

    } catch (err) {
        alert('Erro ao carregar livros: ' + err.message);
    }
}


// EDITAR LIVROS

async function editBook(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`);

        if (!res.ok) throw new Error('Erro ao buscar livro');

        const data = await res.json();

        const book = data.livro || data;

        titleInput.value = book.title || book.titulo || '';
        autorInput.value = book.autor || '';
        precoInput.value = book.preco ?? '';
        quantidadeInput.value = book.quantidade ?? '';

        editingId = id;

        formTitle.textContent = 'Editar livro';
        submitButton.textContent = 'Salvar alterações';

        cancelButton.hidden = false;

        form.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    } catch (err) {
        alert('Erro ao buscar livro: ' + err.message);
    }
}


// CANCELAR EDIÇÃO

function resetForm() {
    editingId = null;

    formTitle.textContent = 'Cadastrar livro';
    submitButton.textContent = 'Cadastrar livro';

    cancelButton.hidden = true;
}

cancelButton.addEventListener('click', () => {
    form.reset();

    resetForm();

    alert('Edição cancelada.');
});


// EXCLUIR LIVROS

async function deleteBook(id, title) {
    const confirmar = confirm(`Deseja excluir o livro "${title}"?`);

    if (!confirmar) return;

    try {
        const res = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('Erro ao excluir livro');

        alert('Livro excluído com sucesso!');

        loadBooks(searchInput.value);

    } catch (err) {
        alert('Erro ao excluir livro: ' + err.message);
    }
}


// PESQUISAR LIVROS

searchButton.addEventListener('click', () => {
    loadBooks(searchInput.value);
});


// LIMPAR PESQUISA

clearButton.addEventListener('click', () => {
    searchInput.value = '';

    loadBooks();
});


// CARREGAR LIVROS AO ABRIR A PÁGINA

loadBooks();