import { db } from "../helpers/db.js";

const createUser = async ({firstName, lastName, email, password, role}) => {
    return await db.user.create({
        data: {
            firstName, lastName, email, password, 
            role: role,
            dateJoined: new Date()
        }
    });
};

const getUserById = async (id) => {
    return await db.user.findUnique({
        where: { id }
    });
};

const getUserByName = async (username) => {
    return await db.user.findOne({
        where: { username }
    });
};

const getUserByEmail = async (email) => {
    return await db.user.findUnique({
        where: { email }
    });
};

const updateUser = async (id, data) => {
    return await db.user.update({
        where: { id },
        data: data
    });
};

const deleteUser = async (id) => {
    return await db.user.delete({
        where: { id }
    });
};

module.exports = {
    createUser,
    getUserById,
    getUserByName,
    getUserByEmail,
    updateUser,
    deleteUser
};
