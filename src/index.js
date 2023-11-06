/**
 * @author Gani Aytan (FH Aachen - University of applied Sciences)
 * @version 1.0
 */

const EPSILON = "eps";

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

    let variables_string = "Variables: { ";
    variables.forEach(variable => {
        if (!variables_string.includes(variable) && variable !== EPSILON)
            variables_string += `${variable}, `;
    })
    variables_string += "}";

    let terminals_string = "Terminals: { ";
    symbols.forEach(symbol => {
        if (!variables.includes(symbol) && !terminals.includes(symbol) && symbol !== EPSILON) {
            terminals_string += `${symbol}, `;
            terminals.push(symbol);
        }
    })
    terminals_string += "}";

    variables = [...new Set(variables)];
    terminals = [...new Set(terminals)];
    symbols = [...new Set(symbols)];

    // Calculate first sets
    let fi_string = "";
    variables.forEach(variable => {
        fi_string += `FI(${variable}) = { ${removeDuplicateWords(removeLastOccurrence(calculateFirstSets(variable), ",")).trim()} }\n`;
        follow_trace = [];
    })

    // Calculate follow sets
    let fo_string = "";
    variables.forEach(variable => {
        fo_string += `FO(${variable}) = { ${removeLastOccurrence(calculateFollowSets(variable), ",").trim()} }\n`;
        follow_trace = [];
    })

    // Calculate lookahead sets
    let la_string = "";
    lines.forEach((line, index) => {
        let la = removeDuplicateWords(removeLastOccurrence(calculateLookaheadSets(index), ","));
        la_string += `LA(${index + 1}) = { ${la}}\n`;
        let variable = line.split(' ')[0];
        lookaheads.push({variable: variable, terminals: la.replace(/\s/g,'').split(',')})
        follow_trace = [];
    })

    // Check if grammar is LL(1)
    let ll1_string = analyzeLL1();

    let output = document.getElementById('output_area');
    output.value = `${removeLastOccurrence(variables_string, ",")}\n${removeLastOccurrence(terminals_string, ",")}\n\n${replaceAll(fi_string,EPSILON + " ","")}\n${replaceAll(fo_string,EPSILON, "")}\n${replaceAll(la_string, EPSILON + " ", "")}\n${ll1_string}`;

})

function analyzeLL1() {
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
                follows += rule[i + 1] + ", ";
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
                    follows += rule[i + 1] + ", ";
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
                        firsts += rule[i] + ", ";
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
            lookaheads += rule[i] + ", ";
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
}

document.getElementById('clear_btn').addEventListener('click', () => {
    reset();
    document.getElementById('input_area').value = null;
    document.getElementById('output_area').value = null;
})

document.getElementById('example_btn').addEventListener('click', () => {
    reset();

    document.getElementById('input_area').value = `S -> a A B
S -> C D E
A -> B C D
A -> x
A -> eps
B -> a b c
C -> d x y
D -> x z
D -> eps
E -> b y z
E -> eps`;
    document.getElementById('output_area').value = null;
})