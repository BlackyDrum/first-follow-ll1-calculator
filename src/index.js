const EPSILON = "eps";

let variables = [];
let symbols = [];
let terminals = [];

document.getElementById('run_btn').addEventListener('click', () => {
    reset()

    let lines = document.getElementById('input_area').value.split('\n');
    lines.forEach(line => {
        const rule = line.split(' ');

        variables.push(rule[0]);

        for (let i = 2; i < rule.length; i++) {
            symbols.push(rule[i]);
        }
    })

    let variables_string = "Variables: ";
    variables.forEach(variable => {
        if (!variables_string.includes(variable) && variable !== EPSILON)
            variables_string += `${variable} `;
    })

    let terminals_string = "Terminals: ";
    symbols.forEach(symbol => {
        if (!variables.includes(symbol) && !terminals.includes(symbol) && symbol !== EPSILON) {
            terminals_string += `${symbol} `;
            terminals.push(symbol);
        }
    })

    variables = [...new Set(variables)];
    terminals = [...new Set(terminals)];
    symbols = [...new Set(symbols)];

    let fi_string = "";
    variables.forEach(variable => {
        fi_string += `FI(${variable}) = ${calculateFirstSets(variable)}\n`;
    })

    let fo_string = "";
    variables.forEach(variable => {
        fo_string += `FO(${variable}) = \n`;
    })

    let la_string = "";
    lines.forEach((line, index) => {
        la_string += `LA(${index + 1}) = \n`;
    })

    let output = document.getElementById('output_area');
    output.value = `${variables_string}\n${terminals_string}\n\n${replaceAll(fi_string,EPSILON,"")}\n${fo_string}\n${la_string}`;

})

function calculateFirstSets(variable) {
    let lines = document.getElementById('input_area').value.split('\n');
    let firsts = "";
    let terminate = false;

    lines.forEach(line => {
        const rule = line.split(' ');
        if (rule[0] === variable) {
            for (let i = 2; i < rule.length; i++) {
                if (i > 2 && terminate && !firsts.includes(EPSILON)) return firsts;
                if (terminals.includes(rule[i])) {
                    firsts += rule[i] + " ";
                    break;
                }
                else if (variables.includes(rule[i])) {
                    firsts += calculateFirstSets(rule[i]);
                    if (firsts !== "") terminate = true;
                }
                else if (rule[2] === EPSILON) {
                    firsts += EPSILON;
                    return firsts;
                }
            }
        }
    })

    return firsts;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function reset() {
    variables = [];
    symbols = [];
    terminals = [];
}

document.getElementById('clear_btn').addEventListener('click', () => {
    reset();
    document.getElementById('input_area').value = null;
    document.getElementById('output_area').value = null;
})