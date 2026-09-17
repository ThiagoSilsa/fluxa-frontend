# ADR 0001 — Tradução de erro e desfecho no cliente

Número do ADR: 0001
Título: O cliente é dono do texto: tradução por código, catálogo gerado do backend e toast agregado de validação
Data: 2026-09-17
Responsável: Thiago

## Contexto

Todo texto que o usuário lê é escrito aqui: é o cliente que conhece o idioma ativo e o rótulo dos campos. O servidor devolve o **código** da resposta (contrato registrado no ADR 0016 do repositório `fluxa-backend`) e este repositório o transforma em texto.

O que existe hoje não sustenta isso:

- O mapa de códigos é mantido à mão (`src/shared/enum/api-error-key.ts`, 126 códigos + 3 chaves semânticas) e nada garante que ele acompanhe o backend: mensagem nova lá vira mensagem genérica aqui, em silêncio.
- O cliente **espelha** o algoritmo de derivação do servidor (`deriveServerCode`) para adivinhar a tradução a partir do texto cru de `message` e de `blockRequestError` — dois lugares onde a mesma regra precisa ser mantida.
- Erro de validação do backend chega como lista de frases em inglês (`class-validator`), sem campo e sem código: a tela mostra "Erro de validação" mesmo quando falta um campo obrigatório.
- O diálogo do job de importação renderiza texto persistido pelo servidor (`errorMessage`, em português) direto na interface.

## Decisão

### 1. O cliente é dono do texto — mensagem do servidor nunca é renderizada

O texto exibido sai sempre da tradução de um código (`errors.server.<CODIGO>` no conjunto comum, ou a chave semântica quando existe). A mensagem do servidor é texto de desenvolvimento e log: não é exibida em nenhum idioma, nem como último recurso — a reserva de um código sem tradução é o genérico traduzido (`errors.generic`).

### 2. O catálogo de códigos é gerado a partir do backend

O script `npm run errors:sync` varre o `fluxa-backend` (caminho configurável, `../fluxa-backend` por padrão), extrai as mensagens e aplica o mesmo algoritmo do filtro, reescrevendo o arquivo de códigos commitado. Um teste falha quando o arquivo gerado fica desatualizado; quando o backend não está no ambiente, o teste pula com mensagem explícita. O arquivo não é editado à mão.

### 3. A derivação sai do cliente

`deriveServerCode` é removido. As fontes de código passam a ser as que o servidor envia: `payload.code` (erro), `response.code` (desfecho da operação) e `blockRequestErrorCode` (aviso do pedido de bloqueio). Um algoritmo a menos para manter em sincronia.

### 4. Validação estruturada vira um toast agregado

O erro de validação traz `details[{ field, code, params }]`. A tela mostra **um** toast com as violações no formato "Campo: regra" (ex.: "E-mail: formato inválido · Placa: obrigatório"), usando os textos de `errors.validation.<CODIGO>` e o rótulo do campo num mapa central `fields.<propriedade>` (fallback: o nome técnico da propriedade). `details` vazio cai em `errors.validation`; código sem tradução cai em `errors.generic`.

### 5. Sem marcação de campo no formulário

A superfície do erro é o toast: este ciclo não marca o campo com `setError`. Fica registrado que marcar o campo é a evolução natural quando a validação do servidor passar a ser a via comum de erro em formulário.

### 6. Cliente e servidor sobem juntos; a importação fica para um ticket próprio

Não há camada de compatibilidade com os códigos de antes — os dois lados são publicados juntos. O diálogo do job de importação continua mostrando o texto em português persistido pelo servidor até o ticket que leva `error_code` e `error_params` para o job.

## Consequências

- Todo código novo precisa de chave nos três idiomas; sem ela o teste de paridade fica vermelho e a interface mostra o genérico — a falha aparece no CI, não em produção.
- O mapa `fields.<propriedade>` precisa cobrir as propriedades que o servidor valida, com rótulo curto nos três idiomas.
- Menos código no cliente: saem o algoritmo espelhado e o mapa mantido à mão.
- O diálogo do job de importação é o último ponto com texto cru do servidor (limite registrado).
- A lista de códigos deixa de ser decisão de quem mexe no cliente: ela é derivada do backend, e adicionar um código lá não exige nenhum passo manual aqui além de escrever a tradução.

## Alternativas consideradas

- **Manter `deriveServerCode` como rede** — rejeitada. Seriam dois algoritmos (o do servidor e a cópia do cliente) e a chance de derivar um código que o backend já não usa.
- **Marcar o campo do formulário em vez de toast** — rejeitada neste ciclo. Daria destaque no campo, mas exige a validação do servidor como via comum e não cobre os erros que não têm campo.
- **Um toast por violação** — rejeitada. Um formulário com cinco violações empilharia cinco toasts.
- **Traduzir no servidor (`Accept-Language`)** — rejeitada. Espalharia i18n por dois repositórios e o cliente continuaria dono do rótulo dos campos.
- **Mapa de códigos mantido à mão** — rejeitada. Foi assim até aqui e nada garantia que acompanhasse o backend.
