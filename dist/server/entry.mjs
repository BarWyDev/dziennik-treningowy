import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DG0wyOmC.mjs';
import { manifest } from './manifest_C7mkfQF2.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/_---all_.astro.mjs');
const _page2 = () => import('./pages/api/dashboard.astro.mjs');
const _page3 = () => import('./pages/api/goals/_id_/achieve.astro.mjs');
const _page4 = () => import('./pages/api/goals/_id_/archive.astro.mjs');
const _page5 = () => import('./pages/api/goals/_id_.astro.mjs');
const _page6 = () => import('./pages/api/goals.astro.mjs');
const _page7 = () => import('./pages/api/personal-records/stats.astro.mjs');
const _page8 = () => import('./pages/api/personal-records/_id_.astro.mjs');
const _page9 = () => import('./pages/api/personal-records.astro.mjs');
const _page10 = () => import('./pages/api/training-types/_id_.astro.mjs');
const _page11 = () => import('./pages/api/training-types.astro.mjs');
const _page12 = () => import('./pages/api/trainings/_id_.astro.mjs');
const _page13 = () => import('./pages/api/trainings.astro.mjs');
const _page14 = () => import('./pages/auth/forgot-password.astro.mjs');
const _page15 = () => import('./pages/auth/login.astro.mjs');
const _page16 = () => import('./pages/auth/register.astro.mjs');
const _page17 = () => import('./pages/auth/reset-password.astro.mjs');
const _page18 = () => import('./pages/auth/verify.astro.mjs');
const _page19 = () => import('./pages/dashboard.astro.mjs');
const _page20 = () => import('./pages/goals.astro.mjs');
const _page21 = () => import('./pages/personal-records.astro.mjs');
const _page22 = () => import('./pages/trainings/new.astro.mjs');
const _page23 = () => import('./pages/trainings/_id_/edit.astro.mjs');
const _page24 = () => import('./pages/trainings/_id_.astro.mjs');
const _page25 = () => import('./pages/trainings.astro.mjs');
const _page26 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.16.11_@types+node@2_eb5b3c6cbaeb36d35d4d6ff5ab851058/node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/auth/[...all].ts", _page1],
    ["src/pages/api/dashboard.ts", _page2],
    ["src/pages/api/goals/[id]/achieve.ts", _page3],
    ["src/pages/api/goals/[id]/archive.ts", _page4],
    ["src/pages/api/goals/[id].ts", _page5],
    ["src/pages/api/goals/index.ts", _page6],
    ["src/pages/api/personal-records/stats.ts", _page7],
    ["src/pages/api/personal-records/[id].ts", _page8],
    ["src/pages/api/personal-records/index.ts", _page9],
    ["src/pages/api/training-types/[id].ts", _page10],
    ["src/pages/api/training-types/index.ts", _page11],
    ["src/pages/api/trainings/[id].ts", _page12],
    ["src/pages/api/trainings/index.ts", _page13],
    ["src/pages/auth/forgot-password.astro", _page14],
    ["src/pages/auth/login.astro", _page15],
    ["src/pages/auth/register.astro", _page16],
    ["src/pages/auth/reset-password.astro", _page17],
    ["src/pages/auth/verify.astro", _page18],
    ["src/pages/dashboard.astro", _page19],
    ["src/pages/goals/index.astro", _page20],
    ["src/pages/personal-records/index.astro", _page21],
    ["src/pages/trainings/new.astro", _page22],
    ["src/pages/trainings/[id]/edit.astro", _page23],
    ["src/pages/trainings/[id]/index.astro", _page24],
    ["src/pages/trainings/index.astro", _page25],
    ["src/pages/index.astro", _page26]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Users/bwysocki/projekt-dziennik-treningowy/dist/client/",
    "server": "file:///C:/Users/bwysocki/projekt-dziennik-treningowy/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
