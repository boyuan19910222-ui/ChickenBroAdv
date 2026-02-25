/**
 * EffectSystem - 统一的技能效果处理系统
 * 
 * 负责：
 * - 施加效果 (DOT/HOT/buff/debuff/shield/CC/summon)
 * - 回合结束结算 (DOT tick → HOT tick → duration递减 → 到期移除)
 * - Shield 伤害吸收
 * - 技能伤害归一化
 * - 旧 effect → effects[] 兼容转换
 */

export const EffectSystem = {

    // ═══════════════════════════════════════════
    // 2.1 施加效果
    // ═══════════════════════════════════════════

    /**
     * 将技能的 effects[] 施加到目标
     * @param {Object} source - 施法者
     * @param {Object} target - 目标（单个单位）
     * @param {Array} effects - 效果数组
     * @param {Object} context - 上下文 { round, log }
     */
    applyEffects(source, target, effects, context = {}) {
        if (!effects || !Array.isArray(effects) || effects.length === 0) return

        for (const effect of effects) {
            this.applySingleEffect(source, target, effect, context)
        }
    },

    /**
     * 施加单个效果
     */
    applySingleEffect(source, target, effect, context = {}) {
        if (!effect || !effect.type) return

        // 确保目标有 buffs/debuffs 数组
        if (!target.buffs) target.buffs = []
        if (!target.debuffs) target.debuffs = []

        switch (effect.type) {
            case 'dot':
                this._applyDot(target, effect, context)
                break
            case 'hot':
                this._applyHot(target, effect, context)
                break
            case 'buff':
                this._applyBuff(target, effect, context)
                break
            case 'debuff':
                this._applyDebuff(target, effect, context)
                break
            case 'shield':
                this._applyShield(target, effect, context)
                break
            case 'cc':
                this._applyCc(target, effect, context)
                break
            case 'summon':
                this._applySummon(source, effect, context)
                break
            case 'lifesteal':
                // lifesteal 在伤害计算时处理，此处不需额外操作
                break
            case 'dispel':
                this._applyDispel(target, effect, context)
                break
        }
    },

    _applyDot(target, effect, context) {
        const existing = target.debuffs.find(d => d.name === effect.name && d.type === 'dot')
        if (existing) {
            // 同名 DOT 刷新 duration
            existing.remainingDuration = effect.duration
            existing.tickDamage = effect.tickDamage || effect.value || 0
        } else {
            target.debuffs.push({
                type: 'dot',
                name: effect.name,
                damageType: effect.damageType || 'physical',
                tickDamage: effect.tickDamage || effect.value || 0,
                duration: effect.duration,
                remainingDuration: effect.duration,
                scaling: effect.scaling || false
            })
        }
    },

    _applyHot(target, effect, context) {
        const existing = target.buffs.find(b => b.name === effect.name && b.type === 'hot')
        if (existing) {
            existing.remainingDuration = effect.duration
            existing.tickHeal = effect.tickHeal || effect.value || 0
        } else {
            target.buffs.push({
                type: 'hot',
                name: effect.name,
                tickHeal: effect.tickHeal || effect.value || 0,
                duration: effect.duration,
                remainingDuration: effect.duration
            })
        }
    },

    _applyBuff(target, effect, context) {
        const existing = target.buffs.find(b => b.name === effect.name && b.type === 'buff')
        if (existing) {
            existing.remainingDuration = effect.duration
            existing.value = effect.value
        } else {
            target.buffs.push({
                type: 'buff',
                name: effect.name,
                stat: effect.stat || null,
                value: effect.value || 0,
                duration: effect.duration,
                remainingDuration: effect.duration
            })
        }
    },

    _applyDebuff(target, effect, context) {
        const existing = target.debuffs.find(d => d.name === effect.name && d.type === 'debuff')
        if (existing) {
            existing.remainingDuration = effect.duration
            existing.value = effect.value
        } else {
            target.debuffs.push({
                type: 'debuff',
                name: effect.name,
                stat: effect.stat || null,
                value: effect.value || 0,
                duration: effect.duration,
                remainingDuration: effect.duration
            })
        }
    },

    _applyShield(target, effect, context) {
        const existing = target.buffs.find(b => b.name === effect.name && b.type === 'shield')
        if (existing) {
            existing.absorbAmount = effect.absorbAmount
            existing.remainingDuration = effect.duration
        } else {
            target.buffs.push({
                type: 'shield',
                name: effect.name,
                absorbAmount: effect.absorbAmount || effect.value || 0,
                duration: effect.duration,
                remainingDuration: effect.duration
            })
        }
    },

    _applyCc(target, effect, context) {
        const existing = target.debuffs.find(d => d.type === 'cc' && d.ccType === effect.ccType)
        if (existing) {
            existing.remainingDuration = Math.max(existing.remainingDuration, effect.duration)
        } else {
            target.debuffs.push({
                type: 'cc',
                ccType: effect.ccType,
                name: effect.ccType,
                duration: effect.duration,
                remainingDuration: effect.duration
            })
        }
    },

    _applySummon(source, effect, context) {
        // 召唤物在战斗系统中处理，这里只触发事件
        if (context.onSummon) {
            context.onSummon(source, effect)
        }
    },

    _applyDispel(target, effect, context) {
        const count = effect.count || 1
        for (let i = 0; i < count; i++) {
            if (target.debuffs && target.debuffs.length > 0) {
                target.debuffs.pop() // 移除最后一个 debuff
            }
        }
    },

    // ═══════════════════════════════════════════
    // 2.2 回合结束结算
    // ═══════════════════════════════════════════

    /**
     * 处理回合结束结算
     * 顺序: DOT → HOT → buff/debuff/shield/cc duration递减 → 到期移除 → 资源恢复
     * @param {Array} allUnits - 所有参战单位
     * @param {Object} context - { round, log, onDamage, onHeal }
     * @returns {Array} 结算日志
     */
    processEndOfTurn(allUnits, context = {}) {
        const logs = []

        for (const unit of allUnits) {
            if (!unit || unit.isDead || (unit.currentHp !== undefined && unit.currentHp <= 0)) continue

            // 确保有 buffs/debuffs
            if (!unit.buffs) unit.buffs = []
            if (!unit.debuffs) unit.debuffs = []

            // 1. DOT 结算（施放当回合结束即结算第一次tick）
            for (const debuff of [...unit.debuffs]) {
                if (debuff.type !== 'dot') continue

                let tickDmg = debuff.tickDamage
                // 递增 DOT (如痛苦诅咒)
                if (debuff.scaling) {
                    const elapsed = debuff.duration - debuff.remainingDuration
                    tickDmg = Math.floor(tickDmg * (1 + elapsed * 0.5))
                }

                // 造成伤害
                const hp = unit.currentHp !== undefined ? 'currentHp' : 'hp'
                if (unit[hp] !== undefined) {
                    unit[hp] = Math.max(0, unit[hp] - tickDmg)
                    logs.push({
                        type: 'dot_tick',
                        target: unit.name || unit.id,
                        damage: tickDmg,
                        dotName: debuff.name,
                        damageType: debuff.damageType
                    })

                    if (context.onDamage) {
                        context.onDamage(unit, tickDmg, debuff.name)
                    }
                }

                debuff.remainingDuration--
                if (debuff.remainingDuration <= 0) {
                    unit.debuffs = unit.debuffs.filter(d => d !== debuff)
                    logs.push({ type: 'effect_expired', target: unit.name || unit.id, effectName: debuff.name })
                }
            }

            // 检查 DOT 致死
            const hp = unit.currentHp !== undefined ? 'currentHp' : 'hp'
            if (unit[hp] !== undefined && unit[hp] <= 0) {
                unit.isDead = true
                logs.push({ type: 'unit_died', target: unit.name || unit.id, cause: 'dot' })
                continue // 跳过 HOT 和后续处理
            }

            // 2. HOT 结算（施放当回合结束即结算第一次tick）
            for (const buff of [...unit.buffs]) {
                if (buff.type !== 'hot') continue

                const tickHeal = buff.tickHeal
                if (unit[hp] !== undefined) {
                    const maxHp = unit.maxHp || unit.stats?.hp || 999
                    const before = unit[hp]
                    unit[hp] = Math.min(maxHp, unit[hp] + tickHeal)
                    const actual = unit[hp] - before
                    if (actual > 0) {
                        logs.push({
                            type: 'hot_tick',
                            target: unit.name || unit.id,
                            heal: actual,
                            hotName: buff.name
                        })
                        if (context.onHeal) {
                            context.onHeal(unit, actual, buff.name)
                        }
                    }
                }

                buff.remainingDuration--
                if (buff.remainingDuration <= 0) {
                    unit.buffs = unit.buffs.filter(b => b !== buff)
                    logs.push({ type: 'effect_expired', target: unit.name || unit.id, effectName: buff.name })
                }
            }

            // 3. Buff/Debuff/Shield/CC duration 递减
            for (const buff of [...unit.buffs]) {
                if (buff.type === 'hot') continue // HOT 已处理
                if (buff.duration === 99 || buff.duration === -1) continue // 持久效果

                buff.remainingDuration--
                if (buff.remainingDuration <= 0) {
                    unit.buffs = unit.buffs.filter(b => b !== buff)
                    logs.push({ type: 'effect_expired', target: unit.name || unit.id, effectName: buff.name })
                }
            }

            for (const debuff of [...unit.debuffs]) {
                if (debuff.type === 'dot') continue // DOT 已处理

                debuff.remainingDuration--
                if (debuff.remainingDuration <= 0) {
                    unit.debuffs = unit.debuffs.filter(d => d !== debuff)
                    logs.push({ type: 'effect_expired', target: unit.name || unit.id, effectName: debuff.name || debuff.ccType })
                }
            }
        }

        return logs
    },

    // ═══════════════════════════════════════════
    // 2.3 Shield 伤害吸收
    // ═══════════════════════════════════════════

    /**
     * 计算经过 shield 吸收后的实际伤害
     * @param {Object} target - 受击目标
     * @param {number} incomingDamage - 原始伤害
     * @returns {Object} { actualDamage, absorbed, shieldBroken }
     */
    absorbDamage(target, incomingDamage, damageType = 'physical') {
        if (!target.buffs) return { actualDamage: incomingDamage, absorbed: 0, shieldBroken: false, reflected: false, immune: false }

        let remaining = incomingDamage
        let totalAbsorbed = 0
        let shieldBroken = false

        // 检查无敌 buff（如神圣之盾）
        const invulnerable = target.buffs.find(b => b.name === 'invulnerable' && b.type === 'buff')
        if (invulnerable) {
            return { actualDamage: 0, absorbed: incomingDamage, shieldBroken: false, reflected: false, immune: true }
        }

        // 检查物理免疫 buff
        if (damageType === 'physical') {
            const physImmune = target.buffs.find(b => b.stat === 'physicalImmune' && b.type === 'buff' && (b.remainingDuration > 0 || b.duration === 99))
            if (physImmune) {
                return { actualDamage: 0, absorbed: incomingDamage, shieldBroken: false, reflected: false, immune: true }
            }
        }

        // 检查魔法免疫 buff
        if (damageType !== 'physical') {
            const magicImmune = target.buffs.find(b => b.stat === 'magicImmune' && b.type === 'buff' && (b.remainingDuration > 0 || b.duration === 99))
            if (magicImmune) {
                return { actualDamage: 0, absorbed: incomingDamage, shieldBroken: false, reflected: false, immune: true }
            }
        }

        // 检查法术反射 buff（仅法术伤害）
        if (damageType !== 'physical') {
            const spellReflect = target.buffs.find(b => b.stat === 'spellReflect' && b.type === 'buff' && (b.remainingDuration > 0 || b.duration === 99))
            if (spellReflect) {
                return { actualDamage: 0, absorbed: incomingDamage, shieldBroken: false, reflected: true, immune: false }
            }
        }

        // 检查减伤 buff
        for (const buff of target.buffs) {
            if (buff.type === 'buff' && buff.stat === 'damageReduction' && buff.value > 0) {
                remaining = Math.floor(remaining * (1 - buff.value))
            }
        }

        // 检查 shield 类型 buff
        const shields = target.buffs.filter(b => b.type === 'shield')
        for (const shield of shields) {
            if (remaining <= 0) break
            const absorb = Math.min(shield.absorbAmount, remaining)
            shield.absorbAmount -= absorb
            remaining -= absorb
            totalAbsorbed += absorb

            if (shield.absorbAmount <= 0) {
                target.buffs = target.buffs.filter(b => b !== shield)
                shieldBroken = true
            }
        }

        return {
            actualDamage: Math.max(0, remaining),
            absorbed: totalAbsorbed + (incomingDamage - remaining - totalAbsorbed),
            shieldBroken,
            reflected: false,
            immune: false
        }
    },

    // ═══════════════════════════════════════════
    // 2.4 技能伤害归一化 & 兼容转换
    // ═══════════════════════════════════════════

    /**
     * 归一化技能伤害数据
     * 兼容 damage: number 和 damage: { base, scaling, stat }
     */
    resolveSkillDamage(skill, attacker) {
        const dmg = skill.damage
        if (dmg === null || dmg === undefined || dmg === 0) return 0

        // 直接数值（敌人技能常用）
        if (typeof dmg === 'number') {
            return dmg
        }

        // { base, scaling, stat } 结构
        if (typeof dmg === 'object') {
            const base = dmg.base || 0
            const scaling = dmg.scaling || 0
            const stat = dmg.stat || 'strength'
            const statValue = this._getStatValue(attacker, stat)
            return Math.floor(base + scaling * statValue)
        }

        return 0
    },

    /**
     * 归一化技能治疗数据
     */
    resolveSkillHeal(skill, caster) {
        const heal = skill.heal
        if (!heal) return 0

        if (typeof heal === 'number') return heal

        if (typeof heal === 'object') {
            const base = heal.base || 0
            const scaling = heal.scaling || 0
            const stat = heal.stat || 'intellect'
            const statValue = this._getStatValue(caster, stat)
            return Math.floor(base + scaling * statValue)
        }

        return 0
    },

    /**
     * 获取单位属性值
     */
    _getStatValue(unit, stat) {
        if (!unit) return 0
        // 优先从 stats 对象中取
        if (unit.stats && unit.stats[stat] !== undefined) return unit.stats[stat]
        // 直接属性
        if (unit[stat] !== undefined) return unit[stat]
        // computed stats
        if (unit.computedStats && unit.computedStats[stat] !== undefined) return unit.computedStats[stat]
        return 0
    },

    /**
     * 将旧 effect 字段转换为 effects[] 数组
     * 兼容旧数据格式
     */
    normalizeEffects(skill) {
        // 已有 effects 数组则直接返回
        if (skill.effects && Array.isArray(skill.effects)) {
            return skill.effects
        }

        // 旧 effect 单字段 → 包装为数组
        if (skill.effect) {
            return [skill.effect]
        }

        return []
    },

    /**
     * 检查单位是否被 CC 控制中
     */
    isUnitCCed(unit) {
        if (!unit.debuffs) return false
        return unit.debuffs.some(d => d.type === 'cc' && d.remainingDuration > 0)
    },

    /**
     * 获取 CC 类型
     */
    getCCType(unit) {
        if (!unit.debuffs) return null
        const cc = unit.debuffs.find(d => d.type === 'cc' && d.remainingDuration > 0)
        return cc ? cc.ccType : null
    },

    /**
     * 检查单位是否有指定 buff
     */
    hasBuff(unit, buffName) {
        if (!unit.buffs) return false
        return unit.buffs.some(b => b.name === buffName && b.remainingDuration > 0)
    },

    /**
     * 获取 buff 值
     */
    getBuffValue(unit, buffName) {
        if (!unit.buffs) return 0
        const buff = unit.buffs.find(b => b.name === buffName && b.remainingDuration > 0)
        return buff ? buff.value : 0
    },

    /**
     * 检查单位是否有指定 debuff
     */
    hasDebuff(unit, debuffName) {
        if (!unit.debuffs) return false
        return unit.debuffs.some(d => d.name === debuffName && d.remainingDuration > 0)
    },

    /**
     * 获取单位所有活跃效果（用于 UI 展示）
     */
    getActiveEffects(unit) {
        const effects = []
        if (unit.buffs) {
            for (const b of unit.buffs) {
                if (b.remainingDuration > 0 || b.duration === 99 || b.duration === -1) {
                    effects.push({ ...b, isPositive: true })
                }
            }
        }
        if (unit.debuffs) {
            for (const d of unit.debuffs) {
                if (d.remainingDuration > 0) {
                    effects.push({ ...d, isPositive: false })
                }
            }
        }
        return effects
    }
}
