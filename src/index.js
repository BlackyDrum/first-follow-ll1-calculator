/**
 * @author Gani Aytan (FH Aachen - University of applied Sciences)
 * @version 1.0
 */

const EPSILON = "eps";
const SEPERATOR = "+#+**_::_**+#+";

let variables = [];
let symbols = [];
let terminals = [];
let lookaheads = [];

let follow_trace = [];

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

    // Calculate first sets
    let fi_string = "";
    variables.forEach(variable => {
        fi_string += `FI(${variable}) = ${removeDuplicateWords(calculateFirstSets(variable)).trim()}\n`;
        follow_trace = [];
    })

    // Calculate follow sets
    let fo_string = "";
    variables.forEach(variable => {
        fo_string += `FO(${variable}) = ${removeLastOccurrence(calculateFollowSets(variable)).trim()}\n`;
        follow_trace = [];
    })

    // Calculate lookahead sets
    let la_string = "";
    lines.forEach((line, index) => {
        let la = removeDuplicateWords(calculateLookaheadSets(index)).trim();
        la_string += `LA(${index + 1}) = ${la}\n`;
        let variable = line.split(' ')[0];
        lookaheads.push({variable: variable, terminals: la.split(' ')})
        follow_trace = [];
    })

    // Check if grammar is LL(1)
    let ll1_string = analyzeLL1();

    let output = document.getElementById('output_area');
    output.value = `${variables_string}\n${terminals_string}\n\n${replaceAll(fi_string,EPSILON,"")}\n${replaceAll(fo_string,EPSILON, "")}\n${replaceAll(la_string, EPSILON, "")}\n${ll1_string}`;

    createAnalysisTable(la_string);

})

function analyzeLL1() {
    lookaheads.forEach(la => {
        la.terminals = la.terminals.filter(terminal => terminal.trim() !== '');
    })
    // Intersect every rule with the same variable.
    // If the result set contains no elements, continue, otherwise terminate with error message
    for (let i = 0; i < lookaheads.length; i++) {
        for (let j = 0; j < lookaheads.length; j++) {
            if (i !== j && lookaheads[i].variable === lookaheads[j].variable) {
                let intersect = lookaheads[i].terminals.filter(terminal => lookaheads[j].terminals.includes(terminal))
                if (intersect.length !== 0) {
                    let s = `LA(${i + 1}) ∩ LA(${j + 1}) ≠ ∅\n=> `
                    return s + "Grammar is NOT LL(1)!"
                }
            }
        }
    }

    return "Grammar is LL(1)!";
}

function calculateFollowSets(variable) {
    let lines = document.getElementById('input_area').value.split('\n');
    let follows = "";

    lines.forEach(line => {
        const rule = line.split(' ');
        for (let i = 2; i < rule.length; i++) {
            // If there is a terminal one position right from the variable and the current follow set includes epsilon,
            // include that terminal in the follow set and delete epsilon
            if (i + 1 < rule.length && follows.includes(EPSILON) && terminals.includes(rule[i + 1])) {
                follows += rule[i + 1] + " ";
                follows = replaceAll(follows, EPSILON, "");
            }
            // If there is a variable one position right from the current variable and the current follow set includes epsilon,
            // calculate the first set of the variable and include that first set in the follow set for the current variable
            // and delete epsilon
            else if (i + 1 < rule.length && follows.includes(EPSILON) && variables.includes(rule[i + 1])) {
                follows = replaceAll(follows, EPSILON, "");
                follows += calculateFirstSets(rule[i + 1]);
            }
            // If there is neither a terminal nor a variable one position right from the current variable, and the current
            // follow set includes epsilon, calculate the follow set of the left side variable and include that follow set in the follow
            // set for the current variable and delete epsilon
            else if (i + 1 >= rule.length && follows.includes(EPSILON)) {
                follows = replaceAll(follows, EPSILON, "");
                if (rule[0] !== variable)
                    follows += calculateFollowSets(rule[0]);
            }
            if (rule[i] === variable) {
                // If there is a terminal one position right from the variable, include that terminal in the follow set
                if (i + 1 < rule.length && terminals.includes(rule[i + 1])) {
                    follows += rule[i + 1] + " ";
                }
                // If there is a variable one position right from the current variable, calculate the first set of the variable
                // and include that first set in the follow set for the current variable
                else if (i + 1 < rule.length && variables.includes(rule[i + 1])) {
                    follows += calculateFirstSets(rule[i + 1]);
                }
                // If there is neither a terminal nor a variable one position right from the current variable, calculate
                // the follow set of the left side variable and include that follow set in the follow set for the current variable
                else if (i + 1 >= rule.length && rule[0] !== variable && !follow_trace.includes(rule[0])) {
                    follow_trace.push(rule[0]);
                    follows += calculateFollowSets(rule[0]);
                }
            }
        }
    })

    return removeDuplicateWords(follows);
}

