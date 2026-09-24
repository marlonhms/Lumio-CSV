<div align="center">

# ⚡ Lumio CSV
### Visualizador & Editor de CSV Ultraleve, Inteligente e Moderno

[![Live Demo](https://img.shields.io/badge/Demo-Acessar%20Online-00d2ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://marlonhms.github.io/Lumio-CSV/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)]()
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-purple.svg)]()
[![Pure Vanilla JS](https://img.shields.io/badge/Built%20With-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)]()
[![100% Offline & Private](https://img.shields.io/badge/Privacy-100%25%20Local%20%26%20Offline-success.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-purple.svg)](https://github.com/marlonhms/Lumio-CSV/pulls)

<p align="center">
  <b>Nunca mais espere o Excel ou LibreOffice abrir só para visualizar, filtrar ou editar um arquivo CSV.</b><br>
  Uma ferramenta prática, ultrarrápida, com design <i>Liquid Glass & Neon Edge Glow</i> que roda 100% no seu navegador ou instalada como aplicativo nativo (PWA).
</p>

<p align="center">
  🚀 <b><a href="https://marlonhms.github.io/Lumio-CSV/">Clique aqui para acessar o Lumio CSV Online (sem instalar nada)</a></b>
</p>

[Recursos Principais](#-recursos-principais) •
[Instalação & Como Usar](#-instalação--como-usar) •
[Atalhos de Teclado](#-atalhos-de-teclado) •
[Estrutura do Projeto](#-estrutura-do-projeto) •
[Testes Automatizados](#-testes-automatizados) •
[Contribuindo](#-como-contribuir) •
[Licença](#-licença)

---

</div>

## 💡 Sobre o Projeto

O **Lumio CSV** nasceu com um objetivo claro: **eliminar o atrito e a lentidão de softwares de planilhas pesados** (como Microsoft Excel, LibreOffice Calc ou Google Sheets) quando você só precisa inspecionar, validar, editar, filtrar ou converter dados em formato CSV, TSV ou TXT.

Construído inteiramente em **Vanilla JavaScript puro (zero dependências)**, o Lumio CSV carrega em **milissegundos**, processa dezenas de milhares de linhas instantaneamente e opera **100% localmente na sua máquina**, garantindo privacidade absoluta dos seus dados.

---

## ✨ Recursos Principais

### 💎 Design Liquid Glass & Neon Edge Glow
- Interface moderna inspirada em *glassmorphism* com desfoque de fundo dinâmico (`backdrop-filter: blur`), gradientes fluidos e brilho neon suave nas bordas.
- **4 Temas Visuais Integrados**:
  - 🌌 **Neon Aurora** (Ciano & Violeta)
  - 🔮 **Cyber Amethyst** (Púrpura & Neon)
  - 🌲 **Emerald Matrix** (Verde Esmeralda)
  - 🔥 **Solar Flame** (Laranja & Âmbar)

### ⚡ Instalação Moderna PWA & 100% Offline
- **Instalação em 1 Clique (PWA)**: instale diretamente pelo navegador (Chrome, Edge, Brave, Opera) como um aplicativo de desktop com janela dedicada, ícone na barra de tarefas e menu iniciar.
- **Abertura Silenciosa**: inicializadores modernos sem abrir janelas pretas de terminal.
- **100% Privado e Seguro**: nenhum dado é enviado para servidores externos.

### 📊 Suporte a Planilhas Excel (.xlsx e .xls) & Multi-Abas
- **Compatibilidade Completa**: abra arquivos Excel modernos (**`.xlsx`**) e planilhas legadas do Excel 97-2004 (**`.xls`** binário BIFF8), além de `.csv`, `.tsv` e `.txt`.
- **Seletor de Abas Liquid Glass**: se a planilha contiver múltiplas abas (*Sheets*), uma barra elegante de abas permite alternar entre elas instantaneamente sem recarregar o arquivo.
- **Carregamento Sob Demanda (*Lazy Loading*)**: o motor de leitura do Excel é carregado de forma assíncrona, mantendo o carregamento inicial do Lumio CSV instantâneo e ultra leve.
- **100% Offline & Local**: o processamento roda inteiramente no cliente via biblioteca vendor embutida, sem envio para a nuvem.

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
- **Gerenciador de Colunas**: redimensione interativamente (arrastando ou botões `+`/`-`), centralize conteúdos, ative Auto-Fit inteligente e reordene colunas por drag-and-drop.

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
- **Salvar Rápido (`Ctrl+S`)**: baixe imediatamente o arquivo atualizado (salva como `.xlsx` para planilhas ou `.csv` para arquivos de texto).
- Exporte para **Planilha Excel (.xlsx)**, **CSV Padrão** (vírgula), **CSV Brasileiro** (ponto e vírgula), **JSON**, **TSV** ou **Tabela Markdown**.
- Opção para exportar apenas as linhas filtradas ou colunas visíveis.

---

## 🚀 Instalação & Como Usar

O Lumio CSV oferece opções modernas e elegantes de uso, eliminando a dependência obrigatória de arquivos `.bat` tradicionais:

### 🌐 Opção 1: Acesso Online Direto & PWA no Navegador (Recomendado)
Acesse instantaneamente sem precisar baixar ou instalar nada:
- **Link Online**: **[https://marlonhms.github.io/Lumio-CSV/](https://marlonhms.github.io/Lumio-CSV/)**
- No Chrome, Edge ou Brave, você pode clicar no ícone de instalar na barra de endereços (ou no botão **"Instalar App"** no topo da tela) para transformá-lo em um aplicativo nativo no seu computador!

---

### 🖥️ Opção 2: Criar Atalho no Desktop do Windows (1 Clique — Sem Terminal)
Para quem prefere utilizar a versão local com atalho na Área de Trabalho e ícone de alta resolução:
- **Recomendado (Zero Terminal)**: Dê duplo clique em:
  ```text
  scripts/criar_atalho_desktop.vbs
  ```
  *(Cria o atalho silenciosamente com diálogo nativo de confirmação)*
- **Alternativa em lote**: `scripts/criar_atalho_desktop.bat` *(ou `npm run shortcut`)*
- **PowerShell**: `powershell -ExecutionPolicy Bypass -File scripts/criar_atalho_desktop.ps1`

O instalador cria automaticamente o atalho oficial **"Lumio CSV.lnk"** na sua Área de Trabalho, configurado para abrir diretamente em modo de janela de aplicativo dedicada (standalone, sem console)!

---

### 🔕 Opção 3: Inicialização Silenciosa Local (Zero Janela de Console)
Para abrir instantaneamente no navegador padrão sem que apareça nenhuma tela preta de prompt de comando (CMD):
- Dê duplo clique no arquivo:
  ```text
  Lumio CSV.vbs
  ```

---

### ⚡ Opção 4: Executar Servidor Local PWA
Se desejar rodar o PWA com Service Worker e cache localmente:
1. Inicie o servidor local com `npm start` ou executando `scripts/iniciar_servidor_local.bat`.
2. Acesse `http://localhost:8080` e clique em **"Instalar App"**.

---

### 🌐 Opção 5: Abrir Diretamente no Navegador
Basta abrir o arquivo `index.html` com qualquer navegador moderno de sua preferência:
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Brave / Opera / Safari

---

### ⚡ Opção 6: Inicializador Tradicional
Se desejar usar o arquivo em lote clássico com terminal:
```cmd
abrir_visualizador.bat
```

---

## 📥 Como Carregar Dados

1. **Arrastar e Soltar (Drag & Drop)**: arraste qualquer arquivo `.csv`, `.tsv` ou `.txt` para dentro da janela.
2. **Botão Abrir Arquivo**: selecione o arquivo do seu computador (`Ctrl+O`).
3. **Colar CSV**: cole texto copiado diretamente da área de transferência (`Ctrl+V` ou pelo botão "Colar CSV").
4. **Carregar Exemplo**: clique em "Exemplo" na tela inicial para testar imediatamente com uma base de demonstração rica.

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

O projeto possui uma arquitetura limpa, modular e organizada:

```text
Lumio-CSV/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: Testes automáticos e deploy no GitHub Pages
├── assets/
│   ├── icons/
│   │   ├── icon.svg                # Ícone vetorial master Liquid Glass
│   │   ├── icon-192.png            # Ícone PWA 192x192
│   │   ├── icon-512.png            # Ícone PWA 512x512
│   │   ├── icon-512-maskable.png   # Ícone PWA Maskable 512x512
│   │   ├── icon-64.png             # Ícone para favicons
│   │   └── lumio.ico               # Ícone nativo para atalhos do Windows
│   └── vendor/
│       └── xlsx.full.min.js        # Parser & encoder Excel (.xls/.xlsx) 100% offline
├── scripts/
│   ├── criar_atalho_desktop.vbs    # Instalador 1-clique silencioso (zero janela de console)
│   ├── criar_atalho_desktop.ps1    # Script PowerShell para criar atalho no Desktop
│   ├── criar_atalho_desktop.bat    # Executável de 1 clique para o script PowerShell
│   ├── serve.js                    # Servidor local leve (zero dependências) para PWA
│   ├── iniciar_servidor_local.bat  # Executável de 1 clique para o servidor local
│   ├── generate_sample_xls.js      # Gerador de planilhas de teste .xls multi-abas
│   └── build_icons.js              # Gerador de ícones e assets de alta resolução
├── tests/
│   ├── run_all.js                  # Executor master com sumário colorido de testes
│   ├── test_csv_engine.js          # Testes unitários do motor de parsing e análise
│   ├── test_edge_cases.js          # Casos extremos (BOM, 10.000 linhas, formato BR)
│   ├── test_new_features.js        # Testes de layout, auto-fit e reordenação (15k linhas)
│   ├── test_column_resizing_and_autofit.js # Verificação de redimensionamento e CSS
│   ├── test_app_deep_verification.js # Verificação profunda de layout e componentes
│   ├── test_pwa_and_structure.js   # Verificação de integridade PWA, manifesto e assets
│   ├── test_excel_support.js       # Testes de importação/exportação Excel (.xlsx e .xls)
│   └── test_in_browser.js          # Teste E2E headless no navegador com CDP
├── index.html                      # Interface principal do usuário (HTML5 Semântico)
├── style.css                       # Design System Liquid Glass & Neon Edge Glow
├── app.js                          # Lógica da aplicação, eventos, PWA e controles de UI
├── csv-engine.js                   # Motor puro de RFC-4180 parsing, filtros e estatísticas
├── sw.js                           # Service Worker para funcionalidade 100% offline
├── manifest.webmanifest            # Manifesto PWA com modo standalone e file handlers
├── favicon.ico                     # Favicon padrão no root para navegadores desktop
├── sample_data.csv                 # Dataset de demonstração CSV
├── teste_produtos.xls              # Planilha de teste Excel legada multi-abas (.xls)
├── teste_clientes.xls              # Planilha de teste Excel legada simples (.xls)
├── Lumio CSV.vbs                   # Inicializador silencioso standalone (zero console)
├── abrir_visualizador.bat          # Inicializador clássico em lote (compatibilidade)
├── package.json                    # Scripts npm padronizados (start, test, shortcut)
├── LICENSE                         # Licença MIT
└── README.md                       # Documentação completa
```

---

## 🧪 Testes Automatizados

O Lumio CSV inclui uma suíte abrangente de **8 testes automatizados** com cobertura de parsing RFC-4180, interoperabilidade Excel (.xlsx e .xls legada), performance com mais de 15.000 linhas, integridade de layout, auto-fit matemático, conformidade PWA e renderização real em navegador headless via Chrome DevTools Protocol (CDP).

Para executar todas as suítes de testes:

```bash
npm test
```

*(Ou diretamente com Node.js: `node tests/run_all.js`)*

Para executar uma suíte específica:
```bash
node tests/test_csv_engine.js
node tests/test_excel_support.js
node tests/test_edge_cases.js
node tests/test_pwa_and_structure.js
```

---

## 🤝 Como Contribuir

Contribuições são extremamente bem-vindas! Este é um projeto **Open Source** feito para a comunidade.

1. Faça um **Fork** do projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/MinhaNovaFeature`)
3. Faça o commit das suas alterações (`git commit -m 'feat: Adiciona novo recurso x'`)
4. Faça o push para a branch (`git push origin feature/MinhaNovaFeature`)
5. Abra um **Pull Request**

Se encontrar algum bug ou tiver sugestões de melhorias, fique à vontade para abrir uma [Issue](https://github.com/marlonhms/Lumio-CSV/issues).

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

<div align="center">
  Desenvolvido por <b><a href="https://github.com/marlonhms">Marlon Henrique Serpa</a></b><br>
  <i>Ferramentas práticas, ultraleves e modernas para o dia a dia.</i>
</div>
