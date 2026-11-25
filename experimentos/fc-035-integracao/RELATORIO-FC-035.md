# FC-035 | Calculadora da Reforma Tributária

**Atualização:** 25/11/2026  
**Estado:** demonstração funcional em revisão, isolada do site público  
**PR anterior:** [#24, laboratório RTC](https://github.com/henriquesilvaweb/fiscal-comply/pull/24)

## O que mudou nesta etapa

- A interface de JSON foi trocada por formulários para regime regular e Simples Nacional, em telas separadas.
- O formulário monta os contratos JSON documentados pelos motores, preserva zeros à esquerda dos códigos tributários e inclui NCM/NBS, CST, cClassTrib, cAtivSN, bases, quantidades, unidades e campos do Imposto Seletivo que aparecem no contrato oficial.
- Os percentuais não recebem valores padrão. O usuário precisa informá-los conforme o cenário e confirmar a classificação com o contador. A ferramenta não escolhe a classificação fiscal da empresa.
- A memória de cálculo fica recolhida em uma seção de detalhes. Estados por item são mostrados separadamente. Resultado com inconsistência, falha, item não implementado ou não calculado é marcado como parcial; o aviso diz para não usar seus totais como resultado da operação.
- Amostras de desenvolvimento são identificadas como fictícias e não como taxas universais.
- O gateway continua limitado a `127.0.0.1`, possui rotas permitidas explícitas, limite de 32 KiB, limite de vinte itens, timeout e não grava o corpo das requisições. A interface usa CSP sem `unsafe-inline`, respostas sem cache, `nosniff` e `no-referrer`.
- Nenhum arquivo comercial, preço ou página publicada da Fiscal Comply foi alterado. Nenhum dado de cliente foi usado.

## Contratos e limites

O motor regular recebe operações com data/hora e fuso, município IBGE, UF e itens classificados. O motor Simples é uma integração separada e recebe a data, o tipo de documento, CRT e dados próprios de atividade e classificação. O gateway envia cada regime somente ao endpoint de observabilidade correspondente, em serviço local.

Os códigos e percentuais enviados fazem parte da operação de entrada; a interface não consulta uma tabela para decidir o que se aplica ao contribuinte. As respostas podem informar estados por item e retornar HTTP 200 mesmo quando um item tem inconsistência. O total retornado pode excluir itens inválidos. Por isso, o estado por item é mais importante que o status HTTP.

Os motores abertos não são propriedade, certificação ou endosso da Fiscal Comply. Não se promete cálculo completo de carga da empresa, PGDAS-D, folha, imposto de renda, emissão fiscal nem economia tributária. Referências: [motor de regime regular](https://github.com/ReceitaFederal/calculadora-rtc-regime-regular) e [motor do Simples Nacional](https://github.com/ReceitaFederal/calculadora-rtc-simples-nacional). Os projetos oficiais indicam licença MIT; os avisos e créditos originais devem acompanhar qualquer distribuição futura. Este laboratório não copia os motores para o site.

## Testes

- **8 testes de contrato e gateway:** passaram no GitHub Actions em 25/11/2026. Os testes verificam a montagem do payload dos formulários contra as amostras, validação dos campos, preservação dos códigos com zero à esquerda, separação dos endpoints, MIME/CSP da interface, rejeição de entrada inválida e ausência de rota arbitrária. As respostas do teste de gateway são mocks e não contam como cálculo tributário.
- **Nova integração com os motores oficiais:** [run 45525089333](https://github.com/henriquesilvaweb/fiscal-comply/actions/runs/45525089333) passou. O runner instalou Java 25, preparou os dois bancos SQLite e iniciou os motores do regime regular e Simples. O teste de contrato e gateway passou 8/8, e a integração por endpoint com exemplos oficiais passou 4/4, zero falhas. Isto confirma o gateway e os exemplos oficiais nesta revisão; o caminho do clique real do formulário no navegador não foi automatizado porque o ambiente bloqueou o acesso gráfico local.
- **Testes oficiais anteriores:** a execução [GitHub Actions 45512127819](https://github.com/henriquesilvaweb/fiscal-comply/actions/runs/45512127819) passou 4/4 testes na versão anterior do laboratório, fazendo interface JSON de exemplo → gateway → ambos os motores oficiais Java 25. Os números conferidos foram amostras técnicas da Receita, não casos de clientes.
- **Inspeção visual em navegador:** não concluída. O navegador remoto recusou a abertura do arquivo e do endereço local e bloqueou contornar a política. Não há evidência de teste visual em celular nesta revisão. As regras CSS responsivas e os campos foram cobertos por inspeção de código e testes de contrato, o que não substitui a revisão gráfica.

## Infraestrutura e custo

- **Demonstração atual:** R$ 0 de serviço recorrente adicional. Os motores e o gateway rodam em ambiente local/CI e não foram implantados.
- **Produção:** o HTML pode continuar estático na hospedagem atual, mas os motores Java 25 e o gateway precisam de um processo de backend disponível, atualizado e monitorado. Não foram aprovados nem contratados serviços pagos.
- **Referência de preço pesquisada:** a tabela pública do Render apresenta serviço web básico de US$ 7/mês com 512 MB e SSD persistente a US$ 0,25 por GB/mês. Um disco de 1 GB elevaria a referência mínima a cerca de **US$ 7,25/mês**, antes de impostos, tráfego ou recursos adicionais. Não foi medido se 512 MB são suficientes para o motor Java; portanto isso é apenas o piso anunciado, não uma cotação de produção. [Render Pricing](https://render.com/pricing)
- **Caminho mais econômico ainda precisa ser medido:** testar memória e tempo em uma máquina compatível, decidir se SQLite fica em disco persistente, estimar backups e definir monitoramento. Não publicar a API em plano que suspenda o serviço sem avaliar tempo de inicialização e indisponibilidade.

## Segurança, privacidade e atualização

No laboratório, os dados fictícios são enviados ao backend local; o gateway não os persiste nem registra o corpo. Antes de aceitar dados de pessoas ou empresas em produção, implementar HTTPS, limite de requisições por IP, limite de tamanho e frequência, CORS restrito, tratamento de abuso, monitoramento sem payload, política de retenção e aviso de privacidade. Não pedir CPF/CNPJ, nome de cliente, credenciais ou anexos enquanto não forem necessários e justificados.

As tabelas, códigos e regras precisam ser associados a uma versão e data de atualização do repositório oficial. Antes de atualizar, comparar a versão oficial, preservar os avisos MIT, rodar as suítes de cada motor e casos de referência, validar uma amostra de cada regime e guardar a versão anterior para retorno. Esta tarefa ainda não automatiza o acompanhamento de atualização de tabelas.

## O que falta antes da publicação

1. Confirmar que a nova execução oficial do workflow passou com os formulários desta branch.
2. Fazer teste visual real em celular e desktop, incluindo erros e resultados parciais.
3. Revisar com Ana e José Carlos a terminologia, os códigos exigidos, as instruções e as amostras de ambos os regimes.
4. Validar a cobertura com operações aprovadas por eles e confirmar quando usar base, quantidade, unidade e Imposto Seletivo.
5. Medir memória, tempo de resposta, armazenamento e custo real de uma hospedagem Java 25; aprovar eventual gasto antes da contratação.
6. Definir monitoramento, proteção contra abuso, atualização/versionamento de tabelas, backup e rotina para falhas.
7. Revisar aviso legal, política de privacidade, acessibilidade e texto de independência em relação à Receita Federal.
8. Só então discutir merge do laboratório e publicação, após aprovação contábil expressa. Esta branch não publica nem altera o site público.
