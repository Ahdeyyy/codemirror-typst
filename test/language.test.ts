import { describe, expect, test } from "bun:test"
import { EditorState } from "@codemirror/state"
import { ensureSyntaxTree, foldable, LanguageDescription } from "@codemirror/language"
import { highlightTree, tagHighlighter, tags as t } from "@lezer/highlight"

import { typst, typstLanguage, parser, Type } from "../src"

const highlighter = tagHighlighter([
  { tag: t.heading, class: "heading" },
  { tag: t.keyword, class: "keyword" },
  { tag: t.strong, class: "strong" },
  { tag: t.lineComment, class: "comment" },
  { tag: t.string, class: "string" },
])

/** Every highlighted span of `src`, as `class:text`. */
function highlights(src: string): string[] {
  const out: string[] = []
  highlightTree(typstLanguage.parser.parse(src), highlighter, (from, to, cls) => {
    out.push(`${cls}:${src.slice(from, to)}`)
  })
  return out
}

describe("typst language", () => {
  test("highlight tags reach the tree", () => {
    const spans = highlights('= Title\n#let x = "hi" // note\n*bold*')
    expect(spans).toContain("keyword:let")
    expect(spans).toContain("comment:// note")
    expect(spans.some((s) => s.startsWith("heading:"))).toBe(true)
    expect(spans.some((s) => s.startsWith("string:"))).toBe(true)
    expect(spans.some((s) => s.startsWith("strong:"))).toBe(true)
  })

  test("typst() installs the language in an editor state", () => {
    const doc = "#let f(x) = {\n  x + 1\n}\n"
    const state = EditorState.create({ doc, extensions: [typst()] })
    const tree = ensureSyntaxTree(state, doc.length, 1000)!
    expect(tree.type.name).toBe("Document")
    expect(state.languageDataAt<{ line: string }>("commentTokens", 0)[0].line).toBe("//")
    // The `{ … }` block on line 1 folds between its braces.
    const line = state.doc.line(1)
    expect(foldable(state, line.from, line.to)).toEqual({
      from: doc.indexOf("{") + 1,
      to: doc.indexOf("}"),
    })
  })

  test("raw blocks nest a configured code language", () => {
    const doc = "```typ\n#let x = 1\n```\n"
    const at = doc.indexOf("let")
    // Overlay-mounted trees are only reachable through resolveInner.
    const plain = typst().language.parser.parse(doc)
    expect(plain.resolveInner(at, 1).name).toBe("RawCode")

    const support = typst({
      codeLanguages: [LanguageDescription.of({ name: "typ", support: typst() })],
    })
    const nested = support.language.parser.parse(doc)
    expect(nested.resolveInner(at, 1).name).toBe("Let")
  })

  test("Type ids match the node set", () => {
    expect(Type.Raw).toBeGreaterThan(0)
    expect(parser.nodeSet.types[Type.Raw].name).toBe("Raw")
    expect(parser.nodeSet.types[Type.Heading].name).toBe("Heading")
  })
})
