import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const HOST='127.0.0.1';
const allowed={
 '/api/regular':'http://127.0.0.1:8080/api/calculadora/observabilidade/regime-geral',
 '/api/simples':'http://127.0.0.1:8082/api/calculadora/observabilidade/simples-nacional'
};
function write(res,status,data){
 res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
 res.end(JSON.stringify(data));
}
export function createLabGateway({fetchImpl=fetch}={}){
 return createServer(async(req,res)=>{
  const path=new URL(req.url||'/', 'http://127.0.0.1').pathname;
  const assets={'/':'index.html','/simples.html':'simples.html','/app.js':'app.js','/contract.mjs':'contract.mjs','/style.css':'style.css'};
  if(req.method==='GET' && Object.hasOwn(assets,path)){
   const filename=assets[path];
   try{
    const content=await readFile(join(dir,filename));
    const type=filename.endsWith('.css')?'text/css; charset=utf-8':/\.m?js$/.test(filename)?'text/javascript; charset=utf-8':'text/html; charset=utf-8';
    res.writeHead(200,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(content);
   }catch{write(res,500,{erro:'Não foi possível abrir interface do laboratório.'});}
   return;
  }
  if(req.method==='GET' && path==='/health'){write(res,200,{ambiente:'laboratorio-local',publico:false});return;}
  if(req.method!=='POST'||!allowed[path]){write(res,404,{erro:'Rota indisponível.'});return;}
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')){write(res,415,{erro:'Use JSON.'});return;}
  let size=0;const buffers=[];
  try{for await(const b of req){size+=b.length;if(size>32768){write(res,413,{erro:'Entrada excede 32KiB.'});return;}buffers.push(b);}}
  catch{if(!res.writableEnded)write(res,400,{erro:'Não foi possível ler requisição.'});return;}
  let op;
  try{op=JSON.parse(Buffer.concat(buffers).toString('utf8'));}
  catch{write(res,400,{erro:'JSON inválido.'});return;}
  if(!op||typeof op!=='object'||Array.isArray(op)||!Array.isArray(op.itens)||op.itens.length===0||op.itens.length>20){
   write(res,422,{erro:'Operação exige entre 1 e 20 itens.'});return;
  }
  if(path==='/api/regular'&&(!op.dhFatoGerador||!op.uf||!op.municipio)){
   write(res,422,{erro:'Regime regular exige data, UF e município.'});return;
  }
  if(path==='/api/simples'&&(!op.data||!op.tpDoc||!op.CRT)){
   write(res,422,{erro:'Simples exige data, tipo de documento e CRT.'});return;
  }
  try{
   const response=await fetchImpl(allowed[path],{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(op),signal:AbortSignal.timeout(20000)});
   const body=await response.text();
   if(body.length>2000000){write(res,502,{erro:'Resposta excede limite.'});return;}
   let result;try{result=JSON.parse(body);}catch{write(res,502,{erro:'Motor devolveu resposta inválida.'});return;}
   if(!response.ok){write(res,502,{erro:'Motor recusou a operação.',statusMotor:response.status});return;}
   if(!Array.isArray(result.objetos)||result.objetos.length!==op.itens.length){
    write(res,502,{erro:'Formato de resposta inesperado.'});return;
   }
   const estados=result.objetos.map(o=>o.estadoItem);
   const okStates=new Set(['CALCULADO','CALCULO_SIMULADO','INCONSISTENCIA_ENTRADA','NAO_IMPLEMENTADO','FALHA_TECNICA','NAO_CALCULADO']);
   if(!estados.every(s=>okStates.has(s))){write(res,502,{erro:'Estado inesperado.'});return;}
   write(res,200,{fonte:'API oficial executada localmente',regime:path==='/api/simples'?'simples':'regular',estados,parcial:estados.some(s=>!['CALCULADO','CALCULO_SIMULADO'].includes(s)),resultado:result});
  }catch(e){write(res,503,{erro:'API local indisponível; nenhum cálculo retornado.',tipo:e.name==='TimeoutError'?'timeout':'conexao'});}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 createLabGateway().listen(8787,HOST,()=>console.log('Laboratório FC-035: http://127.0.0.1:8787 (somente local)'));
}
