import { db } from "../helpers/db.js";


const createUser = async ({username, email, password, role = "USER"}) => {
    return await db.user.create({
        data: {
            username, email, password, role,
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
    return await db.user.findFirst({
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

export {
    createUser, updateUser, deleteUser,
    getUserById, getUserByName, getUserByEmail,
};
