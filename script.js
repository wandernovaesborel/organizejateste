import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-'); // Divide a string ISO em partes
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`; // Retorna a data no formato DD/MM/AAAA
}

// Configurações do Firebase
const configuracaoFirebase = {
    apiKey: "AIzaSyCS7_vKtYKJfIK2B_rY-6Li4qGONysAYbw",
    authDomain: "organizeja-27c38.firebaseapp.com",
    projectId: "organizeja-27c38",
    storageBucket: "organizeja-27c38.appspot.com",
    messagingSenderId: "161096968948",
    appId: "1:161096968948:web:cbe33ad523f413a04a8ca1"
};

// Inicializar Firebase
const app = initializeApp(configuracaoFirebase);
const db = getFirestore(app);
const auth = getAuth(app);

let usuarioAtual = null;

// Função de autenticação de usuários
document.getElementById('formLogin').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const email = document.getElementById('inputEmail').value;
    const senha = document.getElementById('inputSenha').value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
        alert('Login bem-sucedido!');
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        alert('Erro ao fazer login. Verifique suas credenciais.');
    }
});

// Função de cadastro de novos usuários
document.getElementById('botaoCadastro').addEventListener('click', async function () {
    const email = prompt('Digite seu e-mail:');
    const senha = prompt('Digite sua senha:');
    if (email && senha) {
        try {
            await createUserWithEmailAndPassword(auth, email, senha);
            alert('Cadastro realizado com sucesso!');
        } catch (erro) {
            console.error('Erro ao cadastrar usuário:', erro);
            alert('Erro ao cadastrar usuário. Erro: ' + erro.message);
        }
    }
});

// Função de logout
document.getElementById('botaoLogout').addEventListener('click', async function () {
    try {
        await signOut(auth);
        alert('Logout realizado com sucesso!');
    } catch (erro) {
        console.error('Erro ao fazer logout:', erro);
        alert('Erro ao fazer logout.');
    }
});

// Verifica se há um usuário autenticado
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        usuarioAtual = usuario.uid;
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('crudContainer').style.display = 'block';
        carregarEventos();
    } else {
        usuarioAtual = null;
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('crudContainer').style.display = 'none';
    }
});



// Exibir o modal de adicionar evento
document.getElementById('botaoAdicionarEvento').addEventListener('click', function () {
    document.getElementById('modalAdicionar').style.display = 'block';
});

// Exibir o modal de adicionar apelido
document.getElementById('cadastrarApelido').addEventListener('click', function () {
    document.getElementById('modalApelido').style.display = 'block';
});

// Função para fechar modais
function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar o modal de evento ao clicar no botão de fechar
document.getElementById('fecharModalAdicionar').addEventListener('click', function () {
    fecharModal('modalAdicionar');
});

// Fechar o modal de apelido ao clicar no botão de fechar
document.getElementById('fecharModalApelido').addEventListener('click', function () {
    fecharModal('modalApelido');
});

// Fechar o modal ao clicar fora dele
window.addEventListener('click', function (event) {
    const modalAdicionar = document.getElementById('modalAdicionar');
    const modalApelido = document.getElementById('modalApelido');
    
    if (event.target === modalAdicionar) {
        fecharModal('modalAdicionar');
    } else if (event.target === modalApelido) {
        fecharModal('modalApelido');
    }
});












// Função para adicionar apelido
document.getElementById('formApelidoModal').addEventListener('submit', async function (eventoapelido) {
    eventoapelido.preventDefault();

    const apelido = document.getElementById('inputApelido').value;

    console.log('Adicionando apelido:', { apelido });

    try {
        await addDoc(collection(db, 'apelidos'), {
            apelido,
            usuarioId: usuarioAtual
        });
        alert('Apelido cadastrado com sucesso!');
        document.getElementById('modalApelido').style.display = 'none'; // Fecha o modal
    } catch (erro) {
        console.error('Erro ao cadastrar apelido:', erro);
        alert('Erro ao cadastrar apelido. Tente novamente mais tarde.');
    }
});





// Função para adicionar evento
document.getElementById('formEventoModal').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    
    const nome = document.getElementById('inputNome').value;
    const descricao = document.getElementById('inputDescricao').value;
    const data = document.getElementById('inputData').value;
    const horario = document.getElementById('inputHorario').value;
    const local = document.getElementById('inputLocal').value;
    const participantes = document.getElementById('inputParticipantes').value.split(',').map(p => p.trim());
    const prioridade = document.getElementById('inputPrioridade').value;

    console.log('Adicionando evento:', { nome, descricao, data, horario, local, participantes, prioridade });

    try {
        await addDoc(collection(db, 'eventos'), {
            nome,
            descricao,
            data,
            horario,
            local,
            participantes,
            prioridade,
            usuarioId: usuarioAtual
        });
        alert('Evento adicionado com sucesso!');
        document.getElementById('formEventoModal').reset();
        carregarEventos(); // Atualiza a lista de eventos
        document.getElementById('modalAdicionar').style.display = 'none'; // Fecha o modal
    } catch (erro) {
        console.error('Erro ao adicionar evento:', erro);
        alert('Erro ao adicionar evento. Tente novamente mais tarde.');
    }
});




// Função para editar evento
window.editarEvento = async function (id) {
    const modal = document.getElementById('modalEdicao');
    const fecharModalEdicao = document.getElementById('fecharModalEdicao');

    // Abre o modal
    modal.style.display = 'block';

    // Fechar modal quando clicar no botão de fechar
    fecharModalEdicao.onclick = function () {
        modal.style.display = 'none';
    }

    // Fechar modal quando clicar fora do conteúdo
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Se houver um ID, busca os dados do evento no Firestore
    if (id) {
        try {
            const eventoRef = doc(db, 'eventos', id);
            const eventoSnap = await getDoc(eventoRef);

            if (eventoSnap.exists()) {
                const evento = eventoSnap.data();

                // Preenche os campos do formulário com os dados do evento
                document.getElementById('inputEventoId').value = id;
                document.getElementById('inputEditNome').value = evento.nome;
                document.getElementById('inputEditDescricao').value = evento.descricao;
                document.getElementById('inputEditData').value = evento.data;
                document.getElementById('inputEditHorario').value = evento.horario;
                document.getElementById('inputEditLocal').value = evento.local;
                document.getElementById('inputEditParticipantes').value = evento.participantes.join(', ');
                document.getElementById('inputEditPrioridade').value = evento.prioridade;
            }
        } catch (erro) {
            console.error('Erro ao carregar dados do evento:', erro);
            alert('Erro ao carregar os dados do evento.');
        }
    }
};









// Função para salvar alterações do evento
document.getElementById('formEditEvento').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const id = document.getElementById('inputEventoId').value;
    const nome = document.getElementById('inputEditNome').value;
    const descricao = document.getElementById('inputEditDescricao').value;
    const data = document.getElementById('inputEditData').value;
    const horario = document.getElementById('inputEditHorario').value;
    const local = document.getElementById('inputEditLocal').value;
    const participantes = document.getElementById('inputEditParticipantes').value.split(',').map(p => p.trim());
    const prioridade = document.getElementById('inputEditPrioridade').value;

    try {
        const eventoRef = doc(db, 'eventos', id);
        await updateDoc(eventoRef, {
            nome,
            descricao,
            data,
            horario,
            local,
            participantes,
            prioridade
        });

        alert('Evento atualizado com sucesso!');
        document.getElementById('modalEdicao').style.display = 'none';
        carregarEventos(); // Atualiza a lista de eventos
    } catch (erro) {
        console.error('Erro ao atualizar evento:', erro);
        alert('Erro ao atualizar o evento.');
    }
});



// Função para excluir evento
window.excluirEvento = async function (id) {
    const confirmar = confirm('Tem certeza de que deseja excluir este evento?');
    if (confirmar) {
        try {
            const eventoRef = doc(db, 'eventos', id);
            const eventoSnap = await getDoc(eventoRef);
            if (eventoSnap.exists()) {
                const evento = eventoSnap.data();
                if (evento.usuarioId === usuarioAtual) { // Verifica se o evento pertence ao usuário atual
                    await deleteDoc(eventoRef);
                    alert('Evento excluído com sucesso!');
                    carregarEventos();
                } else {
                    alert('Você não tem permissão para excluir este evento.');
                }
            }
        } catch (erro) {
            console.error('Erro ao excluir evento:', erro);
            alert('Erro ao excluir evento. Tente novamente mais tarde.');
        }
    }
}



// Função para carregar eventos do usuário atual
async function carregarEventos() {
    const containerEventos = document.getElementById('containerEventos');
    containerEventos.innerHTML = '';
    try {
        const eventosRef = collection(db, 'eventos');
        const q = query(eventosRef, where("usuarioId", "==", usuarioAtual));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const evento = doc.data();
            const id = doc.id;
            // Mapeia a prioridade para as cores
            const coresPrioridade = {
               "Baixa": "green",
                "Média": "yellow",
                "Alta": "red"
            };
            // Obtém a cor com base na prioridade do evento
            const corBorda = coresPrioridade[evento.prioridade] || "black"; // Define padrão como preto se a prioridade não for reconhecida
            const eventoElement = document.createElement('div');
            eventoElement.className = 'event-item';
            eventoElement.style.border = `4px solid ${corBorda}`;
            eventoElement.innerHTML = `
                
                <h2>${formatarData(evento.data)} às ${evento.horario}hs</h2>
                <p><h3>${evento.nome}</h3>
                <p><strong>Participantes:</strong> ${evento.participantes.join(', ')} </p>
                <p><strong>Descrição:</strong> ${evento.descricao} </p>
                <br>
                <button onclick="window.open('${evento.local}', '_blank')" id="botaoLocal" title="Clique para ver o local do evento">🗺️</button>
                <button onclick="editarEvento('${id}')" id="botaoEditar" title="Clique para editar">✏️</button>
                <button onclick="excluirEvento('${id}')" id="botaoExcluir" title="Clique para excluir">🗑️</button>     
            `;
            containerEventos.appendChild(eventoElement);
        });
    } catch (erro) {
        console.error('Erro ao carregar eventos:', erro);
        alert('Erro ao carregar eventos. Tente novamente mais tarde.');
    }
}
