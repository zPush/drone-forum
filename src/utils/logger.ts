import chalk from 'chalk'

export const logger = {
    info: (msg: string) => console.log(chalk.gray(`[INFO] ${msg}`)),
    success: (msg: string) => console.log(chalk.green(`[OK] ${msg}`)),
    warn: (msg: string) => console.log(chalk.yellow(`[WARN] ${msg}`)),
    error: (msg: string) => console.log(chalk.red(`[ERROR] ${msg}`)),
}
