function get_by_id(id) {
  return document.getElementById(id);
}

function btn_trigger(id, funcao) {
  get_by_id(id).addEventListener('click', funcao);
  return get_by_id(id);
}

class Tarefa {
  constructor(id, descr, inicio = null, conclusao = null, concluida = false) {
    this.id = id;
    this.descricao = descr;
    this.inicio = inicio ?? new Date().toLocaleString();
    this.conclusao = conclusao;
    this.concluida = concluida;
  }

  concluir() {
    this.concluida = true;
    this.conclusao = new Date().toLocaleString();
  }

  reabrir() {
    this.concluida = false;
    this.conclusao = null;
  }
}

let tasks = [];
let previous_tasks = [];
let id_counter = 1;

const input = get_by_id('descricao_tarefa');
const input_btn = get_by_id('adicionar_btn');

function save_tasks() {
  localStorage.setItem('tarefas_salvas', JSON.stringify(tasks));
  localStorage.setItem('tarefas_previas', JSON.stringify(previous_tasks));
}

function load_tasks() {
  const saved = localStorage.getItem('tarefas_salvas');
  const prev = localStorage.getItem('tarefas_previas');

  if (saved) {
    const parsed = JSON.parse(saved);
    tasks = parsed.map(t => new Tarefa(t.id, t.descricao, t.inicio, t.conclusao, t.concluida));
    id_counter = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  }

  if (prev) {
    const parsedPrev = JSON.parse(prev);
    previous_tasks = parsedPrev.map(t => new Tarefa(t.id, t.descricao, t.inicio, t.conclusao, t.concluida));
  }

  renderTasks();
  renderPreviousTasks();
}

function renderTasks() {
  const container = get_by_id('container');
  container.innerHTML = '';

  tasks.forEach(task => {
    const new_tr = document.createElement('tr');
    new_tr.id = task.id;

    const td_id = document.createElement('td');
    td_id.innerText = task.id;

    const td_desc = document.createElement('td');
    td_desc.innerText = task.descricao;

    const td_start = document.createElement('td');
    td_start.innerText = task.inicio;

    const td_finish = document.createElement('td');
    td_finish.innerText = task.conclusao ?? '';

    const td_options = document.createElement('td');

    const btn_finish = document.createElement('button');
    btn_finish.innerText = task.concluida ? 'Reabrir' : 'Concluir';

    const btn_erase = document.createElement('button');
    btn_erase.innerText = 'Excluir';
    btn_erase.disabled = !task.concluida;

    btn_finish.addEventListener('click', () => {
      if (task.concluida) {
        task.reabrir();
      } else {
        task.concluir();
      }
      td_finish.innerText = task.conclusao ?? '';
      btn_finish.innerText = task.concluida ? 'Reabrir' : 'Concluir';
      btn_erase.disabled = !task.concluida;
      save_tasks();
    });

    btn_erase.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja excluir a tarefa?')) {
        if (task.concluida) {
          previous_tasks.push(task); // Só adiciona se estiver concluída
        }
        tasks = tasks.filter(t => t.id !== task.id);
        new_tr.remove();
        save_tasks();
        renderPreviousTasks();
      }
    });


    td_options.appendChild(btn_finish);
    td_options.appendChild(btn_erase);

    new_tr.appendChild(td_id);
    new_tr.appendChild(td_desc);
    new_tr.appendChild(td_start);
    new_tr.appendChild(td_finish);
    new_tr.appendChild(td_options);

    container.appendChild(new_tr);
  });
}

function renderPreviousTasks() {
  const container = get_by_id('amontoado');
  container.innerHTML = '';

  previous_tasks.forEach(task => {
    const tr = document.createElement('tr');

    const td_id = document.createElement('td');
    td_id.innerText = task.id;

    const td_desc = document.createElement('td');
    td_desc.innerText = task.descricao;

    const td_start = document.createElement('td');
    td_start.innerText = task.inicio;

    const td_finish = document.createElement('td');
    td_finish.innerText = task.conclusao ?? '';

    tr.appendChild(td_id);
    tr.appendChild(td_desc);
    tr.appendChild(td_start);
    tr.appendChild(td_finish);

    container.appendChild(tr);
  });
}

function append_task() {
  const input_desc = input.value.trim();
  if (!input_desc) return;

  const new_task = new Tarefa(id_counter++, input_desc);
  tasks.push(new_task);
  input.value = '';
  input_btn.disabled = true;
  alert('Nova tarefa adicionada.');
  save_tasks();
  renderTasks();
}

input.addEventListener('input', () => {
  input_btn.disabled = input.value.trim().length === 0;
});

btn_trigger('adicionar_btn', append_task);

window.onload = () => load_tasks();
