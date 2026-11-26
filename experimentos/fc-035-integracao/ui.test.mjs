import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createLabGateway} from './gateway.mjs';

let server,base,calls=[];
const regularResult={objetos:[{estadoItem:'CALCULO_SIMULADO',tribCalc:{IBSCBS:{gIBSCBS:{vIBS:0.48,gCBS:{vCBS:42.24}}}}}],total:{tribCalc:{IBSCBSTot:{gIBS:{vIBS:0.64},gCBS:{vCBS:56.76}},ISTot:{vIS:15}}}};
const simplesResult={objetos:[{estadoItem:'CALCULADO',tribCalc:{vIBSSN:11.88,vCBSSN:26.12,totalItem:88}}],total:{vIBSSNtot:11.88,vCBSSNtot:26.12,totalTributos:88}};
before(async()=>{
 const fetchImpl=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});const body=String(url).includes(':8082')?simplesResult:regularResult;return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json'}});};
 server=createLabGateway({fetchImpl});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
});
after(()=>new Promise(resolve=>server.close(resolve)));
const regular={dhFatoGerador:'2027-03-10T10:00:00-03:00',uf:'SP',municipio:3550308,itens:[{numero:1,cst:'200',cClassTrib:'200003',ncm:'10063021',baseCalculo:100,aliquotasNominais:{cbs:8.8,ibsEstadual:0.05,ibsMunicipal:0.05}}]};
const simples={data:'2027-03-15',tpDoc:'55',CRT:'1',itens:[{numero:1,cAtivSN:'01',cClassTrib:'000001',baseCalculo:950,pIBSSN:1.25,pCBSSN:2.75}]};
async function get(path){return fetch(base+path);}
async function post(path,payload,contentType='application/json'){return fetch(base+path,{method:'POST',headers:{'content-type':contentType},body:JSON.stringify(payload)});}

test('páginas mostram formulários separados, amostras oficiais e aviso de validação',async()=>{
 const [regularPage,simplePage]=await Promise.all([get('/'),get('/simples.html')]);
 assert.equal(regularPage.status,200);assert.equal(simplePage.status,200);
 const regularHtml=await regularPage.text(),simpleHtml=await simplePage.text();
 assert.match(regularHtml,/name="cClassTrib"/);assert.match(regularHtml,/name="ibsEstadual"/);assert.match(regularHtml,/id="example-data"/);assert.match(regularHtml,/Calculadora em validação/);assert.doesNotMatch(regularHtml,/<textarea/i);
 assert.match(simpleHtml,/name="cAtivSN"/);assert.match(simpleHtml,/name="pIBSSN"/);assert.match(simpleHtml,/Simples Nacional/);assert.match(simpleHtml,/id="example-data"/);assert.doesNotMatch(simpleHtml,/<textarea/i);
});
test('arquivos da interface têm tipos corretos e política sem script inline',async()=>{
 for(const [path,type] of [['/app.js','text/javascript'],['/contract.mjs','text/javascript'],['/style.css','text/css']]){const response=await get(path);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),new RegExp(type));}
 const response=await get('/');assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);assert.doesNotMatch(response.headers.get('content-security-policy'),/unsafe-inline/);assert.equal(response.headers.get('cache-control'),'no-store');
});
test('gateway envia contratos separados aos endpoints oficiais e marca simulação',async()=>{
 calls=[];
 const a=await post('/api/regular',regular);assert.equal(a.status,200);const ar=await a.json();assert.deepEqual(calls[0].url,'http://127.0.0.1:8080/api/calculadora/observabilidade/regime-geral');assert.deepEqual(ar.estados,['CALCULO_SIMULADO']);assert.equal(ar.parcial,false);
 const b=await post('/api/simples',simples);assert.equal(b.status,200);const br=await b.json();assert.equal(calls[1].url,'http://127.0.0.1:8082/api/calculadora/observabilidade/simples-nacional');assert.deepEqual(br.estados,['CALCULADO']);
});
test('recusa entradas inválidas e não chama os motores',async()=>{
 calls=[];
 let response=await post('/api/regular',{...regular,itens:[]});assert.equal(response.status,422);
 response=await post('/api/regular',regular,'text/plain');assert.equal(response.status,415);
 response=await post('/api/regular',{...regular,itens:Array(21).fill(regular.itens[0])});assert.equal(response.status,422);
 assert.equal(calls.length,0);
});
test('não expõe rotas arbitrárias',async()=>{
 const unknown=await post('/api/admin',{});assert.equal(unknown.status,404);
});
