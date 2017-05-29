
/*
let hash: string = window.location.hash;
hash = window.location.href.split('#')[1] || '';
console.log('router.debug: hash = ' + hash);


(function (path : string) {
  var current = window.location.href;
  window.location.href = current.replace(/#(.*)$/, '') + '#' + path;
})('chris/aliotta/');


var stateObj = { foo: "bar" };
history.pushState(stateObj, "page 2", "bar.html")

window.onpopstate = function (event) {
  console.log('state: ' + JSON.stringify(event.state));
};
*/

class Router {
    public mode: RoutingMode = RoutingMode.Classic;

    public routes: UrlRoute[] = [];

    public add(path: string, callback: (path: string, params: string[]) => {}): void {
        this.routes.push(new UrlRoute(path, callback));
    }

    public remove(path: string): boolean {
        for (let i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
            if (r.path == path) {
                this.routes.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public flush(): void {
        this.routes = [];
    }

    public route(url: string): boolean {
        let route: RouteParams = new RouteParams(url);
        let urlRoute: UrlRoute = this.getRoute(route.path);

        if(urlRoute){
            urlRoute.callback(route.path, route.params);
            this.updateUrlLocation(url);
            return true;
        }

        return false;
    }

    /* Needs to take full url and only save from the # onward*/
    /** This function needs to be updated with path string */
    private updateUrlLocation(url: string): void {
        url = url ? url : '';
        if (this.mode == RoutingMode.HTML5) {
            history.pushState(null, null, url);
        }
        else {
            window.location.href = url;
        }
    }

    private getRoute(path: string): UrlRoute {
        for(let i = 0, route; i < this.routes.length, route = this.routes[i]; i++){
            if(route.path == path) return route;
        }
        return;
    }
}

enum RoutingMode {
    Classic = 0,
    HTML5 = 1
}

class UrlRoute {
    public path: string;
    public callback: (path : string, params: string[]) => {}

    constructor(path: string, callback: (path : string, params: string[]) => {}) {
        this.path = path;
        this.callback = callback;
    }
}

class RouteParams {
    public params: any[] = [];
    public path: string;

    constructor(url: string) {
        this.parse(url);
    }

    private parse(url: string): void {
        let path: string[] = url.split('?');
        this.path = path[0];

        // remove trailing forward slash from route
        if(this.path.slice(-1) == '/'){
            this.path = this.path.slice(0, -1);
        }

        if (path[1]) {
            let queryString: string = path[1];
            let queries: string[] = queryString.split('&');
            for (let i = 0; i < queries.length; i++) {
                let temp: string[] = queries[i].split('=');
                this.params[temp[0]] = temp[1];
            }
        }
    }
}



/*
let a = new RouteParams();
a.parse('#chris?first=one');
console.log(a.params);
console.log(a.root);

let b = new RouteParams();
b.parse('http://www.test.com/#chris');
console.log(b.params);
console.log(b.root);

let c = new RouteParams();
c.parse('#chris?first=&second=var');
console.log(c.params);
console.log(c.root);

let hash: string = window.location.hash;
hash = window.location.href.split('#')[1] || '';
console.log('router.debug: hash = ' + hash);
*/

console.log(window.location.href);