<div align="center">

# Lumio CSV
### Visualizador e Editor de Dados Tabulares (CSV, TSV e Excel)

[![Live Demo](https://img.shields.io/badge/Demo-Acessar%20Online-00d2ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://marlonhms.github.io/Lumio-CSV/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dependencies](https://img.shields.io/badge/Dependencies-Local%20Vendor-brightgreen.svg)]()
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-purple.svg)]()
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg)]()

<p align="center">
  Visualizador e editor de dados tabulares projetado para abrir arquivos CSV, TSV e planilhas Excel instantaneamente no navegador ou desktop.<br>
  Interface com tema escuro Liquid Glass, navegação por abas e processamento 100% local sem envio de dados para servidores externos.
</p>

<p align="center">
  <b><a href="https://marlonhms.github.io/Lumio-CSV/">Acessar Lumio CSV Online</a></b>
</p>

[Recursos Principais](#recursos-principais) •
[Instalação e Uso](#instalação-e-uso) •
[Atalhos de Teclado](#atalhos-de-teclado) •
[Estrutura do Projeto](#estrutura-do-projeto) •
[Testes Automatizados](#testes-automatizados) •
[Contribuição](#contribuição) •
[Licença](#licença)

---

</div>

## Sobre o Projeto

O **Lumio CSV** foi desenvolvido para inspecionar, filtrar, editar e exportar bases de dados tabulares de forma ágil, eliminando a lentidão ao abrir planilhas pesadas para conferências rápidas.

Construído em Vanilla JavaScript com suporte a Service Worker e SheetJS embutido localmente, o aplicativo carrega instantaneamente, lida com grandes volumes de registros e opera de forma 100% privada no dispositivo do usuário.

---

## Recursos Principais

### Interface Liquid Glass
* Design escuro moderno com desfoque de fundo e detalhes luminosos.
* 4 temas visuais selecionáveis: Neon Aurora, Cyber Amethyst, Emerald Matrix e Solar Flame.
* Barra de rolagem estilizada com reflexo luminoso cilíndrico e iluminação no hover.

### Suporte a Excel e Multi-Abas
* Abertura de planilhas modernas (`.xlsx`) e legadas (`.xls` BIFF8), além de `.csv`, `.tsv` e `.txt`.
* Seletor de abas dedicado para alternar entre planilhas sem recarregar o arquivo.
* Carregamento assíncrono sob demanda (lazy loading) do motor de planilhas, mantendo o carregamento inicial leve.
* Processamento local por biblioteca embutida, sem envio de dados para a nuvem.

### Detecção Automática de Formato
* Reconhecimento automático do delimitador: vírgula (`,`), ponto e vírgula (`;`), tabulação (`\t`) e barra vertical (`|`).
* Suporte a formatos numéricos internacionais e padrão brasileiro (moedas `R$`, `$`, `€`, decimais com vírgula e percentuais).
* Tratamento de codificação para arquivos legados: UTF-8, Windows-1252 (ANSI) e ISO-8859-1.

### Edição Inline e Gestão de Registros
* Duplo clique na célula para editar valores diretamente, com navegação por `Tab`, confirmação por `Enter` e cancelamento por `Esc`.
* Inserção de novos registros no topo (`Ctrl+N`).
* Barra de ações em lote: contagem de selecionados, exclusão em massa, duplicação e cópia em formato JSON.
* Gerenciador de colunas: redimensionamento manual, alinhamento centralizado, ajuste automático de largura (auto-fit) e reordenação.

### Busca Global e Filtros Avançados
* Campo de filtro rápido no cabeçalho de cada coluna.
* Busca global em tempo real com destaque visual das ocorrências e suporte a expressões regulares (Regex).
* Construtor de filtros multicritério com lógica E (AND) e OU (OR), incluindo operadores de texto, valores numéricos e intervalos.

### Perfil dos Dados e Estatísticas
* Painel analítico por coluna com volume de preenchimento, taxa de valores vazios e total de registros únicos.
* Estatísticas descritivas para dados numéricos: média, mediana, desvio padrão, mínimo e máximo.
* Gráfico de frequência dos 5 valores mais recorrentes.

### Exportação e Conversão
* Salvamento rápido com atalho `Ctrl+S`.
* Exportação direta para Excel (`.xlsx`), CSV internacional (vírgula), CSV brasileiro (ponto e vírgula), JSON, TSV e Markdown.
* Opção de exportar somente os registros filtrados ou colunas visíveis.

---

## Instalação e Uso

### Opção 1: Acesso Web e PWA (Recomendado)
Acesse diretamente pelo navegador sem necessidade de instalação prévia:
* Link de acesso: **[https://marlonhms.github.io/Lumio-CSV/](https://marlonhms.github.io/Lumio-CSV/)**
* Para instalar como aplicativo nativo no desktop, clique no botão **Instalar App** no cabeçalho ou no ícone de instalação do navegador (Chrome, Edge ou Brave).

---

### Opção 2: Atalho na Área de Trabalho (Windows)
Para utilizar a versão local com atalho dedicado e ícone próprio:
* Dê duplo clique no script:
  ```text
  scripts/criar_atalho_desktop.vbs
  ```
* O atalho oficial **Lumio CSV** será criado na Área de Trabalho, configurado para abrir em janela dedicada de aplicativo, sem janela de terminal.

---

### Opção 3: Execução Silenciosa Local
Para abrir localmente no navegador sem exibir prompt de comando:
* Dê duplo clique em:
  ```text
  Lumio CSV.vbs
  ```

---

### Opção 4: Servidor Local para Desenvolvimento
Para executar o ambiente com Service Worker e cache local ativo:
1. Inicie o servidor com `npm start` ou executando `scripts/iniciar_servidor_local.bat`.
2. Abra `http://localhost:8080` no navegador.

---

### Opção 5: Execução Direta
Abra o arquivo `index.html` em qualquer navegador moderno compatível (Chrome, Edge, Firefox, Brave, Safari).

---

## Métodos de Entrada de Dados

1. **Arrastar e Soltar**: arraste arquivos `.csv`, `.tsv`, `.txt`, `.xlsx` ou `.xls` para a área de importação.
2. **Selecionar Arquivo**: clique no botão correspondente ou use o atalho `Ctrl+O`.
3. **Colar da Área de Transferência**: use `Ctrl+V` ou o botão dedicado para carregar dados copiados.
4. **Base de Demonstração**: clique no botão de exemplo para carregar um conjunto de testes completo.

---

## Atalhos de Teclado

| Tecla / Combinação | Função |
| :--- | :--- |
| `Ctrl + S` | Salvar e baixar os dados atualizados |
| `Ctrl + O` | Abrir seletor de arquivos |
| `Ctrl + N` | Inserir nova linha editável no topo |
| `/` ou `Ctrl + F` | Focar na busca global |
| `Delete` | Excluir linhas selecionadas |
| `Tab` | Avançar para a próxima célula na edição |
| `Shift + Tab` | Voltar para a célula anterior na edição |
| `Enter` | Confirmar alteração na célula |
| `Esc` | Fechar modais ou cancelar edição ativa |
| `←` / `→` | Paginação: anterior / próxima |

---

## Estrutura do Projeto

```text
Lumio-CSV/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: testes automáticos e publicação no GitHub Pages
├── assets/
│   ├── icons/
│   │   ├── icon.svg                # Ícone vetorial Liquid Glass
│   │   ├── icon-192.png            # Ícone PWA 192x192
│   │   ├── icon-512.png            # Ícone PWA 512x512
│   │   ├── icon-512-maskable.png   # Ícone PWA adaptativo 512x512
│   │   ├── icon-64.png             # Ícone para favicons
│   │   └── lumio.ico               # Ícone nativo para Windows
│   └── vendor/
│       └── xlsx.full.min.js        # Parser e encoder Excel 100% offline
├── scripts/
│   ├── criar_atalho_desktop.vbs    # Criador de atalho silencioso no desktop
│   ├── criar_atalho_desktop.ps1    # Script PowerShell para geração do atalho
│   ├── criar_atalho_desktop.bat    # Executável em lote para o script PowerShell
│   ├── serve.js                    # Servidor local para execução PWA
│   ├── iniciar_servidor_local.bat  # Inicializador em lote do servidor local
│   ├── generate_sample_xls.js      # Gerador de planilhas de teste em formato .xls
│   └── build_icons.js              # Gerador de ícones e assets visuais
├── tests/
│   ├── run_all.js                  # Executor central da suíte de testes
│   ├── test_csv_engine.js          # Testes unitários do motor de parsing
│   ├── test_edge_cases.js          # Validação de limites (BOM, 10.000 linhas, formato brasileiro)
│   ├── test_new_features.js        # Testes de layout e reordenação (15.000 linhas)
│   ├── test_column_resizing_and_autofit.js # Verificação de redimensionamento e CSS
│   ├── test_app_deep_verification.js # Teste de integridade de componentes de interface
│   ├── test_pwa_and_structure.js   # Validação de manifesto PWA e Service Worker
│   ├── test_excel_support.js       # Testes de importação e exportação Excel (.xlsx e .xls)
│   └── test_in_browser.js          # Teste ponta a ponta no navegador headless via CDP
├── index.html                      # Interface principal do aplicativo
├── style.css                       # Folha de estilos e temas Liquid Glass
├── app.js                          # Lógica da aplicação, eventos e manipulação de interface
├── csv-engine.js                   # Motor de processamento tabular RFC-4180
├── sw.js                           # Service Worker para operação offline
├── manifest.webmanifest            # Manifesto de configuração PWA
├── favicon.ico                     # Favicon padrão
├── sample_data.csv                 # Arquivo de dados de demonstração em CSV
├── teste_produtos.xls              # Planilha de teste demonstrativa com múltiplas abas
├── teste_clientes.xls              # Planilha de teste demonstrativa simples
├── Lumio CSV.vbs                   # Inicializador silencioso no Windows sem console
├── abrir_visualizador.bat          # Inicializador clássico em lote
├── package.json                    # Configuração de scripts e metadados npm
├── LICENSE                         # Licença MIT
└── README.md                       # Documentação principal
```

---

## Testes Automatizados

O projeto conta com **8 suítes de testes automatizados**, cobrindo conformidade RFC-4180, interoperabilidade com planilhas Excel, desempenho com mais de 15.000 registros, integridade de layout, cálculos de auto-fit, manifesto PWA e execução ponta a ponta em navegador headless.

Para rodar toda a suíte de testes:

```bash
npm test
```

Para executar uma suíte específica:
```bash
node tests/test_csv_engine.js
node tests/test_excel_support.js
node tests/test_edge_cases.js
node tests/test_pwa_and_structure.js
```

---

## Contribuição

Contribuições, correções e sugestões são bem-vindas:

1. Faça um Fork do repositório.
2. Crie uma branch para sua alteração: `git checkout -b feature/nome-da-alteracao`.
3. Registre suas modificações: `git commit -m 'feat: descricao objetiva da melhoria'`.
4. Envie para o repositório remoto: `git push origin feature/nome-da-alteracao`.
5. Abra um Pull Request.

Caso identifique falhas ou tenha propostas de melhoria, utilize a seção de [Issues](https://github.com/marlonhms/Lumio-CSV/issues).

---

## Licença

Distribuído sob a licença **MIT**. Para detalhes, consulte o arquivo [LICENSE](LICENSE).

---

<div align="center">
  Desenvolvido por <b><a href="https://github.com/marlonhms">Marlon Henrique Serpa</a></b>
</div>
