# FC-030 | Laboratório de integração da Calculadora RTC

**Situação: laboratório v2 testado localmente, não publicado no site.** Atualizado em 24/11/2026.

## Entregas

- Código executável v2: https://drive.google.com/file/d/18lzmXafBY9Jq-X43TKGjkuyRw2tDjITY/view
- Interface responsiva para preparar JSON, validar entrada, interpretar estados e **consultar uma API oficial somente se estiver rodando localmente**.
- Gateway Node local em 127.0.0.1:8787, que encaminha somente à API local em 127.0.0.1:8080. Não expor na internet nem usar dados reais.
- 12 testes automatizados aprovados: 6 do contrato e 6 do gateway usando respostas simuladas (mocks). Os testes NÃO conferem a matemática tributária da Receita.

## Bloqueios honestos

O motor oficial não foi iniciado. O ambiente tem Java 21 e o código exige Java 25; acesso direto ao clone do GitHub está bloqueado por DNS. Por isso ainda não houve migração SQLite, execução Maven nem testes com resposta tributária real.

## Fontes e requisitos

- Código da Receita: https://github.com/ReceitaFederal/calculadora-rtc-regime-regular
- Exemplo: https://github.com/ReceitaFederal/calculadora-rtc-regime-regular/blob/main/docs/exemplos.md
- Simples: https://github.com/ReceitaFederal/calculadora-rtc-simples-nacional
- Licença dos motores: MIT, com preservação dos avisos de copyright.
- Manual do projeto: https://docs.google.com/document/d/1qYoEUTUD9Y7McNW_X4izkywSwumKyJqKDIqx8vNpGDE/edit

## Próxima etapa

Dispor de Java 25 e fonte oficial, gerar banco via Flyway, executar testes Maven e comparar o cálculo com exemplo oficial. Revisar resultados com dona Ana e José Carlos antes de considerar publicação. Este PR não deve ser incorporado à produção nesta fase.
