
class JsonLoader {
    /** Performs a deep recursive copy from source object to target object */
    public static mapProperties<T>(target: T, source: any): T {
        for (let prop in source) {
            if (!Array.isArray(source[prop])) {
                target[prop] = source[prop];
            }
            else {
                target[prop] = source[prop];
                for (let item in source[prop]) {
                    target[prop].push(this.mapProperties<any>(target[prop][item], source[prop][item]));
                }
            }
        }
        return target;
    }

    /** Typescript specific function: Pass json data in the parameter to the loader */
    public static loadArray<T>(json: any) : T[] {
        let stack: T[] = [];
        stack = this.mapProperties<T[]>(stack, json);
        return stack;
    }
}

class Bootstrapper{
    private json : any;
    private app : App;    

    constructor(componentsJson : any){
        this.json = componentsJson;
    }

    public init(app : App){
        this.app = app;        
        app.components = JsonLoader.loadArray<Component>(this.json) as Component[];
        app.init(this.getEagerLoadComponents());
    }

    private getEagerLoadComponents(): JQueryPromise<any>[] {
        let eagerComponents: Component[] = this.getEagerComponents();        
        let ajaxPromises: JQueryPromise<any>[] = [];

        for (let item in eagerComponents) {
            let component: Component = eagerComponents[item] as Component;
            ajaxPromises = ajaxPromises.concat(this.app.precache(component));
        }
        return ajaxPromises;
    }

    private getEagerComponents(): Component[] {
        let list: Component[] = this.app.components;
        return list.filter(this.isEagerLoad);
    }

    private isEagerLoad(component: Component): boolean {
        return component.eagerLoad;
    }
}