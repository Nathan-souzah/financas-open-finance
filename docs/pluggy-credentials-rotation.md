# Troca de credenciais do Pluggy

## Regra de segurança

O aplicativo mobile e a PWA não devem conter `PLUGGY_CLIENT_ID` nem `PLUGGY_CLIENT_SECRET`. Esses valores são credenciais de servidor e devem permanecer somente no painel seguro de Secrets do projeto.

## Procedimento para trocar demo por produção

| Etapa | Ação |
| --- | --- |
| 1 | No dashboard do Pluggy, crie ou selecione a aplicação de produção e confirme que as credenciais são do ambiente correto. |
| 2 | No painel de gerenciamento do projeto, abra **Settings → Secrets**. |
| 3 | Substitua `PLUGGY_CLIENT_ID` pelo Client ID de produção e `PLUGGY_CLIENT_SECRET` pelo Client Secret de produção. |
| 4 | Mantenha `OPEN_FINANCE_PROVIDER` exatamente com o valor já configurado; ele identifica o provedor e não substitui as credenciais. |
| 5 | Reinicie o servidor para carregar os novos valores e valide a autenticação no backend antes de liberar a sincronização. |
| 6 | No dashboard Pluggy, registre as URLs de retorno e webhook de produção que serão usadas pelo backend. |
| 7 | Revogue ou regenere as credenciais demo depois que a transição estiver concluída. |

## O que não fazer

Não cole as credenciais em telas do app, arquivos versionados, mensagens, screenshots ou variáveis públicas com prefixo `EXPO_PUBLIC_`. Também não use uma API Key permanente no código do celular. O celular deve receber apenas um Connect Token curto, criado pelo backend para uma sessão de consentimento.

## Situação atual

A PWA e o aplicativo local podem ser testados sem alterar o `OPEN_FINANCE_PROVIDER`. A conexão bancária real só deve ser considerada ativa depois que o backend estiver configurado com as credenciais corretas, o Connect Token estiver integrado à interface e a sincronização de contas e transações tiver sido validada no ambiente apropriado.
