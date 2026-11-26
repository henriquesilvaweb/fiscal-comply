import test, {after, before} from 'node:test';
import assert from 'node:assert/strict';
import {createLabGateway} from './gateway.mjs';
let server, base;
before(async()=>{
 server=createLabGateway();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port;
});
after(()=>new Promise(resolve=>server.close(resolve)));
async function exampleFromPage(page){
 const response=await fetch(base+page);
 assert.equal(response.status,200,'interface disponível');
 const html=await response.text();
 assert.match(html,/Ambiente de demonstração/i);
 assert.match(html,/Calculadora em validação/i);
 const m=html.match(/<script id="example-data" type="application\/json">([^<]+)<\/script>/);
 assert.ok(m,'entrada da interface encontrada');
 return JSON.parse(m[1]);
}
async function post(route,payload){
 const resp=await fetch(base+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
 return {status:resp.status,body:await resp.json()};
}
test('interface do regime regular envia operação real e confere exemplo da Receita',async()=>{
 const payload=await exampleFromPage('/');
 const {status,body}=await post('/api/regular',payload);
 assert.equal(status,200,JSON.stringify(body));
 assert.deepEqual(body.estados,['CALCULO_SIMULADO','CALCULO_SIMULADO','CALCULO_SIMULADO','INCONSISTENCIA_ENTRADA']);
 assert.equal(body.parcial,true,'último item inválido, totais são parciais');
 const item=body.resultado.objetos[2].tribCalc.IBSCBS.gIBSCBS;
 assert.equal(Number(item.vIBS),0.48);
 assert.equal(Number(item.gCBS.vCBS),42.24);
 const total=body.resultado.total.tribCalc;
 assert.equal(Number(total.IBSCBSTot.gIBS.vIBS),0.64);
 assert.equal(Number(total.IBSCBSTot.gCBS.vCBS),56.76);
 assert.equal(Number(total.ISTot.vIS),15);
});
test('interface Simples Nacional envia operação real e confere caso oficial',async()=>{
 const payload=await exampleFromPage('/simples.html');
 const {status,body}=await post('/api/simples',payload);
 assert.equal(status,200,JSON.stringify(body));
 assert.deepEqual(body.estados,['CALCULADO']);
 assert.equal(body.parcial,false);
 const item=body.resultado.objetos[0].tribCalc;
 assert.equal(Number(item.vIBSSN),11.88);
 assert.equal(Number(item.vCBSSN),26.12);
 assert.equal(Number(item.totalItem),88);
 assert.equal(Number(body.resultado.total.totalTributos),88);
});
test('entrada inválida é recusada sem acessar motor',async()=>{
 const {status,body}=await post('/api/regular',{itens:[]});
 assert.equal(status,422);assert.ok(body.erro);
});
test('não expõe rotas arbitrárias',async()=>{
 const response=await fetch(base+'/api/alterar',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
 assert.equal(response.status,404);
});
