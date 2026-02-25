/**
 * 种子化随机数生成器 - 保证联机模式下所有客户端随机结果一致
 * 使用 mulberry32 算法
 */
export class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed
        this.state = seed
    }

    // mulberry32 算法
    next() {
        this.state |= 0
        this.state = this.state + 0x6D2B79F5 | 0
        let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state)
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }

    // 兼容 Math.random() 的接口
    random() {
        return this.next()
    }

    // 范围内随机整数 [min, max]
    randomInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min
    }

    // 从数组中随机选择
    randomChoice(array) {
        return array[Math.floor(this.next() * array.length)]
    }

    // 随机洗牌
    shuffle(array) {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]]
        }
        return result
    }

    // 百分比概率判定
    chance(percent) {
        return this.next() < percent / 100
    }

    // 重置种子
    reset(seed) {
        this.seed = seed !== undefined ? seed : this.seed
        this.state = this.seed
    }
}

// 全局默认实例（单机模式使用）
export const globalRandom = new SeededRandom()
