const resumoDiv = document.getElementById('resumo');
const filtroArmazem = document.getElementById('filtroArmazem');
const armazensContainer = document.getElementById('armazensContainer');
const modalForm = document.getElementById('modalForm');
const fecharFormBtn = document.getElementById('fecharFormBtn');
const form = document.getElementById('formCarga');
const selectArmazem = document.getElementById('armazem');
const selectBox = document.getElementById('box');
const produtoInput = document.getElementById('produto');

modalForm.style.display = 'none';

fecharFormBtn.addEventListener('click', () => {
  modalForm.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modalForm) {
    modalForm.style.display = 'none';
  }
});

/* Inicialização */

popularSelects(selectArmazem);
popularSelects(filtroArmazem, true);

atualizarBoxes(selectArmazem, selectBox);

renderArmazens(
  armazensContainer,
  filtroArmazem.value || 'Todos',
  resumoDiv
);

/* Eventos */

filtroArmazem.addEventListener('change', () => {
  renderArmazens(
    armazensContainer,
    filtroArmazem.value,
    resumoDiv
  );
});

adicionarProduto(
  form,
  selectArmazem,
  selectBox,
  produtoInput,
  () => {
    renderArmazens(
      armazensContainer,
      filtroArmazem.value,
      resumoDiv
    );

    modalForm.style.display = 'none';
    form.reset();
  }
);
