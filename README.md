# Catálogo de Canecas — GitHub Pages + painel pelo celular

## O que você recebeu

- `index.html`: catálogo público.
- `admin.html`: painel para celular.
- `products.json`: produtos.
- `config.json`: nome, texto e WhatsApp.
- `assets/logo.png`: logo enviado.
- `assets/products/`: fotos enviadas.

## Publicação no GitHub

1. Crie um repositório, por exemplo `catalogo-canecas`.
2. Envie TODOS os arquivos e pastas deste projeto para a branch `main`.
3. No GitHub, abra **Settings → Pages**.
4. Selecione **Deploy from a branch**, branch `main` e pasta `/ (root)`.
5. Abra o endereço do GitHub Pages.

## Configurar o painel pelo celular

O painel (`/admin.html`) usa a API oficial do GitHub para atualizar `products.json`, `config.json` e enviar fotos.

Na primeira entrada:
1. Informe o usuário/organização do GitHub.
2. Informe o nome exato do repositório.
3. Informe um **Fine-grained Personal Access Token** com permissão de escrita no conteúdo desse repositório.
4. Clique em Conectar.

O token fica salvo apenas no armazenamento local do navegador. **Não publique o token em nenhum arquivo do site e não o envie para ninguém.** Se perder o celular ou quiser revogar o acesso, revogue o token no GitHub.

## Importante

O GitHub Pages é hospedagem estática. O painel consegue gerenciar o catálogo porque ele grava os arquivos diretamente no repositório via API. Depois de publicar uma alteração, o GitHub Pages pode levar alguns instantes para refletir a mudança.

As fotos enviadas pelo painel são comprimidas no navegador e salvas como JPG para reduzir o tamanho do repositório.

## WhatsApp

No painel, use o formato internacional, somente números, por exemplo:
`5511999999999`

Troque o número de exemplo antes de divulgar o catálogo.

## Segurança

Não coloque token de GitHub no `config.js`, `app.js`, `admin.js` ou em qualquer arquivo público. O token deve ser digitado somente no painel e armazenado localmente no aparelho do administrador.
