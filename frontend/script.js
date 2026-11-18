const apiUrl = 'https//localhots:3000/register';

const form = document.getElementById('book-form');
const table = document.getElementById('book-table');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const autor = document.getElementById('autor').value;
    const preco = document.getElementById('preco').value;
    const quantidade = document.getElementById('quantidade').value;

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'content-Type': 'application/json' },
            body: JSON.stringify({ title, autor, preco, quantidade })
        });

        if (!res.ok) throw new Error('Erro ao cadastrar livro');

        const book = await res.json();
        form.reset();

        addBookTable(book);

    } catch (err) {
        alert('Erro ao cadastrar o livro: ' + err.message);
    }
});

// adicionando o cadastro a tabela

function addBookTable(book) {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = book.title;

    const tdAutor = document.createElement('td');
    tdAutor.textContent = book.autor;

    const tdPreco = document.createElement('td');
    tdPreco.textContent = book.preco;

    const tdQuantidade = document.createElement('td');
    tdQuantidade.textContent = book.quantidade;

    tr.innerHTML = `

    <td>${title}</td>
    <td>${autor}</td>
    <td>${preco}</td>
    <td>${quantidade}</td>
    <td class="edit"><button>Editar</button></td>
    <td class="edit"><button>Excluir</button></td>
    `;

    tr.appendChild(tdTitle);
    tr.appendChild(tdAutor);
    tr.appendChild(tdPreco);
    tr.appendChild(tdQuantidade);

}

async function loadbooks() {
    try {
        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error("Erro ao cadastrar livros");
        }

        const book = await res.json();

        tr.innerHTML = "";
        book.forEach(addBookTable);

    } catch (err) {
        alert("Erro ao cadastrar livros: " + err.message);
    }
}

//botão de excluir

async function deleteTable(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error('Erro ao excluir a tabela');
        }

        loadTasks();

    } catch (err) {
        alert('Erro ao excluir a tabela: ' + err.message);
    }
}

// editar botão

async function editTable(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT'
        });

        if (!res.ok) {
            throw new Error('Erro ao editar a tabela');
        }

        loadTasks();

    } catch (err) {
        alert('Erro ao editar a tabela: ' + err.message);
    }
}





