# Scripts de Automação

Este diretório contém os scripts principais responsáveis pelo fluxo de desenvolvimento, empacotamento, validação e manutenção (traduções) da aplicação Doit via Flatpak.

Eles são amplamente utilizados diretamente (via terminal) ou abstraídos pelos atalhos do `package.json` (`yarn dev`, `yarn prod:export`, etc.). O fluxo foi pensado para agilizar as compilações do Flatpak e simplificar o dia a dia.

---

## Fluxo de Trabalho Esperado

1. **Desenvolvimento Diário**: Você criará seu código e usará majoritariamente o `run.sh` no modo `--watch` e `--compile`. (Na prática, `yarn dev`).
2. **Atualização de Dependências**: Adicionou/removeu pacotes no `package.json`? Rode obrigatóriamente o `generate-sources.sh` (`yarn flatpak:generate-sources`) para garantir o build offline.
3. **Internacionalização**: Adicionou textos novos (`_('Texto')`) no código? Rode `update-pot-file.sh` para reconstruir os pot/pos.
4. **Validação**: Antes de criar releases ou subir features grandes, `flatpak-validation.sh` (`yarn dev:validate`).
5. **Distribuição**: Quando for testar o pacote fechado localmente ou gerar o `.flatpak`, use o `install.sh` (`yarn prod:export`).

---

## Documentação dos Scripts

### 1. `run.sh`

Roda o aplicativo localmente, com suporte a watch para reinicializção rápida. Não instala o aplicativo no sistema.

**Argumentos:**

- `-c` ou `--compile`: Invoca o `compile.sh` antes de rodar o aplicativo.
- `-w` ou `--watch`: Modo interativo. Após fechar o app, você pode pressionar `[R]` para compilar/rodar de novo rapidamente sem precisar fechar o terminal.
- `<manifest.json>`: **Obrigatório.** O qual manifesto Flatpak utilizar (`io.github.andrepg.Doit.Devel.json` ou `io.github.andrepg.Doit.json`).

> _Exemplo:_ `./scripts/run.sh -c -w io.github.andrepg.Doit.Devel.json` (Equivalente ao `yarn dev` do projeto)

### 2. `compile.sh`

Script basilar que invoca o `flatpak-builder` para criar/processar o manifesto na pasta `_build` usando o cache.

**Argumentos:**

- `--clean` ou `-C`: Executa uma deleção completa manual do cache de build em `.flatpak-builder/build` e `.flatpak-builder/rofiles` antes da build começar.
- `[manifest.json]`: O pcaminho opcional do arquivo (padrao: `io.github.andrepg.Doit.json`).
- `[build-dir]`: Informa a pasta de saida do build (padrao `_build`).

### 3. `install.sh`

Responsável por instalar o app Flatpak na sua máquina **ou** compilar um bundle final isolado arquivo `.flatpak` para ser exportado.

**Argumentos:**

- `-c` ou `--compile`: Invoca o `compile.sh` antes de tentar instalar/exportar.
- `-C` ou `--clean`: O mesmo acima, mas forçando limpeza cache profunda.
- `-e` ou `--export`: Se ativado, em vez de usar `flatpak install --user`, o script gerará um pacote de instalação no final `<app_id>.flatpak`. O manifest determina o NOME deste arquivo que será emitido.

> _Exemplo:_ `./scripts/install.sh -c -e io.github.andrepg.Doit.json` (Equivalente a rodar `yarn prod:export` para exportar o projeto).

### 4. `generate-sources.sh`

Processa o `yarn.lock` e atualiza o `flatpak/generated-sources.json`.
Este arquivo é o pilar que o manifest do Flatpak usa para fazer o download offline de todos os seus pacotes Node/Vitest/Eslint antes do build iniciar. **Sempre rode este arquivo se o seu yarn.lock for alterado.**

**Requisitos**: `flatpak-node-generator`. (O script tentará instalá-lo sozinho via `pipx` se não for encontrado).

### 5. `flatpak-validation.sh`

Usa a ferramenta `flatpak-builder-lint` para verificar se há algum erro estrutural, metadados faltando e valida a integridade conforme especificações do AppStream e Flathub.

**Argumentos:**

- `[manifest.json]`: Caminho do arquivo a ser validado (padrao: `io.github.andrepg.Doit.json`).

### 6. `update-pot-file.sh`

Utiliza o sistema de build _Meson_ para ler os arquivos typescript, js e layouts XML `.ui` varrendo por tags/textos traduzíveis (ex: unções gettext como `_("Minha String")`) criando os `.POT` primário e atualiza os arquivos `.PO` (como em `po/pt_BR/LC_MESSAGES/pt_BR.po`) sem perder o trabalho dos tradutores já feito.

---

## Fluxo Num Pipeline de CI/CD (Release / Flathub)

Uma esteira de automação (ex: GitHub Actions) ou os próprios servidores do Flathub irão implicitamente seguir estas etapas reproduzidas pelos nossos scripts:

1. **Baixar o Código e Dependências**: Usa o nosso [Manifesto JSON](../flatpak) para listar o que compilar primariamente, consumindo os módulos declarados em `flatpak/generated-sources.json`.
2. **Lint & Testes (QA)**: Caso necessário, rodam testes Vitest, Eslint e conferências para barrar commits quebrados na esteira.
3. **Meson Setup & Compile**: O construtor orquestra o `Meson`, que aciona o TypeScript (`tsc`) para gerar o JS, agrupa os ícones, os layouts GTK (`.ui`), esquemas GSettings (`.gschema.xml`) gerando binários agregados (`.gresource`).
4. **Validação Flatpak (Linting)**: Garante que nosso `io.github.andrepg.Doit.metainfo.xml.in` descreva as screenshots, releases e policies corretamente, tal como nossa validação em `flatpak-validation.sh`.
5. **Exportação Final**: Pega o diretório da _build_ e gera o pacote oficial / instala no repositório final tal como nosso script `install.sh -e` faz para uso local.