function calculateFirstSets(variable) {
    let lines = document.getElementById('input_area').value.split('\n');
    let firsts = "";
    let terminate = false;

    lines.forEach(line => {
        const rule = line.split(' ');
        if (rule[0] === variable) {
            for (let i = 2; i < rule.length; i++) {
                // If we reach epsilon, terminate because we are finished
                if (i > 2 && terminate && !firsts.includes(EPSILON)) return firsts;
                // If we reach an epsilon, delete that and continue
                if (i > 2 && firsts.includes(EPSILON)) {
                    firsts = replaceAll(firsts, EPSILON, "");
                }
                // If we reach a terminal, include that in the first set and terminate
                if (terminals.includes(rule[i])) {
                    if (!firsts.includes(rule[i])) {
                        firsts += rule[i] + " ";
                    }
                    break;
                }
                // If we reach a variable, calculate the first set of that variable and
                // include that in the first set for the current variable
                else if (variables.includes(rule[i])) {
                    firsts += calculateFirstSets(rule[i]);
                    if (firsts !== "") terminate = true;
                }
                // If we reach an epsilon, include that in the first set and return
                else if (rule[2] === EPSILON) {
                    firsts += EPSILON + " ";
                    return firsts;
                }
            }
        }
    })

    return removeDuplicateWords(firsts);
}

function calculateLookaheadSets(index) {
    let lines = document.getElementById('input_area').value.split('\n')[index];
    let lookaheads = "";

    const rule = lines.split(' ');
    for (let i = 2; i < rule.length; i++) {
        // If we reach an epsilon, calculate the follow set of the left side variable
        // and include that in the lookahead set for the current rule
        if (rule[2] === EPSILON) {
            lookaheads += calculateFollowSets(rule[0]);
            break;
        }

        // If we reach a terminal, include that in the lookahead set for the current rule
        // and terminate
        if (terminals.includes(rule[i])) {
            lookaheads += rule[i] + " ";
            break;
        }
        // If we reach a variable, calculate the first set of the variable.
        // If there is an epsilon, continue, otherwise terminate
        else if (variables.includes(rule[i])) {
            lookaheads += calculateFirstSets(rule[i]);
            if (!lookaheads.includes(EPSILON)) {
                break;
            }
            if (i + 1 === rule.length && lookaheads.includes(EPSILON)) {
                lookaheads += calculateFollowSets(rule[0]);
            }
            lookaheads = replaceAll(lookaheads, EPSILON + " ", "");
        }
    }

    return removeDuplicateWords(lookaheads);
}

