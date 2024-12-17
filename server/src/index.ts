import dotenv from "dotenv";
dotenv.config();


import path from "path";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import UserRoutes from "./routes/User";
import VideoRoutes from "./routes/Video";



const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);

app.use(
    cors({
        origin: "*",
        credentials: true
    })
)

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*") // watch it
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))
app.use(express.static(path.join(__dirname, 'public')))

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Use routes
app.use("/user", UserRoutes);
app.use("/video", VideoRoutes);

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
