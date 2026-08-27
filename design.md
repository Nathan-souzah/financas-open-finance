# Plano de Design — Finanças Open Finance

## Direção do produto

O Finanças Open Finance será um aplicativo de finanças pessoais em retrato, pensado para consulta rápida com uma mão. A primeira versão permitirá registrar e categorizar movimentações localmente, visualizar saldo, fluxo mensal e orçamento, além de iniciar a conexão com instituições financeiras por meio de um fluxo de consentimento. A integração real ficará isolada em uma camada segura de servidor e somente será ativada após a escolha de um provedor de Open Finance e a configuração das credenciais correspondentes.

## Lista de telas

| Tela | Conteúdo principal | Funções principais |
| --- | --- | --- |
| Início | Saldo consolidado, receitas, despesas, saldo disponível e resumo do orçamento do mês. | Consultar a visão financeira, navegar para detalhes e incluir uma movimentação. |
| Transações | Lista cronológica de lançamentos, filtro por tipo e categoria. | Criar, editar, excluir, pesquisar e categorizar movimentações. |
| Nova movimentação | Formulário de valor, tipo, descrição, categoria e data. | Registrar receita ou despesa e salvar no dispositivo. |
| Orçamento | Limite mensal e consumo por categoria. | Definir limite total, acompanhar utilização e editar o orçamento. |
| Contas | Contas adicionadas manualmente e contas que vierem a ser conectadas. | Visualizar saldos por conta, adicionar conta manual e começar uma conexão. |
| Conectar instituição | Explicação clara de consentimento, escopo de dados e continuidade protegida. | Iniciar o fluxo externo do provedor selecionado; exibir estado de configuração quando a integração ainda não estiver ativada. |
| Ajustes | Preferências de privacidade, dados locais e informações da integração. | Gerenciar armazenamento local e conferir o status da conexão. |

## Fluxos principais

O fluxo inicial prioriza a utilidade sem exigir credenciais: a pessoa abre o aplicativo, adiciona uma receita ou despesa, escolhe uma categoria e consulta o resultado atualizado no painel e no orçamento. A ação primária na tela inicial será um botão de adição facilmente alcançável pelo polegar, que abre o formulário de nova movimentação e retorna à tela anterior com confirmação visual e tátil.

O fluxo de Open Finance seguirá a sequência: a pessoa acessa **Contas**, toca em **Conectar instituição**, lê o escopo do consentimento e inicia o redirecionamento seguro. O aplicativo nunca receberá senhas bancárias. Após o retorno do provedor, o servidor validará o resultado da autorização, transformará os dados recebidos no modelo interno e atualizará a lista de contas e transações. Até que um provedor seja configurado, essa tela deixará explícito que a conexão está sendo preparada e preservará todas as funções locais.

## Estrutura e dados

As informações da primeira versão ficarão no dispositivo, usando armazenamento local. O modelo compartilhado terá entidades para `Account`, `Transaction`, `Category`, `Budget` e `Connection`. Valores monetários serão persistidos em centavos inteiros para evitar erros de arredondamento. Uma interface de adaptador separará o aplicativo de cada fornecedor de Open Finance, permitindo trocar ou adicionar provedores sem reescrever as telas financeiras.

## Escolhas visuais

| Elemento | Escolha | Aplicação |
| --- | --- | --- |
| Cor de marca | Verde-petróleo `#006B5F` | Ações primárias, destaques e indicadores positivos. |
| Fundo | Névoa clara `#F7F8F6` | Base suave que reduz contraste excessivo em consultas frequentes. |
| Superfícies | Branco `#FFFFFF` | Cartões, campos e grupos de configurações. |
| Texto principal | Grafite `#18201E` | Valores, títulos e informações prioritárias. |
| Texto secundário | Cinza-sálvia `#62706B` | Rótulos, descrições e dados auxiliares. |
| Receita | Verde `#16875D` | Valores de entrada e estados positivos. |
| Despesa | Terracota `#C75146` | Valores de saída, avisos e estados de atenção. |

O design seguirá convenções iOS: tipografia legível, barras inferiores nativas, áreas de toque confortáveis, grupos de ajustes em cartões e hierarquia visual baseada em números financeiros. Nenhuma informação essencial dependerá exclusivamente de cor. A interface respeitará áreas seguras, o teclado e o modo claro/escuro do dispositivo.

## Princípios de segurança e privacidade

Dados financeiros são sensíveis. O aplicativo solicitará somente as permissões necessárias, armazenará tokens de sessão no cofre seguro do sistema quando a integração for habilitada e manterá segredos do provedor exclusivamente no servidor. A tela de consentimento identificará o provedor, os dados solicitados e o estado da autorização, sem simular uma conexão bancária real.
