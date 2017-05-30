declare var dust: any;

class App {
    //loaded component stack
    public components: Component[];
    public scripts: Script[];

    //psuedo events    
    public onInit: () => void = () => { };
    public onPreLoad: () => void = () => { };
    public onLoaded: () => void = () => { };
    public onUnloaded: () => void = () => { };

    public onComponentLoaded: (component: Component) => void = (component) => { };

    constructor() {
        this.scripts = [];
        console.log(
            'velocity-raptor-js framework intialized \n' +
            'copyright 2017 @ christopher aliotta\n' +
            'version 1.0.0\n' +
            'https://github.com/Quantalytix/velocity-raptor-js\n\n');
    }

    public load(keys: string[]): void {
        this.onPreLoad();
        let ajaxStack: JQueryPromise<any>[] = [];
        for (let i = 0, key; i < keys.length, key = keys[i]; i++) {
            let component: Component = this.findComponent(key);
            if (component) {
                if (component.isRendered == null || component.isRendered == false) {
                    ajaxStack.push(this.loadComponent(component));
                }
                else {                    
                    throw 'Error[1] component with the key value of {key: ' + key
                    + '} is already rendered. Call the reload method if you wish to refresh the component.';
                }
            }
            else {
                throw 'Error[0] component with the key value of {key: ' + key + '} not found.';
            }
        }
        $.when.apply($, ajaxStack).done(() => {
            this.onLoaded();
        });
    }

    public reload(keys: string[]): void {
        this.unload(keys);
        this.load(keys);
    }

    public unload(keys: string[]): void {
        for (let item in keys) {
            let component: Component = this.findComponent(keys[item]);
            component.template = null;
            component.json = "";
            component.isRendered = false;
            component.isCached = false;
            this.removeComponentScripts(component);
            this.clearElement(component);
        }
        this.onUnloaded();
    }

    public findComponent(key: string): Component {
        for (let i in this.components) {
            if (this.components[i].key == key) {
                return this.components[i];
            }
        }
        return null;
    }

    public loadComponent(component: Component): JQueryPromise<any> {
        this.loadComponentScripts(component);

        if (component.isCached) {
            return this.render(component.template, component.json, component);
        }
        else {
            return $.when.apply($, this.precache(component)).done(() => {
                this.render(component.template, component.json, component);
            });
        }
    }

    public init(ajaxStack: JQueryPromise<any>[]) {
        $.when.apply($, ajaxStack).done(() => {
            this.onInit();
        });
    }

    public precache(component: Component): JQueryPromise<any>[] {
        let ajaxPromises: JQueryPromise<any>[] = [];
        if (component.dataUrl) {
            ajaxPromises.push(this.loadComponentData(component));
        }
        if (component.templateUrl) {
            ajaxPromises.push(this.loadComponentTemplate(component));
        }
        component.isCached = true;
        return ajaxPromises;
    }

    private loadComponentScripts(component: Component): void {
        if (component.scripts) {
            component.scripts.forEach((item) => {
                if (this.scripts.indexOf(item) == -1) this.addJS(item);
            });
        }
    }

    private removeComponentScripts(component: Component): void {
        if (component.scripts) {
            component.scripts.forEach((item) => {
                if (this.scripts.indexOf(item) != -1) {
                    if (item.unload) {
                        this.removeJS(item.url);
                        this.scripts.splice(this.scripts.indexOf(item), 1);
                    }
                }
            });
        }
    }

    private loadComponentData(component: Component): JQueryPromise<any> {
        return $.getJSON(component.dataUrl).then((json) => component.json = json);
    }

    private loadComponentTemplate(component: Component): JQueryPromise<any> {
        return $.get(component.templateUrl).then((template) => component.template = template);
    }

    private addJS(script: Script): void {
        if (script) {
            this.scripts.push(script);
            let scriptElement: HTMLScriptElement = this.createScriptElement(script);
            if (script.postLoad == null || script.postLoad == false) {
                document.head.appendChild(scriptElement);
            }
            else {
                document.body.appendChild(scriptElement);
            }
        }
    }

    private createScriptElement(script: Script): HTMLScriptElement {
        let scriptElement: HTMLScriptElement = document.createElement('script');
        scriptElement.src = script.url;
        scriptElement.async = script.async;
        return scriptElement;
    }

    private removeJS(src: string) {
        let tags = document.getElementsByTagName('script');
        for (let i = tags.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
            if (tags[i] && tags[i].getAttribute('src') != null && tags[i].getAttribute('src').indexOf(src) != -1)
                tags[i].parentNode.removeChild(tags[i]); //remove element by calling parentNode.removeChild()
        }
    }

    private clearElement(component: Component): void {
        if (component.targetElement != null) {
            $(component.targetElement).empty();
        }
        else if (component.tag != null) {
            for (let i = 0; i < document.getElementsByTagName(component.tag).length; i++) {
                document.getElementsByTagName(component.tag)[i].innerHTML = "";
            }
        }
    }

    private render(template: any, json: any, element: Component): JQueryPromise<any> {
        var def = $.Deferred<void>();
        if (!element.isRendered) {
            let compiledTemplate = dust.compile(template, element.tag);
            dust.loadSource(compiledTemplate);
        }
        dust.render(element.tag, json, (err: any, out: any) => {
            element.isRendered = this.updateElementHtml(out, element);
            def.resolve();
            console.log(element.tag + ' rendered');
        });
        return def;
    }

    private updateElementHtml(output: string, component: Component): boolean {
        if (component.targetElement) {
            $(component.targetElement).html(output);
            return true;
        }
        else if (component.tag) {
            for (let i = 0; i < document.getElementsByTagName(component.tag).length; i++) {
                document.getElementsByTagName(component.tag)[i].innerHTML = output;
            }
            return true;
        }
        return false;
    }

    public version(): void {
        console.log('version() 1.0.0');
    }
}

class Component {
    key: string;
    templateUrl: string;
    dataUrl: string;
    targetElement: string;
    tag: string;
    template: string;
    json: string;
    scripts: Script[];
    eagerLoad: boolean;

    isRendered: boolean;
    isCached: boolean;

    constructor() {
        this.eagerLoad = false;
        this.isRendered = false;
        this.isCached = false;
    }
}

class Script {
    url: string;
    postLoad: boolean;
    unload: boolean;
    async: boolean;

    constructor() {
        this.postLoad = true;
        this.unload = true;
        this.async = false;
    }
}