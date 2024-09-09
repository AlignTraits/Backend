import { db } from "../helpers/db.js";


const createUser = async ({firstname, lastname, email, password, role = "USER"}) => {
    try{
        const {password, ...dbRes} =  await db.user.create({
            data: {
                firstname, 
                lastname, 
                email, 
                password, 
                role
            }
        });

        return dbRes;
    } catch (error) {
        console.log(error)
        return null;
    }
};

const getUserById = async (id) => {
    try {
        const {password, ...dbRes} = await db.user.findUnique({
            where: { id },
            // select: {}
        });

        return dbRes; 
        
    } catch (error) {
        return null;
    }
};

const getUserByName = async (username) => {
    try {
        const {password, ...dbRes} = await db.user.findFirst({
            where: { username }
        });

        return dbRes; 
        
    } catch (error) {
        return null;
    }
};

const getUserByEmail = async (email) => {
    try {
        const {password, ...dbRes} = await db.user.findUnique({
            where: { email }
        });
6
        return dbRes; 
        
    } catch (error) {
        console.log('Error from getUserByEmail: ', error, 9876)
        return null;
    }
};

const updateUser = async (id, data) => {
    try{
        const {password, ...dbRes} = await db.user.update({
            where: { id },
            data
        });

        return dbRes;
    } catch (error) {
        console.log('error at updateUser: ', error);
        return null;
    }
}

const deleteUser = async (id) => {
    try {
        return await db.user.delete({
            where: { id }
        });
    } catch (error) {
        return null;
    }
};

export {
    createUser, updateUser, deleteUser,
    getUserById, getUserByName, getUserByEmail,
};
