# Verificações de SEO e medição

## Incluído nesta branch
- `robots.txt` aponta para `sitemap.xml`.
- `sitemap.xml` lista apenas a página inicial, única página HTML neste repositório.
- Canonical com barra final e URL absoluta do logo nos dados estruturados.
- Cliques nos três links principais do WhatsApp enviam `whatsapp_click` ao `dataLayer`, incluindo posição e caminho da página.

## Pendente antes/depois da publicação
- Confirmar quem hospeda e controla as URLs antigas, como `/simples-comply/` e `/consultoria-e-assessoria-contabil/`. Não redirecionar nem excluí-las sem inventário de páginas e tráfego.
- Configurar Google Tag Manager (ou outra integração que consuma `dataLayer`) e um evento GA4 `whatsapp_click`. **Sem essa configuração, nenhum evento é enviado ao GA4.**
- Validar `https://fiscalcomply.com.br/robots.txt` e `https://fiscalcomply.com.br/sitemap.xml` após a publicação, e enviar o sitemap ao Search Console.
- Confirmar os dados institucionais e endereço do JSON-LD com os responsáveis.
- Executar teste mobile, Lighthouse e revisão de imagens. Os arquivos `assets/images/logo.png` e `assets/images/monogram.png` têm tamanho elevado; verificar se são utilizados antes de substituí-los.
- Revisar páginas antigas e decidir se entram em um sitemap expandido ou em redirecionamentos 301 fundamentados.
