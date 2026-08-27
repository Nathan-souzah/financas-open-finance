# Publicação no Render

## O que será publicado

Este projeto é um serviço Node/Express que serve simultaneamente o build web da Expo e as rotas do backend. O arquivo `render.yaml` já contém os comandos de instalação, build, inicialização e health check. O domínio fornecido pelo Render será HTTPS e não exige domínio próprio.

## Passo a passo

1. Crie uma conta em [render.com](https://render.com) e conecte o GitHub.
2. Envie o projeto para um repositório GitHub privado ou autorizado. Não inclua arquivos `.env`, Client Secret, API Key ou tokens no repositório.
3. No Render, escolha **New → Blueprint** e selecione o repositório.
4. Confirme o serviço descrito em `render.yaml` e clique em **Apply**.
5. Aguarde o comando `pnpm build` concluir. O build gera `dist-web` para a PWA e `dist` para o backend.
6. No painel do serviço, abra **Environment** e preencha `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` com os valores reais. Mantenha `OPEN_FINANCE_PROVIDER=pluggy`.
7. Defina `EXPO_PUBLIC_API_BASE_URL` com a URL HTTPS do próprio serviço Render, sem barra final, e salve. O Render fará um novo deploy.
8. Verifique `https://SEU-ENDERECO.onrender.com/api/health`. A resposta esperada contém `ok: true`.
9. Abra `https://SEU-ENDERECO.onrender.com` no Safari. Para instalar, use **Compartilhar → Adicionar à Tela de Início**.

## Pluggy

No dashboard do Pluggy, a aplicação precisa ter o ambiente e as URLs de retorno configurados para o endereço HTTPS do Render. O Client Secret deve ficar somente nos Environment Variables do Render e no backend. Nunca o coloque em `EXPO_PUBLIC_*`, no manifest, na PWA ou em arquivos do GitHub.

## Limitações da primeira publicação

O plano gratuito pode suspender o serviço por inatividade e pode ter limites de uso. A PWA ainda usa armazenamento local para os dados financeiros; a publicação do backend não transforma automaticamente esses dados em sincronização entre aparelhos. Antes de produção, valide consentimento, retorno, webhooks, rotação das credenciais e persistência do estado Pluggy.
