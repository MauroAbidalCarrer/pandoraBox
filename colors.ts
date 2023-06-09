const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorBlue = "\x1b[34m";
const colorCyan = '\x1b[36m';
const colororangeFaint = '\x1b[38;5;208m\x1b[2m';


export function blue(str: string): string {
    return colorize(colorBlue, str)
}

export function cyan(str: string): string {
    return colorize(colorCyan, str)
}

export function red(str: string): string {
    return colorize(colorRed, str)
}

export function green(str: string): string {
    return colorize(colorGreen, str)
}

export function orangeFaint(str: string): string {
    return colorize(colororangeFaint, str)
}

export function colorize(ainsiColor: string, str: string): string{
    return ainsiColor + str + colorReset
}