import {buildRegularOperation,buildSimplesOperation} from './contract.mjs';
const form=document.querySelector('#calc-form');
const errorBox=document.querySelector('#form-error');
const result=document.querySelector('#result');
const itemList=document.querySelector('#items');
const regime=document.body.dataset.regime;
const regular=regime==='regular';
const example=JSON.parse(document.querySelector('#example-data').textContent);

function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function field(card,name){return card.querySelector(`[name="${name}"]`);}
function clearErrors(){errorBox.hidden=true;errorBox.textContent='';form.querySelectorAll('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));}
function fail(message,element){errorBox.textContent=message;errorBox.hidden=false;if(element){element.setAttribute('aria-invalid','true');element.focus();}errorBox.scrollIntoView({behavior:'smooth',block:'center'});}
function makeOperation(){
 clearErrors();
 try{
  const rows=[...itemList.querySelectorAll('[data-item]')].map(card=>Object.fromEntries([...card.querySelectorAll('input')].map(input=>[input.name,input.value])));
  const id=example.id;
  if(regime==='regular'){
   return buildRegularOperation({dateTime:form.elements.dhFatoGerador.value,timezone:form.elements.fuso.value,uf:form.elements.uf.value,municipio:form.elements.municipio.value.trim()},rows,{id});
  }
  return buildSimplesOperation({data:form.elements.data.value,tpDoc:form.elements.tpDoc.value,CRT:form.elements.CRT.value},rows,{id});
 }catch(e){fail(e.message||'Revise os campos da operação.',e.field?form.querySelector(`[name="${e.field}"]`):null);return null;}
}
function applyExample(){
 const sample=example;
 if(!sample)return;
 [...itemList.querySelectorAll('[data-item]')].slice(1).forEach(card=>card.remove());
 form.reset();clearErrors();
 clearResult();
 document.querySelector('#example-status').textContent='Campos preenchidos com o exemplo fictício.';
 document.querySelector('#jump-result').hidden=false;
 for (const details of itemList.querySelectorAll('details')) details.open=false;
 if(regime==='regular'){
  form.elements.dhFatoGerador.value=sample.dhFatoGerador.slice(0,16);form.elements.fuso.value=sample.dhFatoGerador.slice(-6);form.elements.uf.value=sample.uf;form.elements.municipio.value=String(sample.municipio).padStart(7,'0');
  const first=itemList.querySelector('[data-item]');
  for(const [idx,item] of sample.itens.entries()){
   const card=idx===0?first:cloneItem();
   card.querySelector('.item-title strong').textContent='Item '+(idx+1);
   if(item.ncm)field(card,'ncm').value=item.ncm;if(item.nbs)field(card,'nbs').value=item.nbs;
   for(const k of ['cst','cClassTrib','baseCalculo','quantidade','unidade'])if(item[k]!==undefined)field(card,k).value=String(item[k]);
   for(const k of ['cbs','ibsEstadual','ibsMunicipal'])field(card,k).value=String(item.aliquotasNominais[k]);
   if(item.impostoSeletivo){const is=item.impostoSeletivo;field(card,'isCst').value=is.cst;field(card,'isCClassTrib').value=is.cClassTrib;field(card,'isBase').value=String(is.baseCalculo);field(card,'isInformado').value=String(is.impostoInformado);if(is.quantidade!==undefined)field(card,'isQuantidade').value=String(is.quantidade);if(is.unidade)field(card,'isUnidade').value=is.unidade;field(card,'isAdValorem').value=String(item.aliquotasNominais.impostoSeletivo.adValorem);}
  }
 }else{
  form.elements.data.value=sample.data;form.elements.tpDoc.value=sample.tpDoc;form.elements.CRT.value=sample.CRT;
  const item=sample.itens[0];for(const k of ['cAtivSN','cClassTrib','baseCalculo','valorImpostoSeletivo','pIBSSN','pCBSSN'])if(item[k]!==undefined)field(itemList.querySelector('[data-item]'),k).value=String(item[k]);
 }
}
function cloneItem(){
 if(itemList.querySelectorAll('[data-item]').length>=20){fail('O motor aceita no máximo 20 itens por operação.');return null;}
 const first=itemList.querySelector('[data-item]');const copy=first.cloneNode(true);copy.querySelectorAll('input').forEach(i=>{i.value='';i.removeAttribute('aria-invalid');});copy.querySelector('.item-title strong').textContent='Item '+(itemList.querySelectorAll('[data-item]').length+1);copy.querySelector('.remove-item').hidden=false;itemList.append(copy);return copy;
}
// Resultados verificados no teste de integração com os motores oficiais.
 // PR #24, e2e.test.mjs, GitHub Actions 45525472085.
const verified = {
 regular: {
  states: ['Cálculo simulado', 'Cálculo simulado', 'Cálculo simulado', 'Inconsistência de entrada'],
  itemMetrics: {3: [['IBS', 0.48], ['CBS', 42.24]]},
  totals: [['IBS', 0.64], ['CBS', 56.76], ['Imposto Seletivo', 15]],
 },
 simples: {
  states: ['Calculado no teste'],
  itemMetrics: {1: [['IBS do Simples', 11.88], ['CBS do Simples', 26.12], ['Total do item', 88]]},
  totals: [['Total de tributos do exemplo', 88]],
 },
};

function clearResult() {
 result.hidden=true;
 result.replaceChildren();
}

function canonical(value) {
 if (Array.isArray(value)) return value.map(canonical);
 if (value && typeof value==='object') {
  return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 }
 return value;
}

const exampleOperation = structuredClone(example);
if (!regular) {
 for (const item of exampleOperation.itens) {
  for (const key of ['baseCalculo','valorImpostoSeletivo','pIBSSN','pCBSSN']) {
   if (key in item) item[key]=Number(item[key]);
  }
 }
}
const canonicalExample = JSON.stringify(canonical(exampleOperation));
const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});

