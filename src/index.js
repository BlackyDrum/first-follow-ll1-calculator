let variables = [];
let symbols = [];

document.getElementById('run_btn').addEventListener('click', () => {
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
        if (!variables_string.includes(variable))
            variables_string += `${variable} `;
    })

    let terminals_string = "Terminals: ";
    symbols.forEach(symbol => {
        if (!variables.includes(symbol))
            terminals_string += `${symbol} `;
    })

    let output = document.getElementById('output_area');
    output.value = `${variables_string}\n${terminals_string}\n\n`;
})

document.getElementById('clear_btn').addEventListener('click', () => {
    document.getElementById('input_area').value = null;
    document.getElementById('output_area').value = null;

    variables = [];
    symbols = [];
})