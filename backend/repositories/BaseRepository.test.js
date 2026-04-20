const BaseRepository = require('./BaseRepository');

describe('BaseRepository', () => {
    let repo;
    let mockModel;

    beforeEach(() => {
        mockModel = {
            findByPk: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
            name: 'TestModel',
        };
        repo = new BaseRepository(mockModel);
    });

    // --- findById ---
    describe('findById()', () => {
        test('should call model.findByPk with id and options', async () => {
            mockModel.findByPk.mockResolvedValue({ id: '1' });
            const result = await repo.findById('1', { raw: true });
            expect(mockModel.findByPk).toHaveBeenCalledWith('1', { raw: true });
            expect(result).toEqual({ id: '1' });
        });

        test('should return null if not found', async () => {
            mockModel.findByPk.mockResolvedValue(null);
            const result = await repo.findById('999');
            expect(result).toBeNull();
        });
    });

    // --- findAll ---
    describe('findAll()', () => {
        test('should call model.findAll with where and options', async () => {
            mockModel.findAll.mockResolvedValue([{ id: '1' }]);
            const result = await repo.findAll({ status: 'Active' }, { order: [['id', 'ASC']] });
            expect(mockModel.findAll).toHaveBeenCalledWith({
                where: { status: 'Active' },
                order: [['id', 'ASC']],
            });
            expect(result).toEqual([{ id: '1' }]);
        });

        test('should default to empty where clause', async () => {
            mockModel.findAll.mockResolvedValue([]);
            await repo.findAll();
            expect(mockModel.findAll).toHaveBeenCalledWith({ where: {} });
        });
    });

    // --- findOne ---
    describe('findOne()', () => {
        test('should call model.findOne with where', async () => {
            mockModel.findOne.mockResolvedValue({ id: '1' });
            const result = await repo.findOne({ email: 'a@b.com' });
            expect(mockModel.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
            expect(result).toEqual({ id: '1' });
        });
    });

    // --- create ---
    describe('create()', () => {
        test('should call model.create with data and options', async () => {
            mockModel.create.mockResolvedValue({ id: 'new' });
            const result = await repo.create({ name: 'Test' }, { transaction: 'tx' });
            expect(mockModel.create).toHaveBeenCalledWith({ name: 'Test' }, { transaction: 'tx' });
            expect(result).toEqual({ id: 'new' });
        });
    });

    // --- update ---
    describe('update()', () => {
        test('should find the record and call update on it', async () => {
            const mockRecord = { id: '1', update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }) };
            mockModel.findByPk.mockResolvedValue(mockRecord);

            const result = await repo.update('1', { name: 'Updated' });
            expect(mockModel.findByPk).toHaveBeenCalledWith('1', {});
            expect(mockRecord.update).toHaveBeenCalledWith({ name: 'Updated' }, {});
        });

        test('should throw if record not found', async () => {
            mockModel.findByPk.mockResolvedValue(null);
            await expect(repo.update('999', { name: 'X' }))
                .rejects.toThrow('TestModel with id 999 not found.');
        });
    });

    // --- delete ---
    describe('delete()', () => {
        test('should find and destroy the record', async () => {
            const mockRecord = { id: '1', destroy: jest.fn() };
            mockModel.findByPk.mockResolvedValue(mockRecord);

            const result = await repo.delete('1');
            expect(mockRecord.destroy).toHaveBeenCalledWith({});
            expect(result).toBe(true);
        });

        test('should throw if record not found', async () => {
            mockModel.findByPk.mockResolvedValue(null);
            await expect(repo.delete('999'))
                .rejects.toThrow('TestModel with id 999 not found.');
        });
    });

    // --- count ---
    describe('count()', () => {
        test('should call model.count with where', async () => {
            mockModel.count.mockResolvedValue(42);
            const result = await repo.count({ status: 'Active' });
            expect(mockModel.count).toHaveBeenCalledWith({ where: { status: 'Active' } });
            expect(result).toBe(42);
        });

        test('should default to empty where', async () => {
            mockModel.count.mockResolvedValue(0);
            await repo.count();
            expect(mockModel.count).toHaveBeenCalledWith({ where: {} });
        });
    });
});
