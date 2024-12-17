import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"
import bcrypt from "bcrypt"

const collectionRef = "Users"
const likeCollectionRef = "Likes"

interface UserData {
    userName: string
    password: string
    email: string
    role: string | null
    dob: string
    phone: string
    address: string
}

export default class User {
    constructor() {}

    static async getUserByEmail(email: string) {
        const q = query(collection(db, collectionRef), where("email", "==", email))

        const res = await getDocs(q)

        if (res.empty) {
            return null
        }

        return { id: res.docs[0].id, ...res.docs[0].data() as UserData }
        
    }

    static async createUser(userData: UserData) {
        // check if user already exists
        const user = await this.getUserByEmail(userData.email)

        if (user) {
            throw new Error("User already exists")
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10)

        const res = await addDoc(collection(db, collectionRef), {
            ...userData,
            password: hashedPassword
        })

        return res.id
    }

    static async getUser(id: string) {
        const res = await getDoc(doc(db, collectionRef, id))

        if (!res.exists()) {
            return null
        }

        return { id: res.id, ...res.data() as UserData }
    }

    static async updateUser(id: string, userData: any) {
        await updateDoc(doc(db, collectionRef, id), {
            ...userData
        });
    }

    static async deleteUser(id: string) {
        await deleteDoc(doc(db, collectionRef, id))
    }

    static async getLikedVideos(id: string) {
        const q = query(collection(db, likeCollectionRef), where("userId", "==", id))

        const res = await getDocs(q)

        const videos = res.docs.map((doc) => doc.data().videoId as string)

        return videos
    }
} 