import { globalRandom } from './SeededRandom.js'

// 提供全局随机数接口，战斗系统通过此模块获取随机数
// 联机模式下会替换为带种子的实例
let currentRandom = globalRandom

export function getRandom() {
    return currentRandom
}

export function setRandom(randomInstance) {
    currentRandom = randomInstance
}

// 便捷函数，直接替代 Math.random()
export function random() {
    return currentRandom.random()
}

export function randomInt(min, max) {
    return currentRandom.randomInt(min, max)
}

export function randomChoice(array) {
    return currentRandom.randomChoice(array)
}

export function shuffle(array) {
    return currentRandom.shuffle(array)
}

export function chance(percent) {
    return currentRandom.chance(percent)
}
