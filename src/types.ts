
export interface ConfigOption {
  controllers: any[]
}

export enum ParamsTypes {
  Ctx,
  Params,
  QueryParams
}

export enum Methods {
  Get = 'get'
}

export interface RouterConfig {
  path?: string
  method: Methods
  routerFunc: Function
}

export interface FuncParamConfig {
  type: ParamsTypes
  paramArgs: any
}
