# codemirror-typst

[Typst](https://typst.app) language support for [CodeMirror 6](https://codemirror.net).

- **Pure TypeScript.** A hand-written parser built on `@lezer/common` — no WASM, no grammar codegen, nothing to load asynchronously.
- **Markup, math and code modes**, mirroring the structure of Typst's own parser.
- **Syntax highlighting** through standard `@lezer/highlight` tags, so any CodeMirror theme works.
- **Folding and indentation** for code blocks, content blocks, raw blocks and equations.
- **Nested languages** inside raw blocks (`` ```rust … ``` ``).
- A real **Lezer syntax tree** you can query for outlines, word counts, completion context, and so on.

It is the parser behind the [Typwriter](https://github.com/Ahdeyyy/typwriter) desktop and mobile editors.

## Install

```sh
npm install codemirror-typst
```

`@codemirror/language`, `@lezer/common` and `@lezer/highlight` are peer dependencies. If you already use CodeMirror they are in your tree; npm, pnpm and bun install them automatically otherwise.

## Usage

```ts
import { EditorView, basicSetup } from "codemirror"
import { typst } from "codemirror-typst"

new EditorView({
  doc: "= Hello\n\nSome *bold* text and $x^2$.",
  extensions: [basicSetup, typst()],
  parent: document.body,
})
```

`basicSetup` includes CodeMirror's default highlight style. To colour things yourself, pair `typst()` with any theme or your own `HighlightStyle`:

```ts
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"

const style = HighlightStyle.define([
  { tag: t.heading, fontWeight: "bold" },
  { tag: t.keyword, color: "#7c3aed" },
  { tag: t.function(t.variableName), color: "#2563eb" },
  { tag: t.labelName, color: "#0d9488" },
])

const extensions = [typst(), syntaxHighlighting(style)]
```

### Highlighting code inside raw blocks

Pass `codeLanguages` to highlight fenced raw blocks with their own language:

```ts
import { languages } from "@codemirror/language-data"
import { typst } from "codemirror-typst"

typst({ codeLanguages: languages })
```

`codeLanguages` is a list of `LanguageDescription`s or a function from the info string to a language. `defaultCodeLanguage` sets the language for raw blocks without a tag.

### Using the syntax tree

Inside an editor, use `syntaxTree(state)` as usual. Outside one, the standalone parser works on plain strings:

```ts
import { parser, Type } from "codemirror-typst"

const src = "= Intro\n== Details"
const headings: string[] = []
parser.parse(src).iterate({
  enter(node) {
    if (node.type.id === Type.Heading) headings.push(src.slice(node.from, node.to))
  },
})
```

## API

| Export | Description |
| --- | --- |
| `typst(config?)` | `LanguageSupport` for Typst. Options: `codeLanguages`, `defaultCodeLanguage`. |
| `typstLanguage` | The `Language` instance, without nested raw-block parsing. |
| `parser` | The standalone `TypstParser` (a Lezer `Parser`). |
| `Type` | Enum of node type ids (`Type.Heading`, `Type.Raw`, …). |
| `nodeSet` | The `NodeSet` the parser builds trees with. |
| `highlight` | The `styleTags` node prop mapping nodes to highlight tags. |
| `parseCode({ codeParser })` | A `parseMixed` wrapper for nesting parsers in raw blocks; pass it to `parser.configure({ wrap })`. |
| `getCodeParser(languages, default?)` | Turns `LanguageDescription`s into a `codeParser` function. |
| `TypstParser`, `TypstParseContext`, `Elt` | Parser internals, exported for advanced use. |

## One copy of Lezer

`@lezer/common` hands out node-prop ids from a module-level counter, so two copies in one bundle break highlighting silently (text renders uncoloured, or you get `tags is not iterable`). This package declares its CodeMirror and Lezer dependencies as peers so it always shares the host's copy. If highlighting does nothing, run `npm ls @lezer/common` and make sure there is exactly one version; with Vite, `resolve.dedupe: ["@lezer/common", "@lezer/highlight", "@codemirror/language", "@codemirror/state"]` is a reliable backstop.

## Development

```sh
bun install
bun test            # parser + language tests
bun run check-types
bun run build       # ESM + CJS + typings into dist/
```

The parser lives in `src/parser/` and is edited directly — there is no grammar file. Add a test to `test/` with every parser fix.

Releases are published by the `publish` workflow when a `v*` tag is pushed.

## License

MIT
