import 'reflect-metadata'
import Koa from 'koa'
import KoaRouter, { IRouterContext, IMiddleware } from 'koa-router'
import { ConfigOption, RouterConfig, ParamsTypes, FuncParamConfig, Methods } from './types'

// create koa instance and set router
export const createKoaServer = ({ controllers }: ConfigOption) => {
  // create Koa instance
  const app = new Koa()
  // config routers
  controllers.forEach(Controller => {
    const router = Controller.__routers
    app.use(router.routes()).use(router.allowedMethods())
  })
  return app
}

// class decorator
export const Controller = (prefix: string = '') => ((target: any) => {
  const router = new KoaRouter({ prefix })
  const classPrototype = target.prototype
  const routersMethods = classPrototype.__routerMethods

  // loop routers config
  Object.keys(routersMethods).forEach((funcName: string) => {
    const { path, method, routerFunc }: RouterConfig = routersMethods[funcName]
    // set router config
    router[method](path, <IMiddleware>routerFunc)
  })

  target.__routers = router
})

// method decorator
export const Get = (path: string = '*') => ((target: any, funcName: string, descriptor: PropertyDescriptor) => {
  if (target.__routerMethods === undefined) target.__routerMethods = {}
  // origin function
  const originFunc = descriptor.value
  const funcParamInfo = target[`__func_${funcName}_param`] || {}
  // max params length
  const paramLength = Math.max.apply(null, Object.keys(funcParamInfo)) + 1
  // the metadata reflection
  const paramTypes = Reflect.getMetadata('design:paramtypes', target, funcName)

  async function routerFunc (ctx: IRouterContext, next: Function) {
    const args: any[] = []
    // inject params
    for (let i = 0; i < paramLength; i += 1) {
      const paramInfo: FuncParamConfig = funcParamInfo[i]
      if (paramInfo === undefined) {
        args.push(undefined)
        continue
      }
      const { type, paramArgs } = paramInfo
      // inject something with ParamsTypes
      switch (type) {
        case ParamsTypes.Ctx:
          args.push(ctx)
        break
        case ParamsTypes.Params:
          args.push(convertType(ctx.params[paramArgs[0]], paramTypes[i]))
        break
        case ParamsTypes.QueryParams:
          args.push(convertType(ctx.query[paramArgs[0]], paramTypes[i]))
        break
      }
    }

    ctx.body = originFunc(...args)
  }

  target.__routerMethods[funcName] = {
    // convert /xx => xx
    path: path.substr(1),
    method: Methods.Get,
    routerFunc,
  }
})

export const Ctx = paramFactory(ParamsTypes.Ctx)
export const Params = paramFactory(ParamsTypes.Params)
export const QueryParams = paramFactory(ParamsTypes.QueryParams)

// parameter decorator factory
function paramFactory (paramType: ParamsTypes) {
  // parameter decorator
  return (...paramArgs: any) => (target: any, funcName: string, paramIndex: number) => {
    const funcParamKey = `__func_${funcName}_param`
    // init object
    if (target[funcParamKey] === undefined) target[funcParamKey] = {}
    // cache parameterIndex data
    target[funcParamKey][paramIndex] = {
      type: paramType,
      paramArgs,
    }
  }
}

// convert type
function convertType (value: any, type: any): any {
  if (value === undefined) return value
  switch (type) {
    case Number:
      value = Number(value)
    break
    case String:
      value = String(value)
    break
    case Boolean:
      value = Boolean(value)
    break
  }
  return value
}