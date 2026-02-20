const armazens = { A: 22, B: 4, C: 4, D: 13, E: 13, F: 17 };

let cargas = JSON.parse(localStorage.getItem("cargas")) || [];

function salvarCargas() {
  localStorage.setItem("cargas", JSON.stringify(cargas));
}

function atualizarResumo(resumoDiv) {
  if (!resumoDiv) return;

  const resumo = { Enlonado: 0, Pendente: 0, "Não Enlonado": 0 };

  cargas.forEach((c) => {
    if (resumo.hasOwnProperty(c.status)) {
      resumo[c.status]++;
    }
  });

  resumoDiv.innerHTML = `
    <span>Enlonados: ${resumo["Enlonado"]}</span>
    <span>Pendentes: ${resumo["Pendente"]}</span>
    <span>Não Enlonados: ${resumo["Não Enlonado"]}</span>
  `;
}

function popularSelects(selectArmazem, incluirTodos = false) {
  selectArmazem.innerHTML = incluirTodos
    ? `<option value="Todos">Todos</option>`
    : `<option value="">Selecionar Armazém</option>`;

  for (const a in armazens) {
    selectArmazem.innerHTML += `<option value="${a}">${a}</option>`;
  }
}

function atualizarBoxes(selectArmazem, selectBox) {
  function atualizar() {
    selectBox.innerHTML = `<option value="">Selecionar Box</option>`;
    const maxBox = armazens[selectArmazem.value] || 0;

    for (let i = 1; i <= maxBox; i++) {
      selectBox.innerHTML += `<option value="${i}">${i}</option>`;
    }
  }

  atualizar();
  selectArmazem.addEventListener("change", atualizar);
}

function adicionarProduto(form, selectArmazem, selectBox, produtoInput, callback) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const armazem = selectArmazem.value;
    const box = Number(selectBox.value);
    const produto = produtoInput.value.trim();

    if (!armazem || !box || !produto) return;

    if (cargas.some((c) => c.armazem === armazem && c.box === box)) {
      alert("Este box já está ocupado!");
      return;
    }

    const dataHora = new Date().toLocaleString();
    const id = crypto.randomUUID();

    cargas.push({
      id,
      armazem,
      box,
      produto,
      status: "Pendente",
      dataCriacao: dataHora,
      historico: [{ data: dataHora, acao: "Produto adicionado" }],
    });

    salvarCargas();
    form.reset();

    if (callback) callback();
  });
}

let estadosGavetas = {};

function renderArmazens(container, filtro = "Todos", resumoDiv = null) {
  container.innerHTML = "";

  for (const armazem in armazens) {
    if (filtro !== "Todos" && filtro !== armazem) continue;

    const bloco = document.createElement("div");
    bloco.className = "armazem-bloco";

    const header = document.createElement("div");
    header.className = "armazem-header";
    header.innerHTML = `
      <span>Armazém ${armazem}</span>
      <span class="arrow">&#9654;</span>
    `;

    const boxesContainer = document.createElement("div");
    boxesContainer.className = "armazem-boxes";
    boxesContainer.style.display = estadosGavetas[armazem] ? "flex" : "none";

    header.classList.toggle("active", estadosGavetas[armazem] || false);

    for (let i = 1; i <= armazens[armazem]; i++) {
      const carga = cargas.find(
        (c) => c.armazem === armazem && c.box === i
      );

      const card = document.createElement("div");
      card.className = "box-card";

      if (carga) {
        card.dataset.id = carga.id;

        card.innerHTML = `
          <div><strong>Box:</strong> ${i}</div>
          <div><strong>Produto:</strong> ${carga.produto}</div>
          <div>
            <strong>Status:</strong>
            <select class="status-select">
              <option value="Enlonado" ${carga.status === "Enlonado" ? "selected" : ""}>Enlonado</option>
              <option value="Pendente" ${carga.status === "Pendente" ? "selected" : ""}>Pendente</option>
              <option value="Não Enlonado" ${carga.status === "Não Enlonado" ? "selected" : ""}>Não Enlonado</option>
            </select>
          </div>
          <button class="btn-historico">Histórico</button>
          <div class="historico" style="display:none"></div>
          <button class="btn-excluir">Excluir</button>
        `;
      } else {
        card.innerHTML = `
          <div><strong>Box:</strong> ${i}</div>
          <div>Vazio</div>
          <button class="btn-add" data-armazem="${armazem}" data-box="${i}">
            Adicionar Produto
          </button>
        `;
      }

      boxesContainer.appendChild(card);
    }

    bloco.appendChild(header);
    bloco.appendChild(boxesContainer);
    container.appendChild(bloco);

    header.addEventListener("click", () => {
      const aberto = boxesContainer.style.display === "flex";
      boxesContainer.style.display = aberto ? "none" : "flex";
      header.classList.toggle("active", !aberto);
      estadosGavetas[armazem] = !aberto;
    });
  }

  atualizarResumo(resumoDiv);
  ativarEventos(container, filtro, resumoDiv);
}

function ativarEventos(container, filtro, resumoDiv) {
  const modalForm = document.getElementById("modalForm");
  const selectArmazem = document.getElementById("armazem");
  const selectBox = document.getElementById("box");

  container.querySelectorAll(".box-card").forEach((card) => {
    const id = card.dataset.id;

    const addBtn = card.querySelector(".btn-add");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const armazem = addBtn.dataset.armazem;
        const box = addBtn.dataset.box;

        modalForm.style.display = "flex";
        selectArmazem.value = armazem;
        selectArmazem.dispatchEvent(new Event("change"));
        selectBox.value = box;
      });
    }

    const statusSelect = card.querySelector(".status-select");
    if (statusSelect) {
      statusSelect.addEventListener("change", () => {
        const carga = cargas.find((c) => c.id === id);
        if (!carga) return;

        const novaStatus = statusSelect.value;
        const dataHora = new Date().toLocaleString();

        carga.historico.push({
          data: dataHora,
          acao: `Status alterado de ${carga.status} para ${novaStatus}`,
        });

        carga.status = novaStatus;

        salvarCargas();
        renderArmazens(container, filtro, resumoDiv);
      });
    }

    const excluirBtn = card.querySelector(".btn-excluir");
    if (excluirBtn) {
      excluirBtn.addEventListener("click", () => {
        cargas = cargas.filter((c) => c.id !== id);
        salvarCargas();
        renderArmazens(container, filtro, resumoDiv);
      });
    }

    const histBtn = card.querySelector(".btn-historico");
    if (histBtn) {
      histBtn.addEventListener("click", () => {
        const carga = cargas.find((c) => c.id === id);
        if (!carga) return;

        const histDiv = card.querySelector(".historico");

        histDiv.innerHTML = carga.historico
          .map((h) => `<div>[${h.data}] ${h.acao}</div>`)
          .join("");

        histDiv.style.display =
          histDiv.style.display === "block" ? "none" : "block";
      });
    }
  });
}
