import Vue from 'vue';
import Router from 'vue-router';
import HomePage from './components/pages/Home.vue';
import DocumentationPage from './components/pages/Documentation.vue';
import UnknownRoutePage from './components/pages/UnknownRoute.vue';
import DocsLoader from './components/docs/Loader.vue';
import DocsViewer from './components/docs/Viewer.vue';
import FileViewer from './components/docs/FileViewer.vue';
import ClassViewer from './components/docs/class-viewer/ClassViewer.vue';
import TypedefViewer from './components/docs/TypedefViewer.vue';
import DocsSearch from './components/docs/Search.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/docs', name: 'docs', component: DocumentationPage, children: [
      { path: ':source', name: 'docs-source', component: DocsLoader, children: [
        { path: ':tag', name: 'docs-tag', component: DocsViewer, meta: {
          title: route => {
            const { class: clarse, typedef, file } = route.params;
            const name = clarse || typedef || file || 'Search';
            let rest = '';
            if (name === 'Search') {
              const query = route.query.q;
              if (query) rest = `: ${query}`;
            } else if (clarse) {
              const param = route.query.scrollTo;
              if (param) rest = `${param.startsWith('s-') ? `.${param.slice(2)}` : `#${param}`}`;
            }
            return `${name}${rest} | discord.js`;
          },
        },
        children: [
          { path: 'search', name: 'docs-search', component: DocsSearch },
          { path: 'class/:class', name: 'docs-class', component: ClassViewer },
          { path: 'typedef/:typedef', name: 'docs-typedef', component: TypedefViewer },
          { path: ':category/:file', name: 'docs-file', component: FileViewer },
        ] },
      ] },
    ] },

    // Old URLs
    { path: '/!', redirect: { name: 'home' }, children: [
      { path: 'docs', redirect: { name: 'docs' }, children: [
        { path: 'tag/:tag', redirect(to) {
          return {
            name: 'docs-tag',
            params: { source: 'main', tag: to.params.tag },
            query: { scrollTo: to.query.scrollto },
          };
        }, children: [
          { path: 'file/:category/:file', redirect(to) {
            return {
              name: 'docs-file',
              params: { source: 'main', tag: to.params.tag, category: to.params.category, file: to.params.file },
              query: { scrollTo: to.query.scrollto },
            };
          } },
          { path: 'class/:class', redirect(to) {
            return {
              name: 'docs-class',
              params: { source: 'main', tag: to.params.tag, class: to.params.class },
              query: { scrollTo: to.query.scrollto },
            };
          } },
          { path: 'typedef/:typedef', redirect(to) {
            return {
              name: 'docs-typedef',
              params: { source: 'main', tag: to.params.tag, typedef: to.params.typedef },
              query: { scrollTo: to.query.scrollto },
            };
          } },
        ] },
      ] },
    ] },

    // Catch-all
    { path: '*', component: UnknownRoutePage },
  ],
});

router.beforeEach((to, _, next) => {
  const parent = to.matched.find(r => r.name === 'docs-tag');
  document.title = parent ? parent.meta.title(to) : 'discord.js';

  next();
});

export default router;
