# FC-035 | Calculadora da Reforma Tributária: laboratório isolado

**Estado em 24/11/2026:** motor oficial do regime regular comprovadamente executado com Java 25 em ambiente isolado. Nenhuma calculadora pública no site. A pasta histórica ainda chama fc-030; na planilha oficial a tarefa é FC-035, já que FC-030 se refere ao relatório mensal.

## Resultado confirmado

- [GitHub Actions #45496118616](https://github.com/henriquesilvaweb/fiscal-comply/actions/runs/45496118616): sucesso. Java 25, migração Flyway/SQLite e API oficial.
- Suíte oficial: **1.314 testes**, zero falhas, zero erros e dez ignorados.
- Exemplo oficial da Receita: HTTP 200, três itens `CALCULO_SIMULADO` e um `INCONSISTENCIA_ENTRADA`.
- Terceiro item (exemplo): IBS R$ 0,48 e CBS R$ 42,24. Totais: IBS R$ 0,64, CBS R$ 56,76 e IS R$ 15,00. Não são alíquotas universais.
- [Evidência permanente no Drive](https://drive.google.com/file/d/18i-XzmgWlCQFrcJhaBfE32Ix8IKnG8hd/view) contém entrada, saída e relatórios de testes.

## Laboratório de interface

[Pacote local v2](https://drive.google.com/file/d/18lzmXafBY9Jq-X43TKGjkuyRw2tDjITY/view): interface experimental, gateway Node só para localhost e 12 testes Node com respostas simuladas (mocks). Não comprova valores reais nem permite publicação pública sem ajustes.

## Próximos testes

- [Regime regular: verificação numérica estrita](../../.github/workflows/fc030-rtc-engine.yml). O primeiro teste estrito falhou por erro de leitura do campo no próprio teste. Corrigido em eb56bce70146377f6d74b8ce4e051db04eaeae15; conferir resultado da nova execução.
- [Simples Nacional: motor separado](../../.github/workflows/fc035-rtc-simples.yml). Usa Java 25, scripts oficiais de migração e testes Maven; conferir a execução antes de declarar aprovado.

## Antes de qualquer publicação

Conferir os dois testes, integrar interface e API com segurança e infraestrutura adequada, submeter casos e regras à revisão de Ana e José Carlos, avaliar custo/atualização/privacidade, obter aprovação de produção. Não misturar dados dos clientes com testes.

Fontes: [Receita regime regular](https://github.com/ReceitaFederal/calculadora-rtc-regime-regular), [Receita Simples Nacional](https://github.com/ReceitaFederal/calculadora-rtc-simples-nacional). Licença MIT com preservação dos avisos.
