# Integração Pluggy — endpoints confirmados

A documentação oficial do Pluggy indica que o backend deve usar `CLIENT_ID` e `CLIENT_SECRET` para criar uma API Key. O Client Secret deve permanecer exclusivamente no servidor. Para a jornada do Connect Widget, a API Key do servidor é usada para criar um Connect Token no endpoint `POST https://api.pluggy.ai/connect_token`.

O payload do Connect Token pode incluir `clientUserId`, `webhookUrl`, `oauthRedirectUri` e `avoidDuplicates`. O Connect Token é destinado ao lado cliente, tem escopo limitado à sessão/item criado e validade curta; a API Key continua sendo usada no servidor para operações detalhadas e sincronização.

## Implementação planejada

| Operação | Local | Resultado |
| --- | --- | --- |
| Criar API Key | Backend | Token efêmero para chamadas autenticadas do servidor. |
| Criar Connect Token | Backend | URL/token transitório para abrir o fluxo Pluggy Connect. |
| Abrir Connect Widget | Aplicativo | Consentimento e seleção da instituição sem receber senha bancária no app. |
| Buscar contas e transações | Backend | Dados normalizados para o modelo local do aplicativo. |

## Referências

[1] [Pluggy — Authentication](https://docs.pluggy.ai/docs/authentication)

[2] [Pluggy — Create Connect Token](https://docs.pluggy.ai/reference/connect-token-create)

[3] [Pluggy — Create API Key](https://docs.pluggy.ai/reference/auth-create)
