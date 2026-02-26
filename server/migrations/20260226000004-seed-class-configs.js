'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const now = new Date()
        const classes = [
            {
                class_id:         'warrior',
                name:             '战士',
                base_stats:       JSON.stringify({ health: 180, mana: 30, strength: 15, agility: 8, intellect: 5, stamina: 8, spirit: 5 }),
                growth_per_level: JSON.stringify({ health: 15, mana: 3, strength: 3, agility: 1, intellect: 1, stamina: 0.5, spirit: 1 }),
                base_skills:      JSON.stringify(['heroicStrike', 'charge', 'rend', 'battleShout']),
                resource_type:    'rage',
                resource_max:     100,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'paladin',
                name:             '圣骑士',
                base_stats:       JSON.stringify({ health: 165, mana: 70, strength: 14, agility: 6, intellect: 10, stamina: 7, spirit: 10 }),
                growth_per_level: JSON.stringify({ health: 14, mana: 7, strength: 2, agility: 1, intellect: 2, stamina: 0.4, spirit: 2 }),
                base_skills:      JSON.stringify(['crusaderStrike', 'sealOfJustice', 'judgement', 'holyLight']),
                resource_type:    'mana',
                resource_max:     70,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'hunter',
                name:             '猎人',
                base_stats:       JSON.stringify({ health: 90, mana: 60, strength: 8, agility: 16, intellect: 6, stamina: 9, spirit: 8 }),
                growth_per_level: JSON.stringify({ health: 11, mana: 6, strength: 1, agility: 3, intellect: 1, stamina: 0.2, spirit: 1 }),
                base_skills:      JSON.stringify(['arcaneShot', 'serpentSting', 'huntersMark', 'summonPet']),
                resource_type:    'mana',
                resource_max:     60,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'rogue',
                name:             '盗贼',
                base_stats:       JSON.stringify({ health: 80, mana: 50, strength: 10, agility: 18, intellect: 5, stamina: 6, spirit: 6 }),
                growth_per_level: JSON.stringify({ health: 10, mana: 5, strength: 2, agility: 3, intellect: 1, stamina: 0.2, spirit: 0.5 }),
                base_skills:      JSON.stringify(['shadowStrike', 'eviscerate', 'stealth', 'backstab']),
                resource_type:    'energy',
                resource_max:     100,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'priest',
                name:             '牧师',
                base_stats:       JSON.stringify({ health: 70, mana: 90, strength: 4, agility: 5, intellect: 16, stamina: 5, spirit: 12 }),
                growth_per_level: JSON.stringify({ health: 9, mana: 9, strength: 0.5, agility: 0.5, intellect: 3, stamina: 0.2, spirit: 2 }),
                base_skills:      JSON.stringify(['smite', 'heal', 'powerWordShield', 'shadowWordPain']),
                resource_type:    'mana',
                resource_max:     90,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'shaman',
                name:             '萨满祭司',
                base_stats:       JSON.stringify({ health: 85, mana: 80, strength: 10, agility: 8, intellect: 14, stamina: 7, spirit: 10 }),
                growth_per_level: JSON.stringify({ health: 11, mana: 8, strength: 1, agility: 1, intellect: 2, stamina: 0.3, spirit: 1.5 }),
                base_skills:      JSON.stringify(['lightningBolt', 'healingWave', 'earthShock', 'searingTotem']),
                resource_type:    'mana',
                resource_max:     80,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'mage',
                name:             '法师',
                base_stats:       JSON.stringify({ health: 60, mana: 100, strength: 3, agility: 5, intellect: 18, stamina: 4, spirit: 12 }),
                growth_per_level: JSON.stringify({ health: 8, mana: 10, strength: 0.5, agility: 0.5, intellect: 3, stamina: 0.2, spirit: 2 }),
                base_skills:      JSON.stringify(['fireball', 'frostbolt', 'arcaneMissiles', 'iceBlock']),
                resource_type:    'mana',
                resource_max:     100,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'warlock',
                name:             '术士',
                base_stats:       JSON.stringify({ health: 70, mana: 95, strength: 4, agility: 5, intellect: 17, stamina: 6, spirit: 11 }),
                growth_per_level: JSON.stringify({ health: 9, mana: 10, strength: 0.5, agility: 0.5, intellect: 3, stamina: 0.3, spirit: 1.5 }),
                base_skills:      JSON.stringify(['shadowBolt', 'corruption', 'curseOfAgony', 'summonImp']),
                resource_type:    'mana',
                resource_max:     95,
                created_at:       now,
                updated_at:       now,
            },
            {
                class_id:         'druid',
                name:             '德鲁伊',
                base_stats:       JSON.stringify({ health: 85, mana: 75, strength: 9, agility: 10, intellect: 12, stamina: 8, spirit: 11 }),
                growth_per_level: JSON.stringify({ health: 11, mana: 8, strength: 1.5, agility: 1, intellect: 2, stamina: 0.4, spirit: 1.5 }),
                base_skills:      JSON.stringify(['wrath', 'healingTouch', 'rejuvenation', 'moonfire']),
                resource_type:    'mana',
                resource_max:     75,
                created_at:       now,
                updated_at:       now,
            },
        ]

        // UPSERT: delete existing entries by class_id then re-insert (idempotent)
        await queryInterface.bulkDelete('class_configs', {
            class_id: classes.map(c => c.class_id),
        })
        await queryInterface.bulkInsert('class_configs', classes)
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('class_configs', {
            class_id: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'],
        })
    },
}
