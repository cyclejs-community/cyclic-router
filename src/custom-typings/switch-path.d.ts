declare module 'switch-path' {
  export interface RouteDefinitions {
    [sourcePath: string]: any;
  }

  export interface SwitchPathReturn {
    path: string;
    value: any;
  }

  export default function switchPath(sourcePath: string, routes: RouteDefinitions): SwitchPathReturn;
}
