import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetchUser from "../middlewares/fetchUser";
import User from "../models/User";
import Video from "../models/Video";

const router = Router();

router.get("/", fetchUser, async (req, res) => {
    const user = await User.getUser(req.user!.id);

    if (!user) {
        res.status(404).send("User not found");
        return;
    }

    res.json(user);
});

router.post("/", async (req, res) => {
    try {
        const { userName, email, password, phone, dob, address } = req.body;

        if (!userName || !email || !password || !phone || !dob || !address) {
            res.status(400).send("All fields are required");
            return;
        }

        // check if user already exists
        const user = await User.getUserByEmail(email);

        if (user) {
            res.status(400).send("User already exists");
            return;
        }

        const userId = await User.createUser(
            { 
                userName, 
                email,
                password, 
                role: null,
                dob,
                phone,
                address
            }
        );
        
        res.json({ userId });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.getUserByEmail(email);
        
        if (!user) {
            res.status(401).send("Invalid credentials");
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).send("Invalid credentials");
            return;
        }

        // generate token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!);

        res.json({ user, token });


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

router.put("/", fetchUser, async (req, res) => {
    try {
        await User.updateUser(req.user!.id, req.body);
        res.send("User updated");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

router.delete("/", fetchUser, async (req, res) => {
    try {
        await User.deleteUser(req.user!.id);
        res.send("User deleted");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

// get user's liked videos
router.get("/likes", fetchUser, async (req, res) => {
    try {
        const vidIds = await User.getLikedVideos(req.user!.id);
        const likes = await Promise.all(vidIds.map(async (id: string) => {
            const video = await Video.getVideo(id);
            return video;
        }))

        res.json(likes);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

export default router;