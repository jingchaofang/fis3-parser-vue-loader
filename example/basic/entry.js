import Component from 'basic.vue'
import * as exports from 'basic.vue'

if (typeof window !== 'undefined') {
  window.module = Component
  window.exports = exports
}

new Vue({
  el: '#app',
  render: h => h(Component)
})

export default Component

