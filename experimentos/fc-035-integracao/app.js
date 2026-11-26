import {buildRegularOperation,buildSimplesOperation} from './contract.mjs';
const form=document.querySelector('#calc-form');
const errorBox=document.querySelector('#form-error');
const result=document.querySelector('#result');
const itemList=document.querySelector('#items');
const regime=document.body.dataset.regime;
const regularNames=['vIBS','vCBS','vIBSSN','vCBSSN','vIS','totalTributos','totalItem'];
const labels={vIBS:'IBS',vCBS:'CBS',vIBSSN:'IBS do Simples',vCBSSN:'CBS do Simples',vIS:'Imposto Seletivo',totalTributos:'Total de tributos',totalItem:'Total do item'};
const example=JSON.parse(document.querySelector('#example-data').textContent);

function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function field(card,name){return card.querySelector(`[name="${name}"]`);}
function clearErrors(){errorBox.hidden=true;errorBox.textContent='';form.querySelectorAll('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));}
function fail(message,element){errorBox.textContent=message;errorBox.hidden=false;if(element){element.setAttribute('aria-invalid','true');element.focus();}errorBox.scrollIntoView({behavior:'smooth',block:'center'});}
function makeOperation(){
 clearErrors();
 try{
  const rows=[...itemList.querySelectorAll('[data-item]')].map(card=>Object.fromEntries([...card.querySelectorAll('input')].map(input=>[input.name,input.value])));
  const id=crypto.randomUUID().replaceAll('-','');
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
 if(regime==='regular'){
  form.elements.dhFatoGerador.value='2027-03-10T10:00';form.elements.fuso.value=sample.dhFatoGerador.slice(-6);form.elements.uf.value=sample.uf;form.elements.municipio.value=String(sample.municipio).padStart(7,'0');
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
function money(value){const n=Number(value);return Number.isFinite(n)?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n):null;}
function collectMetrics(value,out=[],path=[]){
 if(!value||typeof value!=='object')return out;
 for(const [key,v] of Object.entries(value)){
  if(v&&typeof v==='object'){collectMetrics(v,out,[...path,key]);continue;}
  if(regularNames.includes(key)&&v!==null&&v!==''&&Number.isFinite(Number(v)))out.push({key,label:labels[key]||key,value:v,path});
 }
 return out;
}
function reasonText(item){
 const matches=[];for(const [k,v] of Object.entries(item||{})){if(/mensagem|motivo|erro|inconsist|detalhe/i.test(k)&&typeof v==='string'&&v.trim())matches.push(v);}
 return matches;
}
function itemHtml(item,index){
 const state=item?.estadoItem||'ESTADO NÃO INFORMADO';const good=['CALCULADO','CALCULO_SIMULADO'].includes(state);
 const metrics=collectMetrics(item?.tribCalc||{});
 const body=metrics.length?`<div class="result-metrics">${metrics.map(m=>`<div class="metric"><span>${esc(m.label)}</span><strong>${esc(money(m.value)||m.value)}</strong></div>`).join('')}</div>`:'<p class="item-message">O motor não retornou valores tributários para este item.</p>';
 const reasons=reasonText(item).map(x=>`<p class="item-message">${esc(x)}</p>`).join('');
 return `<article class="result-item"><div class="result-item-head"><strong>Item ${index+1}</strong><span class="status-pill ${good?'good':'error'}">${esc(state.replaceAll('_',' '))}</span></div>${body}${reasons}</article>`;
}
function totalsHtml(data,states=[]){
 if(!data?.total)return '';
 const metrics=collectMetrics(data.total).filter(x=>['vIBS','vCBS','vIBSSN','vCBSSN','vIS','totalTributos'].includes(x.key));
 if(!metrics.length)return '';
 return `<div class="total-panel"><h3>${states.length&&states.every(s=>['CALCULADO','CALCULO_SIMULADO'].includes(s))?'Totais retornados pelo motor':'Totais retornados (podem excluir itens com erro)'}</h3><div class="totals-grid">${metrics.map(m=>`<div class="total"><span>${esc(m.label)}</span><strong>${esc(money(m.value)||m.value)}</strong></div>`).join('')}</div></div>`;
}
function showResult(data){
 const states=data.estados||[];const simulated=states.includes('CALCULO_SIMULADO');const partial=states.some(s=>!['CALCULADO','CALCULO_SIMULADO'].includes(s));
 const title=partial?'Resultado parcial':simulated?'Simulação técnica concluída':'Cálculo retornado pelo motor';
 const pill=partial?'<span class="status-pill partial">Revisar itens</span>':simulated?'<span class="status-pill partial">Valor simulado</span>':'<span class="status-pill good">Itens calculados</span>';
 const banner=partial?'<div class="result-banner problem"><strong>Não use estes totais como resultado da operação.</strong> Um ou mais itens retornaram inconsistência, falha ou estado não calculado. Confira os detalhes e corrija a classificação antes de tentar novamente.</div>':simulated?'<div class="result-banner simulated"><strong>Valores simulados para demonstração.</strong> A resposta é do motor oficial, mas ainda depende de conferência das regras, códigos e dados informados por um profissional.</div>':'<div class="result-banner ok"><strong>Resposta do motor recebida.</strong> Confira os dados e a memória de cálculo com um profissional antes de qualquer uso fiscal.</div>';
 result.innerHTML=`<div class="result-heading"><div><h2>${title}</h2><p>Motor ${regime==='regular'?'do regime regular':'do Simples Nacional'} • resposta recebida em ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p></div>${pill}</div>${banner}<div class="result-items">${(data.resultado?.objetos||[]).map(itemHtml).join('')}</div>${totalsHtml(data.resultado,states)}<p class="result-footnote">O motor da Receita processa cada item individualmente. Uma resposta HTTP bem-sucedida não significa que todos os itens foram calculados.</p><details class="memory"><summary>Ver memória de cálculo e resposta técnica</summary><pre>${esc(JSON.stringify(data.resultado,null,2))}</pre></details>`;
 result.hidden=false;result.setAttribute('aria-busy','false');result.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelector('#load-example').addEventListener('click',applyExample);
document.querySelector('#add-item')?.addEventListener('click',cloneItem);
itemList.addEventListener('click',e=>{if(e.target.matches('.remove-item')){e.target.closest('[data-item]').remove();[...itemList.querySelectorAll('[data-item]')].forEach((card,i)=>card.querySelector('.item-title strong').textContent='Item '+(i+1));}});
form.addEventListener('submit',async e=>{
 e.preventDefault();const operation=makeOperation();if(!operation)return;
 const button=document.querySelector('#run');button.disabled=true;button.textContent='Consultando motor...';result.hidden=true;result.setAttribute('aria-busy','true');
 try{const response=await fetch(regime==='regular'?'/api/regular':'/api/simples',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(operation)});const data=await response.json();if(!response.ok){fail(data.erro||'Não foi possível consultar o motor. Nenhum resultado foi calculado.');return;}showResult(data);}
 catch{fail('O motor oficial local está indisponível. Nenhum resultado foi calculado. Tente novamente quando o laboratório estiver ativo.');}
 finally{button.disabled=false;button.innerHTML='Simular operação <span aria-hidden="true">→</span>';result.setAttribute('aria-busy','false');}
});
