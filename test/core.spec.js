// https://github.com/sindresorhus/normalize-newline
// Normalize the newline characters in a string to `\n`
const normalizeNewline = require('normalize-newline')

const {
  mockRender,
  mockBundleAndRun
} = require('./utils')

test('basic', done => {
  mockBundleAndRun({
    target: 'basic.vue'
  }, ({ window, module }) => {
    const vnode = mockRender(module, {
      msg: 'hi'
    })

    // <h2 class="red">{{msg}}</h2>
    expect(vnode.tag).toBe('h2')
    expect(vnode.data.staticClass).toBe('red')
    expect(vnode.children[0].text).toBe('hi')

    expect(module.data().msg).toContain('Hello from Component A!')
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain('comp-a h2 {\n  color: #f00;\n}')
    done()
  })
})
