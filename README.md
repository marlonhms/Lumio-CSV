<div align="center">

# ⚡ Lumio CSV
### Visualizador & Editor de CSV Ultraleve, Inteligente e Moderno

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)]()
[![Pure Vanilla JS](https://img.shields.io/badge/Built%20With-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)]()
[![100% Offline & Private](https://img.shields.io/badge/Privacy-100%25%20Local%20%26%20Offline-success.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-purple.svg)](https://github.com/marlonhms/Lumio-CSV/pulls)

<p align="center">
  <b>Nunca mais espere o Excel ou LibreOffice abrir só para dar uma olhada ou filtrar um arquivo CSV.</b><br>
  Uma ferramenta open source prática, ultrarrápida, com design <i>Liquid Glass & Neon Edge Glow</i> que roda 100% no seu navegador sem enviar nenhum dado para a internet.
</p>

[Recursos Principais](#-recursos-principais) •
[Como Usar](#-como-usar) •
[Atalhos de Teclado](#-atalhos-de-teclado) •
[Estrutura](#-estrutura-do-projeto) •
[Testes](#-testes-automatizados) •
[Contribuindo](#-como-contribuir) •
[Licença](#-licen%C3%A7a)

---

</div>

## 💡 Sobre o Projeto

O **Lumio CSV** nasceu dentro da suíte de ferramentas práticas e leves com um objetivo claro: **eliminar o atrito e a lentidão de softwares de planilhas pesados** (como Microsoft Excel, LibreOffice Calc ou Google Docs) quando você só precisa inspecionar, validar, editar, filtrar ou converter dados em formato CSV, TSV ou TXT.

Construído inteiramente em **Vanilla JavaScript puro**, o Lumio CSV carrega em **milissegundos**, processa dezenas de milhares de linhas instantaneamente e opera **100% localmente no navegador** do usuário, garantindo privacidade absoluta dos seus dados.

---

## ✨ Recursos Principais

### 💎 Design Liquid Glass & Neon Edge Glow
- Interface moderna inspirada em *glassmorphism* com desfoque de fundo dinâmico (`backdrop-filter: blur`), gradientes fluidos e brilho neon suave nas bordas.
- **4 Temas Visuais Integrados**:
  - 🌌 **Neon Aurora** (Ciano & Violeta)
  - 🔮 **Cyber Amethyst** (Púrpura & Neon)
  - 🌲 **Emerald Matrix** (Verde Esmeralda)
  - 🔥 **Solar Flame** (Laranja & Âmbar)

### ⚡ Inicialização Instantânea & Zero Dependências
- Abre em milissegundos diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Brave, Safari, Opera).
- **Sem CDNs obrigatórias, sem frameworks pesados, sem build step**: basta abrir o arquivo `index.html`.
- **100% Privado e Seguro**: seus arquivos e registros nunca saem da sua máquina.

### 🎯 Detecção Inteligente Automática (*Smart Sniffing*)
- **Detecção de Delimitador**: detecta automaticamente vírgula (`,`), ponto e vírgula (`;`), tabulação (`\t`) e barra vertical (`|`).
- **Suporte a Padrão Brasileiro e Internacional**: reconhece números com vírgula ou ponto decimal, moedas (`R$`, `$`, `€`), percentuais e datas (`DD/MM/AAAA` ou `YYYY-MM-DD`).
- **Seletor de Codificação de Caracteres**: suporte a **UTF-8**, **Windows-1252 (ANSI/Latin 1)** e **ISO-8859-1** para acabar de vez com problemas de acentuação em arquivos legados.

### ✏️ Edição Inline Interativa
- **Edição Direta**: duplo clique em qualquer célula para alterar o conteúdo na hora.
- **Navegação com Teclado**: use `Tab` para ir para a próxima célula, `Enter` para salvar e `Esc` para cancelar.
- **Indicador de Alterações**: badge visual de alterações pendentes (`• Modificado`).

### ➕ Gerenciamento Completo de Linhas e Colunas
- **Nova Linha (`Ctrl+N`)**: insere novos registros instantaneamente no topo da tabela.
- **Ações por Linha**: inspecione, duplique ou exclua linhas com 1 clique.
- **Seleção em Lote**: barra flutuante com contagem de seleção, exclusão em massa, duplicação e cópia direta como JSON.
- **Gerenciador de Colunas**: adicione colunas customizadas, renomeie em tempo real, ajuste a visibilidade, reordene colunas e ative auto-fit de largura.

### 🔍 Busca Global & Filtros Avançados
- **Filtros Rápidos**: campo de filtro instantâneo no cabeçalho de cada coluna.
- **Busca Global Instantânea**: com destaque visual das ocorrências encontradas e suporte a Expressões Regulares (*Regex*).
- **Construtor de Filtros Multicritério**: combine regras com operadores lógicos `E` (AND) ou `OU` (OR), suportando: *Contém*, *Não contém*, *Igual*, *Diferente*, *Começa com*, *Termina com*, *Maior que (>)*, *Menor que (<)*, *Faixa de valores (Entre)*, *Vazio*, *Não Vazio* e *Regex*.

### 📊 Perfil Analítico & Estatísticas (*Data Profiling*)
- Modal de estatísticas detalhadas por coluna:
  - Total de preenchidos vs. taxa de valores nulos/vazios.
  - Valores únicos.
  - Para numéricos: mínimo, máximo, **média**, **mediana** e **desvio padrão**.
  - Gráfico de barras com a distribuição dos **Top 5 valores mais frequentes**.

### 👁️ Row Inspector (Inspecionador de Linhas)
- Visualize qualquer registro em cards organizados, facilitando a leitura de tabelas largas com dezenas de colunas.
- Edite valores de campos diretamente no inspetor.

### 💾 Exportação Flexível e Conversão
- **Salvar CSV (`Ctrl+S`)**: baixe imediatamente o CSV modificado.
- Exporte para **CSV Padrão** (vírgula), **CSV Brasileiro** (ponto e vírgula), **JSON**, **TSV** ou **Tabela Markdown**.
- Opção para exportar apenas as linhas filtradas ou colunas visíveis.

---

## 🚀 Como Usar

### Opção 1: Inicialização Rápida (Windows)
Basta dar dois cliques no arquivo executável em lote:
```cmd
abrir_visualizador.bat
```

### Opção 2: Abrir Diretamente no Navegador (Qualquer SO)
Dê um duplo clique ou abra o arquivo `index.html` em qualquer navegador:
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Brave / Opera / Safari

### Como Carregar Dados:
1. **Arrastar e Soltar (Drag & Drop)**: arraste qualquer arquivo `.csv`, `.tsv` ou `.txt` para dentro da janela.
2. **Botão Abrir Arquivo**: selecione o arquivo do seu computador.
3. **Colar CSV**: cole texto copiado diretamente da área de transferência.
4. **Carregar Exemplo**: clique em "Exemplo" na tela inicial para testar imediatamente com uma base de demonstração.

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
| :--- | :--- |
| `Ctrl + S` | Baixar / Salvar CSV com alterações |
| `Ctrl + O` | Abrir seletor de arquivos |
| `Ctrl + N` | Inserir nova linha editável no topo |
| `/` ou `Ctrl + F` | Focar instantaneamente na busca global |
| `Delete` | Excluir linhas selecionadas |
| `Tab` | Navegar para a próxima célula em edição inline |
| `Shift + Tab` | Navegar para a célula anterior em edição inline |
| `Enter` | Confirmar e salvar edição da célula |
| `Esc` | Fechar modais / Cancelar edição inline |
| `←` / `→` | Navegar para a página anterior / próxima |

---

## 📁 Estrutura do Projeto

```text
lumio-csv/
├── index.html              # Interface do usuário (HTML5 Semântico + SVG Icons)
├── style.css               # Design System Liquid Glass & Neon Edge Glow
├── app.js                  # Lógica da aplicação, eventos e renderização da UI
├── csv-engine.js           # Mecanismo RFC-4180 de parsing, sniff, filtros, ordenação e stats
├── sample_data.csv         # Dataset de exemplo com métricas de produtos e vendas
├── abrir_visualizador.bat  # Script para inicialização rápida no Windows
├── LICENSE                 # Licença MIT
├── README.md               # Documentação técnica e guia do usuário
└── test_*.js               # Bateria de testes unitários e de integração
```

---

## 🧪 Testes Automatizados

O motor de parsing (`csv-engine.js`) e as regras de negócio possuem suítes de testes unitários e de estresse para Node.js:

```bash
# Executa os testes do motor de CSV (sniffing, RFC-4180, tipos, ordenação, etc.)
node test_csv_engine.js

# Executa testes de performance e casos extremos com 10.000+ linhas
node test_edge_cases.js

# Executa testes de recursos complementares (auto-fit, reordenação, etc.)
node test_new_features.js
```

---

## 🤝 Como Contribuir

Contribuições são extremamente bem-vindas! Este é um projeto **Open Source** feito para a comunidade.

1. Faça um **Fork** do projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/MinhaNovaFeature`)
3. Faça o commit das suas alterações (`git commit -m 'feat: Adiciona novo recurso x'`)
4. Faça o push para a branch (`git push origin feature/MinhaNovaFeature`)
5. Abra um **Pull Request**

Se encontrar algum bug ou tiver sugestões de novas funcionalidades, sinta-se à vontade para abrir uma [Issue](https://github.com/marlonhms/Lumio-CSV/issues).

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

<div align="center">
  Desenvolvido por <b><a href="https://github.com/marlonhms">Marlon Henrique Serpa</a></b><br>
  <i>Ferramentas práticas e leves para o dia a dia.</i>
</div>
