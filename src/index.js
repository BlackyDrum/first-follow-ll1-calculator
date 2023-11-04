/**
 * @author Gani Aytan (FH Aachen - University of applied Sciences)
 * @version 1.0
 */

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

    let fi_string = "";
    variables.forEach(variable => {
        fi_string += `FI(${variable}) = { ${removeDuplicateWords(removeLastOccurrence(calculateFirstSets(variable), ","))}}\n`;
    })

    let fo_string = "";
    variables.forEach(variable => {
        fo_string += `FO(${variable}) = { ${removeLastOccurrence(calculateFollowSets(variable), ",")}}\n`;
    })

    let la_string = "";
    lines.forEach((line, index) => {
        la_string += `LA(${index + 1}) = { ${removeDuplicateWords(removeLastOccurrence(calculateLookaheadSets(index), ","))}}\n`;
    })

    let output = document.getElementById('output_area');
    output.value = `${removeLastOccurrence(variables_string, ",")}\n${removeLastOccurrence(terminals_string, ",")}\n\n${replaceAll(fi_string,EPSILON + " ","")}\n${replaceAll(fo_string,EPSILON, "")}\n${replaceAll(la_string, EPSILON + " ", "")}`;

})

function calculateFollowSets(variable) {
    let lines = document.getElementById('input_area').value.split('\n');
    let follows = "";

    lines.forEach(line => {
        const rule = line.split(' ');
        for (let i = 2; i < rule.length; i++) {
            if (i + 1 < rule.length && follows.includes(EPSILON) && terminals.includes(rule[i + 1])) {
                follows += rule[i + 1] + ", ";
                follows = replaceAll(follows, EPSILON, "");
            }
            else if (i + 1 < rule.length && follows.includes(EPSILON) && variables.includes(rule[i + 1])) {
                follows = replaceAll(follows, EPSILON, "");
                follows += calculateFirstSets(rule[i + 1]);
            }
            else if (i + 1 >= rule.length && follows.includes(EPSILON) && rule[0] !== variable) {
                follows = replaceAll(follows, EPSILON, "");
                follows += calculateFollowSets(rule[0]);
            }
            if (rule[i] === variable) {
                if (i + 1 < rule.length && terminals.includes(rule[i + 1])) {
                    follows += rule[i + 1] + ", ";
                    break;
                }
                else if (i + 1 < rule.length && variables.includes(rule[i + 1])) {
                    follows += calculateFirstSets(rule[i + 1]);
                }
                else if (i + 1 >= rule.length && rule[0] !== variable) {
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
                if (i > 2 && terminate && !firsts.includes(EPSILON)) return firsts;
                if (i > 2 && firsts.includes(EPSILON)) {
                    firsts = replaceAll(firsts, EPSILON, "");
                }
                if (terminals.includes(rule[i])) {
                    firsts += rule[i] + ", ";
                    break;
                }
                else if (variables.includes(rule[i])) {
                    firsts += calculateFirstSets(rule[i]);
                    if (firsts !== "") terminate = true;
                }
                else if (rule[2] === EPSILON) {
                    firsts += EPSILON + " ";
                    return firsts;
                }
            }
        }
    })

    return firsts;
}

function calculateLookaheadSets(index) {
    let lines = document.getElementById('input_area').value.split('\n')[index];
    let lookaheads = "";

    const rule = lines.split(' ');
    for (let i = 2; i < rule.length; i++) {
        if (rule[2] === EPSILON) {
            lookaheads += calculateFollowSets(rule[0]);
            break;
        }

        if (terminals.includes(rule[i])) {
            lookaheads += rule[i] + ", ";
            break;
        }
        else if (variables.includes(rule[i])) {
            lookaheads += calculateFirstSets(rule[i]);
            if (!lookaheads.includes(EPSILON)) {
                break;
            }
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