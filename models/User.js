const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (data) => {
    return await prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role || 'student',
            dateJoined: new Date()
        }
    });
};

const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id: id }
    });
};

const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id: id },
        data: data
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({
        where: { id: id }
    });
};

module.exports = {
    createUser,
    getUserById,
    updateUser,
    deleteUser
};
