/**
 * Verifica se a string fornecida não é nula, indefinida ou vazia.
 * 
 * @param {string | null | undefined} value - O valor da string a ser verificado.
 * Pode ser `null`, `undefined` ou uma string válida.
 * 
 * @returns {boolean} - Retorna `true` se a string não for vazia, `null` ou `undefined`; 
 * retorna `false` caso contrário.
 * 
 * @example
 * // Exemplos de uso:
 * isNotEmpty("texto"); // retorna true
 * isNotEmpty(""); // retorna false
 * isNotEmpty(null); // retorna false
 * 
 * @throws {Error} - Se o valor fornecido não for do tipo string, null ou undefined.
 */
export function isNotEmpty(value: string | null | undefined): boolean {
    if (typeof value !== 'string' && value !== null && value !== undefined) {
      throw new Error("O valor deve ser uma string, null ou undefined.");
    }
    return value !== null && value !== undefined && value.trim() !== '';
}