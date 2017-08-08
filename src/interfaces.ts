export interface RouteDefinitionsMap {
    [sourcePath: string]: any;
}

export interface RouteDefinitionsArray {
    [sourceIndex: number]: any;
}

export interface RouteMatcherReturn {
    path: string;
    value: any;
}

export interface RouteMatcher {
    (
        path: string,
        routes: RouteDefinitionsMap | RouteDefinitionsArray
    ): RouteMatcherReturn;
}
