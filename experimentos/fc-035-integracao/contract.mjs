function error(message,field){const e=new Error(message);e.field=field;return e;}
function value(fields,name){return String(fields[name]??'').trim();}
function number(fields,name,{optional=false}={}){
 const raw=value(fields,name);if(!raw&&optional)return undefined;
 const parsed=Number(raw);if(!raw||!Number.isFinite(parsed)||parsed<0)throw error(`Informe um valor válido para ${name}.`,name);
 return parsed;
}
function assertItems(items){if(!Array.isArray(items)||items.length<1||items.length>20)throw error('A operação precisa ter de 1 a 20 itens.');}

export function buildRegularOperation(header,rows,{id}={}){
 assertItems(rows);
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(header.dateTime||''))throw error('Informe a data e hora do fato gerador.','dhFatoGerador');
 if(!/^[-+]\d{2}:\d{2}$/.test(header.timezone||''))throw error('Informe o fuso horário da operação.','fuso');
 if(!/^[A-Z]{2}$/.test(header.uf||''))throw error('Selecione a UF da operação.','uf');
 if(!/^\d{7}$/.test(String(header.municipio||'')))throw error('O código do município deve ter sete dígitos.','municipio');
 const itens=rows.map((fields,index)=>{
  const ncm=value(fields,'ncm'),nbs=value(fields,'nbs');
  if(Boolean(ncm)===Boolean(nbs))throw error(`No item ${index+1}, informe NCM ou NBS, mas não os dois.`,ncm?'nbs':'ncm');
  if(ncm&&!/^\d{8}$/.test(ncm))throw error(`Revise o NCM do item ${index+1}.`,'ncm');
  if(nbs&&!/^\d{9}$/.test(nbs))throw error(`Revise o NBS do item ${index+1}.`,'nbs');
  const cst=value(fields,'cst'),cClassTrib=value(fields,'cClassTrib');
  if(!cst)throw error(`Informe o CST do item ${index+1}.`,'cst');
  if(!cClassTrib)throw error(`Informe o cClassTrib do item ${index+1}.`,'cClassTrib');
  const baseCalculo=number(fields,'baseCalculo',{optional:true});
  const quantidade=number(fields,'quantidade',{optional:true});
  if(baseCalculo===undefined&&quantidade===undefined)throw error(`Informe a base de cálculo ou a quantidade do item ${index+1}.`,'baseCalculo');
  if(quantidade!==undefined&&!value(fields,'unidade'))throw error(`Informe a unidade do item ${index+1}.`,'unidade');
  const aliquotasNominais={cbs:number(fields,'cbs'),ibsEstadual:number(fields,'ibsEstadual'),ibsMunicipal:number(fields,'ibsMunicipal')};
  const item={numero:index+1,cst,cClassTrib,aliquotasNominais};
  if(ncm)item.ncm=ncm;if(nbs)item.nbs=nbs;
  if(baseCalculo!==undefined)item.baseCalculo=baseCalculo;
  if(quantidade!==undefined){item.quantidade=quantidade;item.unidade=value(fields,'unidade');}
  const isFields=['isCst','isCClassTrib','isBase','isQuantidade','isUnidade','isInformado','isAdValorem'];
  if(isFields.some(key=>value(fields,key))){
   for(const key of ['isCst','isCClassTrib','isBase','isInformado','isAdValorem'])if(!value(fields,key))throw error(`Complete os dados do Imposto Seletivo do item ${index+1} ou deixe todos em branco.`,key);
   const is={cst:value(fields,'isCst'),cClassTrib:value(fields,'isCClassTrib'),baseCalculo:number(fields,'isBase'),impostoInformado:number(fields,'isInformado')};
   const isQuantity=number(fields,'isQuantidade',{optional:true});
   if(isQuantity!==undefined&&!value(fields,'isUnidade'))throw error('Informe a unidade do Imposto Seletivo.','isUnidade');
   if(isQuantity!==undefined){is.quantidade=isQuantity;is.unidade=value(fields,'isUnidade');}
   item.impostoSeletivo=is;aliquotasNominais.impostoSeletivo={adValorem:number(fields,'isAdValorem')};
  }
  return item;
 });
 return {id,versao:'1.0.0',dhFatoGerador:`${header.dateTime}:00${header.timezone}`,municipio:Number(header.municipio),uf:header.uf,itens};
}

export function buildSimplesOperation(header,rows,{id}={}){
 assertItems(rows);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(header.data||''))throw error('Informe a data da operação.','data');
 const tpDoc=value(header,'tpDoc'),CRT=value(header,'CRT');
 if(!tpDoc)throw error('Informe o tipo de documento fiscal.','tpDoc');
 if(CRT!=='1')throw error('Selecione o CRT do Simples Nacional.','CRT');
 const itens=rows.map((fields,index)=>{
  const cAtivSN=value(fields,'cAtivSN'),cClassTrib=value(fields,'cClassTrib');
  if(!cAtivSN)throw error(`Informe cAtivSN do item ${index+1}.`,'cAtivSN');
  if(!cClassTrib)throw error(`Informe cClassTrib do item ${index+1}.`,'cClassTrib');
  const item={numero:index+1,cAtivSN,cClassTrib,baseCalculo:number(fields,'baseCalculo'),pIBSSN:number(fields,'pIBSSN'),pCBSSN:number(fields,'pCBSSN')};
  const selective=number(fields,'valorImpostoSeletivo',{optional:true});if(selective!==undefined)item.valorImpostoSeletivo=selective;
  return item;
 });
 return {id,versao:'2.0.0',data:header.data,tpDoc,CRT,itens};
}
