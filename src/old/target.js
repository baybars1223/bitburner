function createClass(ns, document, name,rules){
    var style = document.createElement('style');
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
    if(!(style.sheet||{}).insertRule) 
        (style.styleSheet || style.sheet).addRule(name, rules);
    else
        style.sheet.insertRule(name+"{"+rules+"}",0);
}

/** @param {NS} ns **/
export async function main(ns) {
    createClass(ns, document, 'test', `background-color: pink !important; color: orange !important;`)
    const prompt = ns.prompt('foo')
    const [p, ..._] = document.querySelectorAll(".jss15")
    if(p) {
        p.classList.add('test')
    } 
    await prompt
}