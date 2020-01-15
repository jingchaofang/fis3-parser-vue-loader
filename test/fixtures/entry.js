import Component from 'basic.vue'
import * as exports from 'basic.vue'

if (typeof window !== 'undefined') {
  window.module = Component
  window.exports = exports
}

export default Component