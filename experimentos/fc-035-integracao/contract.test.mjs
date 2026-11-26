import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildRegularOperation,buildSimplesOperation} from './contract.mjs';

async function sample(path){
 const html=await readFile(new URL(path,import.meta.url),'utf8');
 const match=html.match(/<script id="example-data" type="application\/json">([^<]+)<\/script>/);
 assert.ok(match,'amostra JSON da interface disponível');return JSON.parse(match[1]);
}
function regularFields(item){
 return {ncm:item.ncm||'',nbs:item.nbs||'',cst:item.cst,cClassTrib:item.cClassTrib,baseCalculo:item.baseCalculo??'',quantidade:item.quantidade??'',unidade:item.unidade||'',cbs:item.aliquotasNominais.cbs,ibsEstadual:item.aliquotasNominais.ibsEstadual,ibsMunicipal:item.aliquotasNominais.ibsMunicipal,isCst:item.impostoSeletivo?.cst||'',isCClassTrib:item.impostoSeletivo?.cClassTrib||'',isBase:item.impostoSeletivo?.baseCalculo??'',isQuantidade:item.impostoSeletivo?.quantidade??'',isUnidade:item.impostoSeletivo?.unidade||'',isInformado:item.impostoSeletivo?.impostoInformado??'',isAdValorem:item.aliquotasNominais.impostoSeletivo?.adValorem??''};
}
test('formulário do regime regular monta o contrato da amostra oficial sem alterar códigos ou fuso',async()=>{
 const example=await sample('./index.html');
 const operation=buildRegularOperation({dateTime:example.dhFatoGerador.slice(0,16),timezone:example.dhFatoGerador.slice(-6),uf:example.uf,municipio:String(example.municipio) },example.itens.map(regularFields),{id:example.id});
 assert.deepEqual(operation,example);
});
test('formulário do Simples monta o contrato oficial e preserva zeros à esquerda dos códigos',async()=>{
 const example=await sample('./simples.html');const item=example.itens[0];
 const operation=buildSimplesOperation({data:example.data,tpDoc:example.tpDoc,CRT:example.CRT},[{cAtivSN:item.cAtivSN,cClassTrib:item.cClassTrib,baseCalculo:item.baseCalculo,valorImpostoSeletivo:item.valorImpostoSeletivo,pIBSSN:item.pIBSSN,pCBSSN:item.pCBSSN}],{id:example.id});
 assert.equal(operation.itens[0].cClassTrib,'000001');assert.equal(operation.itens[0].cAtivSN,'01');
 assert.equal(operation.itens[0].baseCalculo,950);assert.equal(operation.itens[0].pIBSSN,1.25);assert.equal(operation.itens[0].pCBSSN,2.75);assert.equal(operation.itens[0].valorImpostoSeletivo,50);
});
test('contrato impede classificação faltando, NCM/NBS conflitantes e ausência de valores',()=>{
 const row={ncm:'10063021',nbs:'122011200',cst:'200',cClassTrib:'200003',baseCalculo:100,cbs:8.8,ibsEstadual:0.05,ibsMunicipal:0.05};
 assert.throws(()=>buildRegularOperation({dateTime:'2027-03-10T10:00',timezone:'-03:00',uf:'SP',municipio:'3550308'},[row]),/informe NCM ou NBS/);
 assert.throws(()=>buildRegularOperation({dateTime:'2027-03-10T10:00',timezone:'-03:00',uf:'SP',municipio:'3550308'},[{...row,nbs:'',cClassTrib:''}]),/cClassTrib/);
 assert.throws(()=>buildSimplesOperation({data:'2027-03-15',tpDoc:'55',CRT:'1'},[{cAtivSN:'01',cClassTrib:'000001',baseCalculo:'',pIBSSN:1,pCBSSN:2}]),/baseCalculo/);
});
