import { db } from "../helpers/db.js";


const createUser = async ({firstname, lastname, email, password, role = "USER"}) => {
    try{
        const response =  await db.user.create({
            data: {
                firstname, 
                lastname, 
                email, 
                password, 
                role
            }
        });

        // if(!!response?.password) delete response.password;
        return response;
    } catch (error) {
        console.log(error)
        return null;
    }
};

const getUserById = async (id) => {
    try {
        const response = await db.user.findUnique({
            where: { id },
            // select: {}
        });

        // if(!!response?.password) delete response.password; 
        return response;
        
    } catch (error) {
        return null;
    }
};

const getUserByName = async (username) => {
    try {
        const response = await db.user.findFirst({
            where: { username }
        });

        // if(!!response?.password) delete response.password; 
        return response;
        
    } catch (error) {
        return null;
    }
};

const getUserByEmail = async (email) => {
    try {
        const response = await db.user.findUnique({
            where: { email }
        });

        // if(!!response?.password) delete response.password; 
        return response;
        
    } catch (error) {
        console.log('Error from getUserByEmail: ', error, 9876)
        return null;
    }
};

const updateUser = async (id, data) => {
    try{
        const response = await db.user.update({
            where: { id },
            data
        });

        // if(!!response?.password) delete response.password;
        return response;
    } catch (error) {
        console.log('error at updateUser: ', error);
        return null;
    }
}

const deleteUser = async (id) => {
    try {
        return await db.user({
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
