import { Context } from 'koa'
import { Controller, Get, Ctx, Params, QueryParams } from './routing-controllers'

@Controller('/')
export default class IndexController {
  @Get('/')
  index () {
    return 'index page'
  }

  @Get('/info')
  info (@Ctx() ctx: Context) {
    return `info href: ${ctx.href}`
  }

  @Get('/user/:id')
  user (
    @Ctx() ctx: Context,
    @Params('id') id: number,
    @QueryParams('uid') uid: string,
    @QueryParams('isVip') isVip: boolean
  ) {
    console.log(ctx.query, ctx.params)
    return {
      paramId: id,
      queryUid: uid,
      isVip,
    }
  }
}