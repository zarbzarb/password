import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vant/lib/index.css'
import { 
  Button, 
  Icon, 
  Search, 
  FloatingBubble,
  Dialog,
  Toast,
  Popup
} from 'vant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.use(Button)
app.use(Icon)
app.use(Search)
app.use(FloatingBubble)
app.use(Dialog)
app.use(Toast)
app.use(Popup)

app.mount('#app')