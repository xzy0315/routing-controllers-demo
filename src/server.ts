import 'reflect-metadata'
import { createKoaServer } from './routing-controllers'
import IndexController from './IndexController'

const app = createKoaServer({
  controllers: [IndexController],
})

app.listen('3000', () => {
  console.log('server listen to 3000')
})