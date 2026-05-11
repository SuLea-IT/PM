import { createRouter, createWebHashHistory } from 'vue-router'
import About from '../components/About.vue'
import References from '../components/References.vue'
import Forum from '../components/Forum.vue'
import MainLayout from '../layouts/MainLayout.vue'
import GlobalLayout from '../layouts/GlobalLayout.vue'
import { trackVisitorRoute } from '../utils/visitorTracker'

const routes = [
    {
        path: '/',
        redirect: '/home',
        component: GlobalLayout,
        children: [
            {
                path: 'home',
                component: About
            },
            {
                path: 'about',
                redirect: '/home'
            },
            {
                path: 'forum',
                component: Forum
            },
            {
                path: 'references',
                component: References
            },
            {
                path: '/VisitorStats',
                component: () => import('../views/VisitorStats.vue')
            },
        ]
    },
    {
        path: '/analyse',
        component: MainLayout, // 仅在/analyse及其子页面使用MainLayout
        children: [
            {
                path: '',
                component: () => import('../views/Platform.vue')
            },
            {
                path: 'Platform',
                component: () => import('../views/Platform.vue')
            },
            {
                path: 'UploadData',
                component: () => import('../views/UploadData.vue')
            },
            {
                path: 'VisitorStats',
                redirect: '/VisitorStats'
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.afterEach((to) => {
    trackVisitorRoute(to)
})

export default router
