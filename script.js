const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwz3TuUjHEvk_68Rdm05t8_vex7tOIHxoynyf09tuYUU_ekcRgBpJEIN5Zl8qb6Bpwg/exec";

function enviarEmailRegistroConsulta(payloadExtra = {}) {
  const payload = {
    subject: "Novo registro de consulta!",
    bodyText: "Novo registro de consulta!",
    bodyHtml: "<p><b>Novo registro de consulta!</b></p>",
    ...payloadExtra
  };
 
  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => console.log(""));
}

var modoEscuroAtivado = false;
var ultimoCalculo = null;

let currentInput = '';
let operator = null;
let firstOperand = null;

function appendNumber(number) {
  if (currentInput === '0' && number !== '.') currentInput = number;
  else currentInput += number;
  updateScreen();
}
function setOperator(op) {
  if (operator !== null) calculateResult();
  firstOperand = parseFloat(currentInput);
  operator = op;
  currentInput = '';
}
function calculateResult() {
  if (operator === null || currentInput === '') return;
  const secondOperand = parseFloat(currentInput);
  let result;
  switch (operator) {
    case '+': result = firstOperand + secondOperand; break;
    case '-': result = firstOperand - secondOperand; break;
    case '*': result = firstOperand * secondOperand; break;
    case '/': result = firstOperand / secondOperand; break;
    default: return;
  }
  currentInput = result.toString();
  operator = null;
  firstOperand = null;
  updateScreen();
}
function clearScreen() {
  currentInput = '';
  operator = null;
  firstOperand = null;
  updateScreen();
}
function updateScreen() {
  document.getElementById('calculator-screen').innerText = currentInput || '0';
}
function toggleCalculator() {
  const calculator = document.getElementById('calculator');
  const isVisible = calculator.style.display === 'block';
  calculator.style.display = isVisible ? 'none' : 'block';
}

function exibirModalSobre() { document.getElementById('modalSobre').style.display = 'block'; }
function fecharModalSobre() { document.getElementById('modalSobre').style.display = 'none'; }

function exibirModal() {
  var modal = document.getElementById('modal');
  var resultadoAnterior = document.getElementById('resultadoAnterior');
  resultadoAnterior.innerHTML = ultimoCalculo ? ultimoCalculo : 'Você não realizou nenhum cálculo ainda.';
  modal.style.display = 'block';
}
function fecharModal() { document.getElementById('modal').style.display = 'none'; }

function carregarUltimoCalculo() {
  var ultimoCalculoArmazenado = localStorage.getItem('ultimoCalculo_travado_DI');
  if (ultimoCalculoArmazenado !== null) {
    ultimoCalculo = ultimoCalculoArmazenado;
    exibirResultadoAnterior();
  }
}
function salvarUltimoCalculo(resultadoHTMLMascarado) {
  ultimoCalculo = resultadoHTMLMascarado;
  localStorage.setItem('ultimoCalculo_travado_DI', resultadoHTMLMascarado);
}
function exibirResultadoAnterior() {
  if (ultimoCalculo) document.getElementById('resultadoAnterior').innerHTML = ultimoCalculo;
}

const MASCARA_VALOR = 'XXX,XXX';

function mascararBlocoResultados(htmlReal) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = htmlReal;

  wrapper.querySelectorAll('.resultado-detalhe').forEach(p => {
    const label = p.querySelector('b') ? p.querySelector('b').outerHTML : '';
    p.innerHTML = `${label} ${MASCARA_VALOR}`;
  });

  wrapper.querySelectorAll('.resultado-item, .resultado-detalhes, .resultado-detalhe, .fornecedor-nome')
    .forEach(el => el.classList.add('resultado-bloqueado'));

  return wrapper.innerHTML;
}

function validarInformacoes() {
  const toNumber = id => parseFloat(document.getElementById(id).value.replace(/\./g, '').replace(',', '.'));
  var valorPIS = toNumber('valorPIS');
  var valorCOFINS = toNumber('valorCOFINS');
  var valorSISCOMEX = toNumber('valorSISCOMEX');
  var valorNumerario = toNumber('valorNumerario');
  var valorVariacao = toNumber('valorVariacao');
  var quantidadeFornecedores = parseInt(document.getElementById('quantidadeFornecedores').value);

  if ( [valorPIS,valorCOFINS,valorSISCOMEX,valorNumerario,valorVariacao].some(isNaN) || quantidadeFornecedores === 0 ) {
    alert('Preencha todos os campos corretamente.');
    return false;
  }
  return true;
}
function validarFornecedores() {
  var quantidadeFornecedores = parseInt(document.getElementById('quantidadeFornecedores').value);
  for (var i = 1; i <= quantidadeFornecedores; i++) {
    var nome = document.getElementById('fornecedorNome' + i).value;
    var percentual = parseFloat(document.getElementById('fornecedorPercentual' + i).value.replace(',', '.'));
    if (nome.trim() === '' || isNaN(percentual)) {
      alert('Preencha corretamente as informações do fornecedor ' + i);
      return false;
    }
  }
  return true;
}