function createAnalysisTable(la_string) {
    // Create Table
    let table = document.getElementById('analysis-table');
    document.getElementById('info').style.visibility = "hidden";

    let tr_header = document.createElement('tr');
    tr_header.appendChild(document.createElement('td'));
    for (const terminal of [...terminals, EPSILON]) {
        let td_terminal = document.createElement('td');
        td_terminal.classList.add('text--bold');
        td_terminal.textContent = terminal;
        tr_header.appendChild(td_terminal);
    }
    table.appendChild(tr_header)

    let terminals_u_epsilon = [...terminals, EPSILON];
    for (const symbol of [...variables, ...terminals, EPSILON]) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.textContent = symbol;
        td.classList.add('text--bold');
        tr.appendChild(td)

        terminals_u_epsilon.forEach((terminal) => {
            let td = document.createElement('td');
            td.classList.add(`${symbol}${SEPERATOR}${terminal}`)
            tr.appendChild(td);
        })

        table.appendChild(tr);
    }

    terminals_u_epsilon.forEach(terminal => {
        let cell = document.getElementsByClassName(`${terminal}${SEPERATOR}${terminal}`)[0];
        if (cell.classList.contains(`${EPSILON}${SEPERATOR}${EPSILON}`))
            cell.textContent = "ACCEPT";
        else
            cell.textContent = 'POP'

        cell.style.color = "#02D523";
        cell.classList.add("text-bold")
    })

    let la_sets = parseLAStringToMap(la_string)
    la_sets.forEach((value, key) => {
        la_sets.set(key, value.filter(symbol => symbol.trim() !== ''));
    });

    let lines = document.getElementById('input_area').value.split('\n');
    lines.forEach((line, index) => {
        let rule = line.split(' ');

        if (la_sets.get((index + 1)).length === 0) {
            let tmp = document.getElementsByClassName(`${rule[0]}${SEPERATOR}${EPSILON}`)[0];
            tmp.textContent = `${EPSILON}, ${index + 1}`;
            tmp.classList.add("text-bold");
        }
        for (const symbol of la_sets.get(index + 1)) {
            if (!symbol.trim()) break;
            let tmp = document.getElementsByClassName(`${rule[0]}${SEPERATOR}${symbol}`)[0];
            for (let i = 2; i < rule.length; i++) {
                tmp.textContent += rule[i] + " ";

                if (rule[i] === EPSILON) {
                    let varToEps = document.getElementsByClassName(`${rule[0]}${SEPERATOR}${EPSILON}`)[0];
                    varToEps.textContent = `${EPSILON}, ${index + 1}`;
                    varToEps.classList.add("text--bold");
                }
            }
            tmp.textContent += `, ${index + 1}\n`;
            tmp.classList.add("text--bold")
        }

    })

    for (const terminal of [...terminals, EPSILON]) {
        for (const symbol of [...variables, ...terminals, EPSILON]) {
            let cell = document.getElementsByClassName(`${symbol}${SEPERATOR}${terminal}`)[0];
            if (!cell.textContent.trim()) {
                cell.textContent = "ERROR";
                cell.style.color = "red"
            }
            if ((cell.textContent.match(/\n/g) || []).length >= 2) {
                cell.style.backgroundColor = "red";
            }
        }
    }
}

function parseLAStringToMap(inputString) {
    const lines = inputString.split('\n');
    const resultMap = new Map();

    const regex = /LA\((\d+)\) = (.*)/;

    lines.forEach(line => {
        const match = line.match(regex);

        if (match) {
            const number = parseInt(match[1], 10);
            const characters = match[2].split(' ').map(c => c.trim());

            resultMap.set(number, characters);
        }
    });

    return resultMap;
}

function removeDuplicateWords(inputString) {
    const words = inputString.split(/\s+/);

    const uniqueWords = [];
    const seenWords = new Set();

    for (const word of words) {
        if (word === '' || !seenWords.has(word)) {
            uniqueWords.push(word);
            seenWords.add(word);
        }
    }

    return uniqueWords.join(' ');
}

function removeLastOccurrence(inputString, needle) {
    const lastIndex = inputString.lastIndexOf(needle);

    if (lastIndex !== -1) {
        return inputString.slice(0, lastIndex) + inputString.slice(lastIndex + needle.length);
    } else {
        return inputString;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function reset() {
    variables = [];
    symbols = [];
    terminals = [];
    lookaheads = [];

    document.getElementById('analysis-table').textContent = '';
    document.getElementById('info').style.visibility = "visible";
}

document.getElementById('clear_btn').addEventListener('click', () => {
    reset();
    document.getElementById('input_area').value = null;
    document.getElementById('output_area').value = null;
})

document.getElementById('example_btn').addEventListener('click', () => {
    reset();

    document.getElementById('input_area').value = `E -> T E'
E' -> + T E'
E' -> eps
T -> F T'
T' -> * F T'
T' -> eps
F -> ( E )
F -> id`;
    document.getElementById('output_area').value = null;
})