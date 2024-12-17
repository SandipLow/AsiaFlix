import { supabase } from '../services/superbase';
import bcrypt from 'bcrypt';


const userTable = 'Users';
const likeTable = 'Likes';

interface UserData {
    userName: string;
    password: string;
    email: string;
    role: string | null;
    dob: string;
    phone: string;
    address: string;
}

export default class User {
    constructor() {}

    static async getUserByEmail(email: string) {
        const { data, error } = await supabase
            .from(userTable)
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code === 'PGRST116') {
            // No rows returned
            return null;
        } else if (error) {
            throw error;
        }

        return data as UserData & { id: string };
    }

    static async createUser(userData: UserData) {
        // Check if user already exists
        const user = await this.getUserByEmail(userData.email);

        if (user) {
            throw new Error('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Insert the user into the database
        const { data, error } = await supabase
            .from(userTable)
            .insert({ ...userData, password: hashedPassword })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data.id;
    }

    static async getUser(id: string) {
        const { data, error } = await supabase
            .from(userTable)
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code === 'PGRST116') {
            // No rows returned
            return null;
        } else if (error) {
            throw error;
        }

        return data as UserData;
    }

    static async updateUser(id: string, userData: Partial<UserData>) {
        const { error } = await supabase
            .from(userTable)
            .update(userData)
            .eq('id', id);

        if (error) {
            throw error;
        }
    }

    static async deleteUser(id: string) {
        const { error } = await supabase
            .from(userTable)
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }

    static async getLikedVideos(userId: string) {
        const { data, error } = await supabase
            .from(likeTable)
            .select('videoId')
            .eq('userId', userId);

        if (error) {
            throw error;
        }

        return data.map((item) => item.videoId);
    }
}
