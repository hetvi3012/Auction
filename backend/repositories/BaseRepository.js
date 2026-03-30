/**
 * Repository Pattern — BaseRepository
 * Generic CRUD abstraction over Sequelize models.
 * All domain-specific repositories extend this class.
 */
class BaseRepository {
    /**
     * @param {object} model - A Sequelize model class
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Find a record by its primary key.
     * @param {string} id - Primary key
     * @param {object} [options] - Sequelize options (include, transaction, etc.)
     * @returns {Promise<object|null>}
     */
    async findById(id, options = {}) {
        return this.model.findByPk(id, options);
    }

    /**
     * Find all records matching a where clause.
     * @param {object} [where] - Sequelize where filter
     * @param {object} [options] - Additional Sequelize options
     * @returns {Promise<object[]>}
     */
    async findAll(where = {}, options = {}) {
        return this.model.findAll({ where, ...options });
    }

    /**
     * Find a single record matching a where clause.
     * @param {object} where 
     * @param {object} [options]
     * @returns {Promise<object|null>}
     */
    async findOne(where, options = {}) {
        return this.model.findOne({ where, ...options });
    }

    /**
     * Create a new record.
     * @param {object} data - Field values
     * @param {object} [options] - Sequelize options (transaction, etc.)
     * @returns {Promise<object>}
     */
    async create(data, options = {}) {
        return this.model.create(data, options);
    }

    /**
     * Update a record by primary key.
     * @param {string} id 
     * @param {object} data 
     * @param {object} [options]
     * @returns {Promise<object>}
     */
    async update(id, data, options = {}) {
        const record = await this.findById(id, options);
        if (!record) {
            throw new Error(`${this.model.name} with id ${id} not found.`);
        }
        return record.update(data, options);
    }

    /**
     * Delete a record by primary key.
     * @param {string} id 
     * @param {object} [options]
     * @returns {Promise<boolean>}
     */
    async delete(id, options = {}) {
        const record = await this.findById(id, options);
        if (!record) {
            throw new Error(`${this.model.name} with id ${id} not found.`);
        }
        await record.destroy(options);
        return true;
    }

    /**
     * Count records matching a where clause.
     * @param {object} [where]
     * @returns {Promise<number>}
     */
    async count(where = {}) {
        return this.model.count({ where });
    }
}

module.exports = BaseRepository;
