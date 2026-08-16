import { form, get, post, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: '/',
  auth: route('auth', {
    register: form('register'),
    login: form('login'),
    logout: post('logout'),
  }),
})
