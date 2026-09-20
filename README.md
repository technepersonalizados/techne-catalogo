# Techne — Catálogo de Canecas

Catálogo completo com carrinho, preços por quantidade, escolha de vendedor no WhatsApp e painel de administração.

## O que está incluído

- `index.html` — catálogo público com carrinho
- `admin.html` — painel para gerenciar produtos, configurações e logo
- `products.json` — lista de produtos
- `config.json` — nome, textos, WhatsApps dos vendedores e cores
- `assets/logo.png` — logo da Techne
- `assets/products/` — fotos dos produtos

## Preços automáticos (por quantidade total no carrinho)

| Quantidade     | Preço unitário |
|----------------|----------------|
| 1 caneca       | R$ 35,00       |
| 2 a 6 canecas  | R$ 32,00       |
| 7 a 10 canecas | R$ 30,00       |
| 11 ou mais     | R$ 28,00       |

O valor unitário desce conforme a quantidade total de itens no carrinho.

## Publicação no GitHub Pages

1. Crie um repositório (ex.: `catalogo-canecas`).
2. Envie **todos** os arquivos e pastas deste projeto para a branch `main`.
3. No GitHub: **Settings → Pages**.
4. Selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`.
5. Abra o endereço gerado pelo GitHub Pages.

## Configurar o painel (admin.html)

1. Abra `/admin.html` no navegador.
2. Informe usuário/organização, nome do repositório e um **Fine-grained Personal Access Token** com permissão de escrita no conteúdo.
3. Clique em **Conectar**.

O token fica salvo apenas no armazenamento local do navegador. Não publique o token em nenhum arquivo.

### O que você pode fazer no painel

- Adicionar, editar e excluir produtos (com foto)
- Alterar nome da loja, subtítulo e cores
- Configurar **dois números de WhatsApp** (Vendedor 1 e Vendedor 2)
- **Atualizar a logo** da loja (seção 4)

## WhatsApp

No painel, use o formato internacional somente com números, exemplo:

`5511999999999`

Configure os dois vendedores. No catálogo o cliente escolhe com qual vendedor deseja falar antes de enviar o pedido.

## Carrinho

- O cliente adiciona canecas pelo modal do produto (com controle de quantidade).
- O botão flutuante mostra a quantidade total.
- No carrinho é possível aumentar/diminuir quantidades.
- O preço unitário é recalculado automaticamente conforme a tabela de descontos.
- Ao enviar, o cliente escolhe Vendedor 1 ou Vendedor 2.

## Segurança

Nunca coloque o token do GitHub em arquivos públicos. Use apenas o painel e o armazenamento local do navegador.