function metricsHtml(metrics, gridClass, metricClass) {
 return `<div class="${gridClass}">${metrics.map(([label,value])=>
  `<div class="${metricClass}"><span>${esc(label)}</span><strong>${esc(money.format(value))}</strong></div>`).join('')}</div>`;
}

function showExample() {
 const {states,itemMetrics,totals}=verified[regime];
 const summary=regular
  ? 'O item 4 apresentou inconsistência no teste. Os totais são parciais e não devem ser usados como resultado da operação.'
  : 'Estes valores foram conferidos no teste com a operação fictícia. A prévia apenas exibe o resultado registrado.';
 const items=states.map((state,index)=>{
  const number=index+1;
  const details=itemMetrics[number] ? metricsHtml(itemMetrics[number],'result-metrics','metric') : '';
  return `<article class="result-item"><div class="result-item-head"><strong>Item ${number}</strong><span class="status-pill ${regular && number===4 ? 'error' : 'good'}">${esc(state)}</span></div>${details}</article>`;
 }).join('');
 result.innerHTML=`<div class="result-heading"><div><h2>Resultado do exemplo fictício</h2><p>${regular ? 'Regime regular' : 'Simples Nacional'}</p></div><span class="status-pill partial">Demonstração</span></div>
  <div class="result-banner ${regular?'problem':'simulated'}">${summary}</div>
  <div class="result-items">${items}</div>
  <div class="total-panel"><h3>${regular?'Totais parciais do exemplo':'Totais do exemplo'}</h3>${metricsHtml(totals,'totals-grid','total')}</div>
  <details class="memory"><summary>Ver dados do exemplo validado</summary><pre>${esc(JSON.stringify(example,null,2))}</pre></details>`;
 result.hidden=false;
 result.focus({preventScroll:true});
 result.scrollIntoView({block:'start'});
}

document.querySelector('#load-example').addEventListener('click',applyExample);
document.querySelector('#add-item')?.addEventListener('click',()=>{
 if (cloneItem()) clearResult();
});
itemList.addEventListener('click',e=>{
 if (!e.target.matches('.remove-item')) return;
 e.target.closest('[data-item]').remove();
 [...itemList.querySelectorAll('[data-item]')].forEach((card,i)=>card.querySelector('.item-title strong').textContent='Item '+(i+1));
 clearResult();
});
form.addEventListener('input',clearResult);
form.addEventListener('submit',e=>{
 e.preventDefault();
 clearResult();
 const operation=makeOperation();
 if (!operation) return;
 const extraUnit=[...itemList.querySelectorAll('[data-item]')].some(card=>
  (field(card,'unidade')?.value.trim() && !field(card,'quantidade').value) ||
  (field(card,'isUnidade')?.value.trim() && !field(card,'isQuantidade').value)
 );
 if (extraUnit || JSON.stringify(canonical(operation))!==canonicalExample) {
  fail('Esta prévia só mostra o resultado do exemplo validado. Para restaurar os dados, use “Preencher exemplo fictício” no início do formulário.');
  return;
 }
 showExample();
});
