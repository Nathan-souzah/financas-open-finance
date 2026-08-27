# Ativação Futura — Open Finance

## Objetivo

Esta primeira versão foi deliberadamente desenhada para oferecer controle financeiro local antes de qualquer importação bancária. Quando houver uma conta ativa em um provedor de Open Finance, a ativação deverá acrescentar uma integração de servidor sem alterar a navegação nem expor segredos no aplicativo mobile.

## Contrato de integração

| Etapa | Responsabilidade do aplicativo | Responsabilidade do servidor |
| --- | --- | --- |
| Preparar conexão | Solicita o início da conexão e abre a URL de consentimento devolvida pelo servidor. | Cria a sessão no provedor usando credenciais privadas e devolve apenas a URL transitória. |
| Consentimento | Exibe a jornada externa em um navegador seguro do sistema. | Não recebe senhas bancárias da pessoa usuária. |
| Retorno | Recebe o deep link do aplicativo e envia o identificador efêmero para confirmação. | Valida o retorno com o provedor, armazena tokens de forma protegida e registra o vínculo. |
| Sincronização | Solicita dados já normalizados e atualiza a persistência local. | Busca contas e transações autorizadas, normaliza o formato e respeita a validade do consentimento. |
| Desconexão | Permite a revogação com confirmação explícita. | Revoga ou exclui o vínculo conforme as capacidades do provedor e remove tokens associados. |

## Interface do adaptador

O contrato em `lib/open-finance/provider.ts` define um adaptador independente do fornecedor. A futura implementação do servidor deverá implementar `startConsent`, `normalizeAccounts` e `normalizeTransactions`, sem mudar os componentes mobile. O adaptador evita acoplamento de respostas de API a contas, transações e categorias da interface.

## Requisitos antes de ativar

| Requisito | Motivo |
| --- | --- |
| Escolha de um provedor e ambiente de homologação | Define a jornada de consentimento, os escopos autorizados e o formato das respostas. |
| Credenciais configuradas no servidor | Mantém chaves privadas e segredos fora do pacote distribuído para o celular. |
| URL de retorno registrada no provedor | Permite que o consentimento volte ao aplicativo pelo esquema seguro já configurado. |
| Política de privacidade e textos de consentimento revisados | Explicam à pessoa usuária quais dados serão acessados, por qual finalidade e por quanto tempo. |
| Fluxos de revogação e falha tratados | Evitam apresentar dados desatualizados ou sugerir que uma conexão inexistente esteja ativa. |

## Limite da primeira versão

Nenhuma conta bancária, transação ou credencial é importada por esta versão. A tela de Open Finance apenas esclarece o fluxo que será ativado depois da definição do provedor. Dados adicionados pela pessoa usuária continuam somente no armazenamento local do dispositivo.
