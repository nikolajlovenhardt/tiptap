import { Node } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import { Fragment } from 'prosemirror-model'
import SuggestionsPlugin from '../plugins/Suggestions'

export default class Emoji extends Node {

  get name() {
    return 'emoji'
  }

  get defaultOptions() {
    return {
      matcher: {
        char: ':',
        allowSpaces: false,
        startOfLine: false,
      },
      emojiClass: 'emoji',
      suggestionClass: 'emoji-suggestion',
    }
  }

  getLabel(dom) {
    return dom.innerText.split(this.options.matcher.char).join('')
  }

  createFragment(schema, label) {
    return Fragment.fromJSON(schema, [{ type: 'text', text: `${label}` }])
  }

  insertEmoji(range, attrs, schema) {
    const nodeType = schema.nodes[this.name]
    const nodeFragment = this.createFragment(schema, attrs.label)
    return replaceText(range, nodeType, attrs, nodeFragment)
  }

  get schema() {
    return {
      attrs: {
        id: {},
        label: {},
      },
      group: 'inline',
      inline: true,
      content: 'text*',
      selectable: false,
      atom: true,
      toDOM: node => [
        'span',
        {
          class: this.options.emojiClass,
          'data-emoji-id': node.attrs.id,
        },
        `${node.attrs.label}`,
      ],
      parseDOM: [
        {
          tag: 'span[data-emoji-id]',
          getAttrs: dom => {
            const id = dom.getAttribute('data-emoji-id')
            const label = this.getLabel(dom)
            return { id, label }
          },
          getContent: (dom, schema) => {
            const label = this.getLabel(dom)
            return this.createFragment(schema, label)
          },
        },
      ],
    }
  }

  commands({ schema }) {
    return attrs => this.insertEmoji(null, attrs, schema)
  }

  get plugins() {
    return [
      SuggestionsPlugin({
        command: ({ range, attrs, schema }) => this.insertEmoji(range, attrs, schema),
        appendText: ' ',
        matcher: this.options.matcher,
        items: this.options.items,
        onEnter: this.options.onEnter,
        onChange: this.options.onChange,
        onExit: this.options.onExit,
        onKeyDown: this.options.onKeyDown,
        onFilter: this.options.onFilter,
        suggestionClass: this.options.suggestionClass,
      }),
    ]
  }

}
