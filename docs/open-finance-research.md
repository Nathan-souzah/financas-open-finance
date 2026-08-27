# Notas de Arquitetura — Open Finance

## Constatações verificadas

O fluxo de compartilhamento de dados precisa ser iniciado pela própria pessoa usuária e depende de consentimento. O portal oficial do ecossistema informa que é possível acessar apenas os dados autorizados, após esse consentimento. Por isso, a interface do aplicativo deve explicar o escopo solicitado antes de abrir a jornada externa e jamais solicitar credenciais bancárias diretamente.

Uma plataforma de agregação pode reduzir a complexidade da integração. A documentação pública da Belvo para o Brasil informa acesso a dados de titularidade, contas e transações, incluindo data, valor e descrição. Essa estrutura é compatível com o modelo inicial do aplicativo, mas a escolha final do provedor deve preceder a configuração de credenciais e do ambiente de produção.

## Implicações para o aplicativo

| Decisão | Aplicação no Finanças Open Finance |
| --- | --- |
| Consentimento explícito | A tela de conexão mostrará escopo, instituição e status antes de redirecionar a pessoa usuária. |
| Dados bancários sensíveis | Nenhum segredo de provedor ou token de longa duração ficará no código mobile; a integração será mediada pelo servidor. |
| Dados normalizados | Contas e transações serão convertidas para os tipos internos do aplicativo, preservando o restante da interface independente do fornecedor. |
| Revogação de acesso | O fluxo futuro deverá permitir desconectar a instituição e refletir a revogação de consentimento. |

## Referências

[1] [Open Finance Brasil — Como usar o Open Finance](https://openfinancebrasil.org.br/como-usar-o-open-finance/)

[2] [Belvo Developers — Banking Aggregation Overview (Brazil)](https://developers.belvo.com/products/aggregation_brazil/aggregation-brazil-introduction)
