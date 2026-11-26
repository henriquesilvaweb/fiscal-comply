# FC-035 | Prévia independente

Publique somente os arquivos estáticos desta pasta em um projeto separado da Netlify. A raiz abre o regime regular e o endereço /simples.html abre o Simples Nacional.

Os formulários aceitam edição e só exibem resultados quando os dados correspondem ao exemplo validado do regime. Os valores exibidos foram conferidos no teste e2e.test.mjs do laboratório, no GitHub Actions (run 45525472085). O exemplo do regime regular tem um item inconsistente e os totais são parciais. A prévia funciona sem chamadas de API e sem enviar os dados digitados. O laboratório na pasta fc-035-integracao continua contendo a integração com os motores Java oficiais.

Os testes em Chromium cobriram desktop (1440 px), emulação de iPhone (390 px) e tela estreita (320 px): navegação, formulário vazio, preenchimento, adição e remoção de item, bloqueio de entrada divergente, resultados, dados do exemplo e ausência de transbordamento horizontal.

Projeto de prévia reservado: fiscal-comply-fc035-preview. A confirmação de publicação exige abrir a URL no navegador sem sessão.
