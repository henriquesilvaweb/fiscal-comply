# FC-030 | Laboratório da Calculadora da Reforma Tributária

Status: prova de conceito técnica **isolada e não publicada no site** (24/11/2026).

O pacote executável contém uma página de laboratório para validar o formato de entrada e interpretar os estados da API oficial da Receita, com seis testes automatizados de contrato. **Não calcula IBS, CBS ou IS**: o motor oficial Java 25 ainda não foi executado e nenhum resultado deve ser apresentado ao usuário como cálculo tributário.

Pacote de código (Google Drive): https://drive.google.com/file/d/1aEYv78-sEbz39NgKRtxKMP7YRwEf1HYv/view
Manual: https://docs.google.com/document/d/1qYoEUTUD9Y7McNW_X4izkywSwumKyJqKDIqx8vNpGDE/edit

## Fonte oficial verificada

- https://github.com/ReceitaFederal/calculadora-rtc-regime-regular
- https://github.com/ReceitaFederal/calculadora-rtc-simples-nacional
- Exemplo de contrato: https://github.com/ReceitaFederal/calculadora-rtc-regime-regular/blob/main/docs/exemplos.md
- Licença MIT: preservar os avisos originais quando código oficial for reutilizado.

## Validação realizada

- 6/6 testes Node passaram no guardião de formato e interpretação de respostas.
- Ambiente disponível tem Java 21, mas a Receita exige Java 25.
- Clone direto bloqueado por indisponibilidade de resolução DNS; não houve execução dos testes Maven, geração de banco ou chamadas ao backend.

## Próxima etapa

Executar motor oficial em ambiente Java 25, criar banco SQLite com Flyway, testar API de observabilidade usando JSON da Receita, comparar resposta com documentação e somente então desenvolver interface pública. Exige revisão da dona Ana e avaliação de infraestrutura antes do deploy.