function calcularValores() {
  if (!(validarInformacoes() && validarFornecedores())) return;

  const toFloat = id => parseFloat(document.getElementById(id).value.replace(',', '.'));
  var valorPIS = toFloat('valorPIS');
  var valorCOFINS = toFloat('valorCOFINS');
  var valorSISCOMEX = toFloat('valorSISCOMEX');
  var valorNumerario = toFloat('valorNumerario');
  var valorVariacao = toFloat('valorVariacao');

  var distribuicoes = [];
  var quantidadeFornecedores = parseInt(document.getElementById('quantidadeFornecedores').value);
  for (var i = 1; i <= quantidadeFornecedores; i++) {
    var nome = document.getElementById('fornecedorNome' + i).value;
    var percentual = parseFloat(document.getElementById('fornecedorPercentual' + i).value.replace(',', '.'));
    distribuicoes.push({ nome, percentual });
  }

  var htmlReal = '';
  for (var j = 0; j < distribuicoes.length; j++) {
    var d = distribuicoes[j];
    var pis = 999;
    var cofins = 999;
    var siscomex = 999;
    var numerario = 999;
    var variacao = 999;

    const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    htmlReal += `
      <div class="resultado-item">
        <p class="fornecedor-nome"><b> Fornecedor: ${d.nome} </b></p>
        <div class="resultado-detalhes">
          <p class="resultado-detalhe"><b> PIS: </b> ${fmt(pis)}</p>
          <p class="resultado-detalhe"><b> COFINS: </b> ${fmt(cofins)}</p>
          <p class="resultado-detalhe"><b> SISCOMEX: </b> ${fmt(siscomex)}</p>
          <p class="resultado-detalhe"><b> NUMERARIO: </b> ${fmt(numerario)}</p>
          <p class="resultado-detalhe"><b> VARIAÇÃO: </b> ${fmt(variacao)}</p>
        </div>
      </div>`;
  }

  const htmlMascarado = mascararBlocoResultados(htmlReal);
  document.getElementById('resultado').innerHTML = htmlMascarado;
  salvarUltimoCalculo(htmlMascarado);

  try {
    const resumo = {
      fornecedores: distribuicoes.map(d => d.nome),
      qtd: distribuicoes.length,
      quando: new Date().toLocaleString('pt-BR')
    };
    enviarEmailRegistroConsulta({ resumo });
  } catch (_) {
  }

  const btnExp = document.getElementById('exportarExcelButton');
  if (btnExp) btnExp.style.display = 'none';

  if (!document.getElementById('avisoAcesso')) {
    const aviso = document.createElement('p');
    aviso.id = 'avisoAcesso';
    aviso.className = 'aviso-acesso';
    aviso.textContent = 'Este é apenas um exemplo! Para obter acesso completo ao sistema, entre em contato pelo e-mail wrubly@outlook.com e solicite informações sobre valores.';
    document.querySelector('.container').appendChild(aviso);
  }
}

function exportarParaExcel() {
  alert('Recurso disponível apenas na versão completa. Para liberar o exportador, entre em contato: wrubly@gmail.com');
  return;
}

function limparCampos() {
  ['valorPIS','valorCOFINS','valorSISCOMEX','valorNumerario','valorVariacao'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('quantidadeFornecedores').value = '0';
  document.getElementById('fornecedoresFields').innerHTML = '';
  document.getElementById('fornecedoresFields').style.display = 'none';
  document.getElementById('resultado').innerHTML = '';

  const aviso = document.getElementById('avisoAcesso');
  if (aviso) aviso.remove();
}

document.getElementById('quantidadeFornecedores').addEventListener('change', function () {
  var fornecedoresFields = document.getElementById('fornecedoresFields');
  fornecedoresFields.innerHTML = '';
  var qtd = parseInt(this.value);
  for (var i = 1; i <= qtd; i++) {
    var nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.id = 'fornecedorNome' + i;
    nomeInput.placeholder = 'Nome do fornecedor ' + i;
    fornecedoresFields.appendChild(nomeInput);

    var percentualInput = document.createElement('input');
    percentualInput.type = 'text';
    percentualInput.id = 'fornecedorPercentual' + i;
    percentualInput.placeholder = 'Porcentagem do fornecedor ' + i + ' (em %)';
    fornecedoresFields.appendChild(percentualInput);
  }
  fornecedoresFields.style.display = qtd > 0 ? 'block' : 'none';
});

function carregarModoEscuro() {
  var modoEscuroSalvo = localStorage.getItem('modoEscuro');
  if (modoEscuroSalvo !== null) {
    modoEscuroAtivado = JSON.parse(modoEscuroSalvo);
    aplicarModoEscuro();
  }
}
function salvarModoEscuro() { localStorage.setItem('modoEscuro', modoEscuroAtivado); }
function aplicarModoEscuro() {
  var body = document.body;
  body.classList.toggle('dark-mode', modoEscuroAtivado);
  var modoEscuroBtn = document.querySelector('.modo-escuro-btn');
  modoEscuroBtn.textContent = modoEscuroAtivado ? 'Modo Claro' : 'Modo Escuro';
}
function alternarModo() {
  modoEscuroAtivado = !modoEscuroAtivado;
  salvarModoEscuro();
  aplicarModoEscuro();
}

document.addEventListener('DOMContentLoaded', () => {
  carregarModoEscuro();
  carregarUltimoCalculo();
});
