# Revisão editorial e arquitetura do site Fiscal Comply (30/10/2026)

## Objetivo
Ajudar empresários e gestores a identificar o serviço adequado e entrar em contato com clareza. Público prioritário definido em docs/research/target-audience.md: empresas estruturadas, faturamento de referência R$ 100 mil a R$ 200 mil/mês, equipes de 10 a 20 profissionais. Essa faixa é orientação editorial, não condição de atendimento.

## Diagnóstico da home atual
- Seções existentes: hero, público, serviços, processo, diferenciais, sobre, FAQ, contato.
- Diferenciais repetem benefícios genéricos já mencionados em outras seções.
- Descrições dos serviços são resumidas e não respondem perguntas específicas de busca.
- Sócios identificados na seção Sobre; acrescentar qualificações/registro profissional apenas mediante comprovação.
- Depoimentos estão ocultos e não devem ser inventados.
- CTA direciona ao WhatsApp e funciona como contato; não pressupor diagnóstico gratuito ou garantia de economia.

## Nova sequência proposta (sem alterar HTML nesta revisão)
1. Hero com serviço + público + resultado de processo possível, sem garantia.
2. Problemas e necessidades que a consultoria ajuda a avaliar.
3. Grade dos serviços com links para páginas completas.
4. Sobre: pessoas, qualificações verificadas, foto e experiência relevante.
5. Etapas de atendimento (contato, avaliação de escopo, análise, devolutiva/acompanhamento).
6. Perguntas frequentes úteis e contato.
Diferenciais genéricos podem ser integrados às demais seções em vez de ocupar bloco próprio.

## Texto candidato para hero
### H1 recomendado (clareza e intenção de busca)
Consultoria contábil e tributária para empresas em Campinas e em todo o Brasil

### Subtítulo
A Fiscal Comply apoia empresários na organização das rotinas contábeis, na avaliação de riscos fiscais e no planejamento tributário, com orientação próxima e análise responsável.

### CTA
Converse com a Fiscal Comply

### Alternativa de linguagem mais provocativa (validar com sócios)
Sua empresa está pagando os tributos corretamente?
Não insinuar que recolhimentos incorretos sejam regra nem prometer economia.

## Guia de conteúdo das páginas de serviços
Cada página deverá responder, de modo específico:
1. O que o serviço faz e para quem é indicado.
2. Quais situações levam o empresário a buscar auxílio.
3. O que pode ser analisado, sujeito ao escopo combinado.
4. Como funciona o processo e que documentos podem ser solicitados.
5. Dúvidas frequentes e limites do serviço.
6. CTA contextual com mensagem pronta no WhatsApp.

## Páginas prioritárias
- /simples-comply/ (já preparada no PR #2, revisar redação com responsáveis).
- /revisao-de-creditos-tributarios/ (já preparada no PR #2; não confundir com revisão de tributos federais).
- /consultoria-e-assessoria-contabil/ (URL antiga identificada; validar existência e atendimento).
- /planejamento-tributario/ (proposta; confirmar URL canônica antes de criar).
- Créditos previdenciários (confirmar nomenclatura e escopo).

## Provas de confiança que faltam confirmar
- Dados atualizados do endereço e canais de atendimento.
- Registro profissional e qualificações dos responsáveis, quando divulgáveis.
- Exemplos de atuação autorizados, sem divulgar dados de clientes.
- Histórico do domínio e páginas antigas: verificar URLs existentes, evitar 301 sem equivalência.
- Se atendimento nacional e presencial se confirmam.

## Critérios de aceite antes de publicar
- Revisão dos serviços e afirmações tributárias pelos responsáveis.
- Não declarar que haverá redução tributária, recuperação de crédito, auditoria gratuita ou resultado garantido.
- Links funcionais, navegação mobile, títulos e metadados únicos, sitemap atualizado.
- Conteúdo visível e legível sem depender de animações.
- Não incluir Google Analytics nesta fase.

## Próximo passo de implementação
Depois da validação editorial, atualizar index.html preservando estilos existentes e implementar páginas individuais com conteúdo específico; verificar o PR #2 antes de merge.
