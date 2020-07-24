import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import JsonViewer from 'vue-json-viewer'
import TreeView from "vue-json-tree-view"
import VueJsonEditor from 'vue-json-editor'
Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(JsonViewer);
Vue.use(TreeView);
Vue.use(VueJsonEditor);

new Vue({
  el: '#app',
  render: h => h(App)
});
